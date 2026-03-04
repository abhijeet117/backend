import "./LoginPanel.scss";
function LoginPanel() {
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
          Welcome Back
          <br />
          to Your <em>Vibe.</em>
        </h2>
        <p className="auth-desc">Your face remembers the music. Sign in and let your mood lead the way.</p>
        <span className="auth-hand-note">{"\u2190"} your music is waiting</span>
      </div>
      <div className="auth-left-footer">Moodify · AI Music Intelligence · 2026</div>
    </div>
  );
}

export default LoginPanel;

