import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";

const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm";
const MODEL_ASSET_PATH =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

const getScore = (categories, categoryName) =>
  categories.find((item) => item.categoryName === categoryName)?.score || 0;

const sideMax = (categories, leftKey, rightKey) =>
  Math.max(getScore(categories, leftKey), getScore(categories, rightKey));

export const getExpressionFromBlendshapes = (categories = []) => {
  const smile = sideMax(categories, "mouthSmileLeft", "mouthSmileRight");
  const mouthOpen = getScore(categories, "jawOpen");
  const browDown = sideMax(categories, "browDownLeft", "browDownRight");
  const mouthFrown = sideMax(categories, "mouthFrownLeft", "mouthFrownRight");

  if (mouthOpen > 0.45) return "Shock";
  if (smile > 0.35) return "Smile";
  if (browDown > 0.25 && mouthFrown > 0.25) return "Sad";
  return "Neutral";
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
