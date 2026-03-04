import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";
import { mapEmotionToMood, toDisplayMood } from "../../../utils/mapEmotionToMood.js";

const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm";
const MODEL_ASSET_PATH =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

export const getExpressionFromBlendshapes = (categories = []) => {
  return toDisplayMood(mapEmotionToMood(categories));
};

export const createFaceLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(WASM_PATH);

  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_ASSET_PATH },
    runningMode: "VIDEO",
    outputFaceBlendshapes: true,
    numFaces: 1,
  });
};

export const startVideoStream = async (videoElement) => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoElement.srcObject = stream;
  await videoElement.play();

  if (videoElement.readyState < 2) {
    await new Promise((resolve) => {
      const onLoadedData = () => {
        videoElement.removeEventListener("loadeddata", onLoadedData);
        resolve();
      };
      videoElement.addEventListener("loadeddata", onLoadedData);
    });
  }

  return stream;
};

export const detectExpression = (faceLandmarker, videoElement) => {
  if (!faceLandmarker || !videoElement) return "Detecting...";

  const results = faceLandmarker.detectForVideo(videoElement, performance.now());
  const categories = results?.faceBlendshapes?.[0]?.categories;

  if (!categories?.length) return "Detecting...";
  return getExpressionFromBlendshapes(categories);
};

export const detectBlendshapeCategories = (faceLandmarker, videoElement) => {
  if (!faceLandmarker || !videoElement) {
    return [];
  }

  const results = faceLandmarker.detectForVideo(videoElement, performance.now());
  const categories = results?.faceBlendshapes?.[0]?.categories;
  return Array.isArray(categories) ? categories : [];
};

export const setupExpressionDetector = async (videoElement, onExpression) => {
  const faceLandmarker = await createFaceLandmarker();
  const stream = await startVideoStream(videoElement);

  let frameId = null;
  let stopped = false;
  let lastVideoTime = -1;

  const loop = () => {
    if (stopped) return;

    if (videoElement.readyState < 2) {
      frameId = requestAnimationFrame(loop);
      return;
    }

    if (videoElement.currentTime === lastVideoTime) {
      frameId = requestAnimationFrame(loop);
      return;
    }

    lastVideoTime = videoElement.currentTime;

    try {
      onExpression(detectExpression(faceLandmarker, videoElement));
    } catch (error) {
      console.error("Expression detection frame failed:", error);
    }

    frameId = requestAnimationFrame(loop);
  };

  loop();

  return () => {
    stopped = true;
    if (frameId !== null) cancelAnimationFrame(frameId);
    stream.getTracks().forEach((track) => track.stop());
    if (faceLandmarker?.close) faceLandmarker.close();
  };
};

export const useExpressionDetector = () => {
  const videoRef = useRef(null);
  const [expression, setExpression] = useState("Detecting...");

  useEffect(() => {
    let cleanup = null;
    let unmounted = false;

    const init = async () => {
      try {
        if (!videoRef.current) return;
        cleanup = await setupExpressionDetector(videoRef.current, setExpression);
        if (unmounted && cleanup) cleanup();
      } catch (error) {
        console.error("Face expression init failed:", error);
        setExpression("Camera/Model error");
      }
    };

    init();

    return () => {
      unmounted = true;
      if (cleanup) cleanup();
    };
  }, []);

  return { videoRef, expression };
};
