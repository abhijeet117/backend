import { useCallback } from "react";
import registerFormHtml from "../../assets/fragments/auth/register-form.html?raw";
import HtmlFragment from "../common/HtmlFragment.jsx";

function RegisterForm({ onRegister, onGoLogin, onGoHome }) {
  const handleReady = useCallback(
    (node) => {
      const registerButton = node.querySelector(".btn-form-primary");
      const nameInput = node.querySelector("#register-full-name");
      const emailInput = node.querySelector("#register-email");
      const usernameInput = node.querySelector("#register-username");
      const passwordInput = node.querySelector("#register-password");
      const formLinks = node.querySelectorAll(".form-link");
      const loginLink = formLinks[0];
      const homeLink = formLinks[1];
      const normalizedLinks = [loginLink, homeLink].filter(Boolean);

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
      };
    },
    [onGoHome, onGoLogin, onRegister]
  );

  return <HtmlFragment html={registerFormHtml} onReady={handleReady} />;
}

export default RegisterForm;
