function WebcamCard({ videoRef, onCapture, moodClassName, moodLabel, cameraStatusText, canCapture }) {
  return (
    <div className={`webcam-detect-card ${moodClassName || "happy"}`} id="detectCard">
      <div className="webcam-detect-header">
        <div className="detect-status">
          <div className="live-dot"></div>
          MediaPipe Active
        </div>
        <div className="mood-tag-card">{moodLabel || "Ready to capture"}</div>
      </div>

      <div className="webcam-viewport">
        <div className="webcam-overlay-grid"></div>
        <div className="webcam-scan-overlay">
          <div className="scan-line-dash"></div>
        </div>

        <video ref={videoRef} className="webcam-feed-video" autoPlay playsInline muted />

        <div className="webcam-capture-controls">
          <p className="cam-text">{cameraStatusText}</p>
          <button type="button" className="btn-start-cam" onClick={onCapture} disabled={!canCapture}>
            Capture
          </button>
        </div>
      </div>
    </div>
  );
}

export default WebcamCard;
