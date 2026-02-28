import React from "react";
import { useExpressionDetector } from "../utils/utils";

const FaceExpression = () => {
  const { videoRef, expression } = useExpressionDetector();

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
