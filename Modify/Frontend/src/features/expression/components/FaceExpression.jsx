import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

import React from "react";

const FaceExpression = () => {
  const videoRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const [expression, setExpression] = useState("Detecting...");

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm",
    );

    const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      },
      runningMode: "VIDEO",
      outputFaceBlendshapes: true,
      numFaces: 1,
    });

    faceLandmarkerRef.current = faceLandmarker;
    startCamera();
  };

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    videoRef.current.srcObject = stream;
    videoRef.current.addEventListener("loadeddata", predict);
  };

  const predict = async () => {
    const video = videoRef.current;
    const faceLandmarker = faceLandmarkerRef.current;

    const results = faceLandmarker.detectForVideo(video, performance.now());

    if (results.faceBlendshapes.length > 0) {
      const blend = results.faceBlendshapes[0].categories;

      const smile =
        blend.find((s) => s.categoryName === "mouthSmileLeft")?.score || 0;

      const mouthOpen =
        blend.find((s) => s.categoryName === "jawOpen")?.score || 0;

      const browDown =
        blend.find((s) => s.categoryName === "browDownLeft")?.score || 0;

      const mouthFrown =
        blend.find((s) => s.categoryName === "mouthFrownLeft")?.score || 0;

      // 🔥 Expression Logic
      if (smile > 0.6) {
        setExpression("😄 Smile");
      } else if (mouthOpen > 0.7) {
        setExpression("😲 Shock");
      } else if (browDown > 0.5 && mouthFrown > 0.4) {
        setExpression("😢 Sad");
      } else {
        setExpression("😐 Neutral");
      }
    }

    requestAnimationFrame(predict);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Expression Detector</h1>
      <h2>{expression}</h2>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "400px",
          borderRadius: "12px",
          transform: "scaleX(-1)",
        }}
      />
    </div>
  );
};

export default FaceExpression;
