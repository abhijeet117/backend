import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createFaceLandmarker, detectBlendshapeCategories } from "../../expression/utils/utils.js";
import { FaceMoodContext } from "../../../state/FaceMoodContext.jsx";
import { useProfile } from "../../profile/hooks/useProfile.js";
import { saveExpressionApi } from "../../profile/services/profile.api.js";
import { useMoodSongs } from "../../music/hooks/useMoodSongs.js";
import { getEmotionScores, mapEmotionToMood, toDisplayMood } from "../../../utils/mapEmotionToMood.js";
import {
  getCameraStatusText,
  getMoodClassName,
  getMoodLabel,
  getMoodViewModel,
} from "../utils/moodMapper.js";

const IS_DEBUG = Boolean(import.meta.env.DEV);

function useFaceMood() {
  const context = useContext(FaceMoodContext);
  const { addHistoryEntry } = useProfile();
  const { fetchSongsByMood, resetSongPlayback } = useMoodSongs();

  if (!context) {
    throw new Error("useFaceMood must be used within FaceMoodProvider.");
  }

  const { detectedMood, setDetectedMood } = context;
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const initRequestRef = useRef(0);
  const [cameraError, setCameraError] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  const releaseCameraResources = useCallback(
    ({ clearVideoElement = false } = {}) => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }

      if (clearVideoElement && videoRef.current) {
        const videoElement = videoRef.current;
        try {
          videoElement.pause();
        } catch {
          // no-op
        }
        videoElement.srcObject = null;
      }

      setIsCameraReady(false);
    },
    []
  );

  const initializeCamera = useCallback(async () => {
    const requestId = initRequestRef.current + 1;
    initRequestRef.current = requestId;
    setCameraError("");
    setIsCameraReady(false);

    try {
      const faceLandmarker = await createFaceLandmarker();
      if (requestId !== initRequestRef.current) {
        faceLandmarker.close();
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      if (requestId !== initRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        faceLandmarker.close();
        return false;
      }

      const videoElement = videoRef.current;
      if (!videoElement) {
        stream.getTracks().forEach((track) => track.stop());
        faceLandmarker.close();
        return false;
      }

      videoElement.srcObject = stream;
      await videoElement.play();

      if (requestId !== initRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        faceLandmarker.close();
        return false;
      }

      landmarkerRef.current = faceLandmarker;
      streamRef.current = stream;
      setIsCameraReady(true);
      return true;
    } catch (error) {
      setCameraError(error?.message || "Camera access is required for mood capture.");
      return false;
    }
  }, []);

  useEffect(() => {
    const initTimer = window.setTimeout(() => {
      setDetectedMood(null);
      void initializeCamera();
    }, 0);

    return () => {
      window.clearTimeout(initTimer);
      initRequestRef.current += 1;
      releaseCameraResources({ clearVideoElement: true });
    };
  }, [initializeCamera, releaseCameraResources, setDetectedMood]);

  const handleCapture = useCallback(() => {
    if (isCaptured) {
      return null;
    }

    if (!landmarkerRef.current || !videoRef.current) {
      if (IS_DEBUG) {
        console.warn("[FaceMood Hook] Capture attempted before camera initialization.");
      }
      return null;
    }

    const blendshapeCategories = detectBlendshapeCategories(landmarkerRef.current, videoRef.current);
    const emotionScores = getEmotionScores(blendshapeCategories);
    if (IS_DEBUG) {
      console.log("Smile:", emotionScores.smileScore);
      console.log("Sad:", emotionScores.sadScore);
      console.log("Shock:", emotionScores.shockScore);
      console.log("jawOpen:", emotionScores.jawOpenScore);
      console.log("eyeWide:", emotionScores.eyeWideScore);
      console.log("mouthFrown:", emotionScores.mouthFrownScore);
      console.log("browDown:", emotionScores.browDownScore);
      console.debug("[FaceMood Hook] Blendshape scores", {
        smile: emotionScores.smileScore,
        mouthFrown: emotionScores.mouthFrownScore,
        mouthLowerDown: emotionScores.mouthLowerDownScore,
        jawOpen: emotionScores.jawOpenScore,
        eyeWide: emotionScores.eyeWideScore,
        browInnerUp: emotionScores.browInnerUpScore,
        mouthFunnel: emotionScores.mouthFunnelScore,
        browDown: emotionScores.browDownScore,
        sad: emotionScores.sadScore,
        shock: emotionScores.shockScore,
      });
      console.debug(
        "[FaceMood Hook] Top blendshapes",
        [...blendshapeCategories]
          .sort((a, b) => (Number(b?.score) || 0) - (Number(a?.score) || 0))
          .slice(0, 8)
          .map((item) => ({
            name: item?.categoryName || "",
            score: Number(item?.score || 0).toFixed(3),
          }))
      );
    }

    const songMood = mapEmotionToMood(blendshapeCategories, emotionScores);
    const nextMood = toDisplayMood(songMood);
    if (IS_DEBUG) {
      console.debug("[FaceMood Hook] Capture result", {
        blendshapeCount: blendshapeCategories.length,
        dashboardMood: nextMood,
        apiMood: songMood,
      });
    }

    const videoElement = videoRef.current;
    if (videoElement) {
      try {
        videoElement.pause();
      } catch {
        // no-op
      }
    }

    setIsCaptured(true);
    setDetectedMood(nextMood);

    void (async () => {
      try {
        await fetchSongsByMood(songMood);
        if (IS_DEBUG) {
          console.debug("[FaceMood Hook] Song fetch completed for mood", { songMood });
        }
      } catch (error) {
        console.warn("Song match failed:", error?.message || error);
      }

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
  }, [addHistoryEntry, fetchSongsByMood, isCaptured, setDetectedMood]);

  const handleStartAgain = useCallback(async () => {
    if (isRestarting) {
      return;
    }

    setIsRestarting(true);
    setCameraError("");
    setIsCaptured(false);
    setDetectedMood(null);
    resetSongPlayback();

    initRequestRef.current += 1;
    releaseCameraResources({ clearVideoElement: true });
    await initializeCamera();
    setIsRestarting(false);
  }, [initializeCamera, isRestarting, releaseCameraResources, resetSongPlayback, setDetectedMood]);

  const moodViewModel = useMemo(() => getMoodViewModel(detectedMood), [detectedMood]);
  const moodClassName = useMemo(() => getMoodClassName(detectedMood), [detectedMood]);
  const moodLabel = useMemo(() => getMoodLabel(detectedMood), [detectedMood]);
  const cameraStatusText = useMemo(
    () =>
      isCaptured
        ? "Mood captured. Playback started. Click Start Again."
        : getCameraStatusText(cameraError, isCameraReady),
    [cameraError, isCameraReady, isCaptured]
  );

  return {
    videoRef,
    handleCapture,
    handleStartAgain,
    isCaptured,
    isRestarting,
    moodViewModel,
    moodClassName,
    moodLabel,
    cameraStatusText,
    canCapture: isCameraReady && !cameraError && !isCaptured && !isRestarting,
    canStartAgain: !isRestarting,
  };
}

export { useFaceMood };
