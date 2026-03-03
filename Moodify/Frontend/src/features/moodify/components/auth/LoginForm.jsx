import { useCallback, useEffect, useRef } from "react";
import loginFormHtml from "../../assets/fragments/auth/login-form.html?raw";
import HtmlFragment from "../common/HtmlFragment.jsx";

function LoginForm({ onLogin, onGoRegister, onGoHome, errorMessage, isLoading }) {
  const feedbackElRef = useRef(null);
  const errorRef = useRef(errorMessage);
  const loadingRef = useRef(isLoading);

  useEffect(() => {
    errorRef.current = errorMessage;
    loadingRef.current = isLoading;

    if (!feedbackElRef.current) {
      return;
    }

    const feedbackText = errorRef.current || (loadingRef.current ? "Signing in..." : "");
    feedbackElRef.current.textContent = feedbackText || "\u00A0";
    feedbackElRef.current.style.visibility = feedbackText ? "visible" : "hidden";
    feedbackElRef.current.style.color = errorRef.current ? "var(--accent-coral)" : "var(--text-secondary)";
    feedbackElRef.current.setAttribute("role", errorRef.current ? "alert" : "status");
  }, [errorMessage, isLoading]);

  const handleReady = useCallback(
    (node) => {
      const loginButton = node.querySelector(".btn-form-primary");
      const identifierInput = node.querySelector("#login-identifier");
      const passwordInput = node.querySelector("#login-password");
      const passwordGroup = passwordInput?.closest(".form-group");
      const formLinks = node.querySelectorAll(".form-link");
      const registerLink = formLinks[0];
      const homeLink = formLinks[1];
      const normalizedLinks = [registerLink, homeLink].filter(Boolean);

      const feedbackEl = document.createElement("p");
      feedbackEl.className = "form-link-text auth-form-feedback";
      feedbackEl.textContent = "\u00A0";
      feedbackEl.style.visibility = "hidden";
      passwordGroup?.insertAdjacentElement("afterend", feedbackEl);
      feedbackElRef.current = feedbackEl;

      const handleLogin = (event) => {
        event.preventDefault();
        onLogin?.({
          identifier: identifierInput?.value?.trim() || "",
          password: passwordInput?.value || "",
        });
      };

      const handleRegister = (event) => {
        event.preventDefault();
        onGoRegister?.();
      };

      const handleHome = (event) => {
        event.preventDefault();
        onGoHome?.();
      };

      const handleLinkKeydown = (event) => {
        if (event.key === " " || event.key === "Spacebar") {
          event.preventDefault();
          event.currentTarget.click();
        }
      };

      normalizedLinks.forEach((link) => {
        link.setAttribute("href", "#");
        link.setAttribute("role", "button");
        link.addEventListener("keydown", handleLinkKeydown);
      });

      loginButton?.addEventListener("click", handleLogin);
      registerLink?.addEventListener("click", handleRegister);
      homeLink?.addEventListener("click", handleHome);

      return () => {
        loginButton?.removeEventListener("click", handleLogin);
        registerLink?.removeEventListener("click", handleRegister);
        homeLink?.removeEventListener("click", handleHome);
        normalizedLinks.forEach((link) => {
          link.removeEventListener("keydown", handleLinkKeydown);
        });
        if (feedbackElRef.current) {
          feedbackElRef.current.remove();
          feedbackElRef.current = null;
        }
      };
    },
    [onGoHome, onGoRegister, onLogin]
  );

  return <HtmlFragment html={loginFormHtml} onReady={handleReady} />;
}

export default LoginForm;
