import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createFaceLandmarker, detectExpression } from "../../expression/utils/utils.js";
import { FaceMoodContext } from "../../../state/FaceMoodContext.jsx";
import { useProfile } from "../../profile/hooks/useProfile.js";
import { saveExpressionApi } from "../../profile/services/profile.api.js";
import {
  getCameraStatusText,
  getMoodClassName,
  getMoodLabel,
  getMoodViewModel,
  mapExpressionToMood,
} from "../utils/moodMapper.js";

function useFaceMood() {
  const context = useContext(FaceMoodContext);
  const { addHistoryEntry } = useProfile();

  if (!context) {
    throw new Error("useFaceMood must be used within FaceMoodProvider.");
  }

  const { detectedMood, setDetectedMood } = context;
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDetectedMood(null);

    const init = async () => {
      setCameraError("");
      setIsCameraReady(false);

      try {
        const faceLandmarker = await createFaceLandmarker();
        if (cancelled) {
          faceLandmarker.close();
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          faceLandmarker.close();
          return;
        }

        const videoElement = videoRef.current;
        if (!videoElement) {
          stream.getTracks().forEach((track) => track.stop());
          faceLandmarker.close();
          return;
        }

        videoElement.srcObject = stream;
        await videoElement.play();

        landmarkerRef.current = faceLandmarker;
        streamRef.current = stream;
        setIsCameraReady(true);
      } catch (error) {
        setCameraError(error?.message || "Camera access is required for mood capture.");
      }
    };

    init();

    return () => {
      cancelled = true;
      setIsCameraReady(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, [setDetectedMood]);

  const handleCapture = useCallback(() => {
    if (!landmarkerRef.current || !videoRef.current) {
      return null;
    }

    const expression = detectExpression(landmarkerRef.current, videoRef.current);
    const nextMood = mapExpressionToMood(expression);
    setDetectedMood(nextMood);

    void (async () => {
      try {
        const response = await saveExpressionApi(nextMood);
        if (response.expression) {
          addHistoryEntry(response.expression);
        }
      } catch (error) {
        console.warn("Expression history sync failed:", error?.message || error);
      }
    })();

    return nextMood;
  }, [addHistoryEntry, setDetectedMood]);

  const moodViewModel = useMemo(() => getMoodViewModel(detectedMood), [detectedMood]);
  const moodClassName = useMemo(() => getMoodClassName(detectedMood), [detectedMood]);
  const moodLabel = useMemo(() => getMoodLabel(detectedMood), [detectedMood]);
  const cameraStatusText = useMemo(
    () => getCameraStatusText(cameraError, isCameraReady),
    [cameraError, isCameraReady]
  );

  return {
    videoRef,
    handleCapture,
    moodViewModel,
    moodClassName,
    moodLabel,
    cameraStatusText,
    canCapture: isCameraReady && !cameraError,
  };
}

export { useFaceMood };
