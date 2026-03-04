import "./WebcamCard.scss";
function WebcamCard({
  videoRef,
  onCapture,
  onStartAgain,
  moodClassName,
  moodLabel,
  cameraStatusText,
  canCapture,
  canStartAgain,
  isCaptured,
}) {
  const handlePrimaryAction = isCaptured ? onStartAgain : onCapture;
  const isButtonDisabled = isCaptured ? !canStartAgain : !canCapture;
  const buttonText = isCaptured ? "Start Again" : "Capture";

  return (
    <div className={`webcam-detect-card ${moodClassName || "happy"}`} id="detectCard">
      <div className="webcam-detect-header">
        <div className="detect-status">
          <div className="live-dot"></div>
          {isCaptured ? "Capture Paused" : "MediaPipe Active"}
        </div>
        <div className="mood-tag-card">{moodLabel || "Ready to capture"}</div>
      </div>

      <div className="webcam-viewport">
        <div className="webcam-overlay-grid"></div>
        <div className="webcam-scan-overlay">
          <div className="scan-line-dash"></div>
        </div>

        <video
          ref={videoRef}
          className={`webcam-feed-video${isCaptured ? " is-captured" : ""}`}
          autoPlay
          playsInline
          muted
        />

        <div className="webcam-capture-controls">
          <p className="cam-text">{cameraStatusText}</p>
          <button type="button" className="btn-start-cam" onClick={handlePrimaryAction} disabled={isButtonDisabled}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WebcamCard;

