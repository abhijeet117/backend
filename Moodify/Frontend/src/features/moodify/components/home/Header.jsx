import "./Header.scss";
function Header({ onLogin, onRegister, onMood, onHowItWorks }) {
  return (
    <nav>
      <div className="nav-logo">
        Moodify<span></span>
      </div>
      <ul className="nav-links">
        <li>
          <a
            href="#how-it-works"
            onClick={(event) => {
              event.preventDefault();
              onHowItWorks?.();
            }}
          >
            How It Works
          </a>
        </li>
        <li>
          <a
            href="#moods"
            onClick={(event) => {
              event.preventDefault();
              onMood?.();
            }}
          >
            Moods
          </a>
        </li>
        <li>
          <a href="#">Discover</a>
        </li>
      </ul>
      <div className="nav-cta">
        <button
          className="btn-nav-login"
          onClick={(event) => {
            event.preventDefault();
            onLogin?.();
          }}
        >
          Sign In
        </button>
        <button
          className="btn-nav-start"
          onClick={(event) => {
            event.preventDefault();
            onRegister?.();
          }}
        >
          Start Free
        </button>
      </div>
    </nav>
  );
}

export default Header;

