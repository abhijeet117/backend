import { useCallback, useEffect, useRef } from "react";
import { registerFormHtml } from "../../assets/templates/fragments.js";
import HtmlFragment from "../common/HtmlFragment.jsx";
import "./RegisterForm.scss";

function RegisterForm({ onRegister, onGoLogin, onGoHome, errorMessage, isLoading }) {
  const feedbackElRef = useRef(null);
  const errorRef = useRef(errorMessage);
  const loadingRef = useRef(isLoading);

  useEffect(() => {
    errorRef.current = errorMessage;
    loadingRef.current = isLoading;

    if (!feedbackElRef.current) {
      return;
    }

    const feedbackText = errorRef.current || (loadingRef.current ? "Creating account..." : "");
    feedbackElRef.current.textContent = feedbackText || "\u00A0";
    feedbackElRef.current.style.visibility = feedbackText ? "visible" : "hidden";
    feedbackElRef.current.style.color = errorRef.current ? "var(--accent-coral)" : "var(--text-secondary)";
    feedbackElRef.current.setAttribute("role", errorRef.current ? "alert" : "status");
  }, [errorMessage, isLoading]);

  const handleReady = useCallback(
    (node) => {
      const registerButton = node.querySelector(".btn-form-primary");
      const nameInput = node.querySelector("#register-full-name");
      const emailInput = node.querySelector("#register-email");
      const usernameInput = node.querySelector("#register-username");
      const passwordInput = node.querySelector("#register-password");
      const passwordGroup = passwordInput?.closest(".form-group");
      const formLinks = node.querySelectorAll(".form-link");
      const loginLink = formLinks[0];
      const homeLink = formLinks[1];
      const normalizedLinks = [loginLink, homeLink].filter(Boolean);

      const feedbackEl = document.createElement("p");
      feedbackEl.className = "form-link-text auth-form-feedback";
      feedbackEl.textContent = "\u00A0";
      feedbackEl.style.visibility = "hidden";
      passwordGroup?.insertAdjacentElement("afterend", feedbackEl);
      feedbackElRef.current = feedbackEl;

      const handleRegister = (event) => {
        event.preventDefault();
        const fallbackUsername = (nameInput?.value || "").trim().replace(/\s+/g, "_");

        onRegister?.({
          fullName: (nameInput?.value || "").trim(),
          email: emailInput?.value?.trim() || "",
          username: (usernameInput?.value || "").trim() || fallbackUsername,
          password: passwordInput?.value || "",
        });
      };

      const handleLogin = (event) => {
        event.preventDefault();
        onGoLogin?.();
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

      registerButton?.addEventListener("click", handleRegister);
      loginLink?.addEventListener("click", handleLogin);
      homeLink?.addEventListener("click", handleHome);

      return () => {
        registerButton?.removeEventListener("click", handleRegister);
        loginLink?.removeEventListener("click", handleLogin);
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
    [onGoHome, onGoLogin, onRegister]
  );

  return <HtmlFragment html={registerFormHtml} onReady={handleReady} />;
}

export default RegisterForm;
