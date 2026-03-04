import "./RegisterPanel.scss";
function RegisterPanel() {
  return (
    <div className="auth-left">
      <div className="auth-left-shapes">
        <div className="auth-shape"></div>
        <div className="auth-shape"></div>
        <div className="auth-shape"></div>
      </div>
      <div className="auth-brand">
        <div className="dot"></div>
        Moodify
      </div>
      <div className="auth-left-content">
        <h2 className="auth-headline">
          Join the
          <br />
          <em>Future</em> of
          <br />
          Listening.
        </h2>
        <p className="auth-desc">No playlists to build. No genres to pick. Just your face and the music that fits.</p>
        <span className="auth-hand-note">it reads you perfectly {"\u266A"}</span>
      </div>
      <div className="auth-left-footer">Free forever · No credit card needed</div>
    </div>
  );
}

export default RegisterPanel;

