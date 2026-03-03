import { useCallback } from "react";
import headerHtml from "../../assets/fragments/home/header.html?raw";
import HtmlFragment from "../common/HtmlFragment.jsx";

function Header({ onLogin, onRegister, onMood, onHowItWorks }) {
  const handleReady = useCallback(
    (node) => {
      const loginButton = node.querySelector(".btn-nav-login");
      const registerButton = node.querySelector(".btn-nav-start");
      const moodLink = node.querySelector('a[href="#moods"]');
      const howItWorksLink = node.querySelector('a[href="#how-it-works"]');

      const handleLogin = (event) => {
        event.preventDefault();
        onLogin?.();
      };

      const handleRegister = (event) => {
        event.preventDefault();
        onRegister?.();
      };

      const handleMood = (event) => {
        event.preventDefault();
        onMood?.();
      };

      const handleHowItWorks = (event) => {
        event.preventDefault();
        onHowItWorks?.();
      };

      loginButton?.addEventListener("click", handleLogin);
      registerButton?.addEventListener("click", handleRegister);
      moodLink?.addEventListener("click", handleMood);
      howItWorksLink?.addEventListener("click", handleHowItWorks);

      return () => {
        loginButton?.removeEventListener("click", handleLogin);
        registerButton?.removeEventListener("click", handleRegister);
        moodLink?.removeEventListener("click", handleMood);
        howItWorksLink?.removeEventListener("click", handleHowItWorks);
      };
    },
    [onHowItWorks, onLogin, onMood, onRegister]
  );

  return <HtmlFragment html={headerHtml} onReady={handleReady} />;
}

export default Header;
