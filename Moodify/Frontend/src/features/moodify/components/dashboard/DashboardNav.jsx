import { useCallback } from "react";
import { dashboardNavHtml } from "../../assets/templates/fragments.js";
import HtmlFragment from "../common/HtmlFragment.jsx";
import "./DashboardNav.scss";

function DashboardNav({ onLogout }) {
  const handleReady = useCallback(
    (node) => {
      const avatar = node.querySelector(".dash-avatar");

      const handleAvatarClick = (event) => {
        event.preventDefault();
        onLogout?.();
      };

      const handleAvatarKeyDown = (event) => {
        if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
          event.preventDefault();
          onLogout?.();
        }
      };

      if (avatar) {
        avatar.setAttribute("role", "button");
        avatar.setAttribute("tabindex", "0");
        avatar.setAttribute("aria-label", "Logout");
        avatar.title = "Logout";
      }

      avatar?.addEventListener("click", handleAvatarClick);
      avatar?.addEventListener("keydown", handleAvatarKeyDown);

      return () => {
        avatar?.removeEventListener("click", handleAvatarClick);
        avatar?.removeEventListener("keydown", handleAvatarKeyDown);
      };
    },
    [onLogout]
  );

  return <HtmlFragment html={dashboardNavHtml} onReady={handleReady} />;
}

export default DashboardNav;
