import { useCallback } from "react";
import { backHomeHtml } from "../../assets/templates/fragments.js";
import HtmlFragment from "../common/HtmlFragment.jsx";
import "./BackHomeButton.scss";

function BackHomeButton({ onBackHome }) {
  const handleReady = useCallback(
    (node) => {
      const button = node.querySelector(".btn-secondary");

      const handleClick = (event) => {
        event.preventDefault();
        onBackHome?.();
      };

      button?.addEventListener("click", handleClick);

      return () => {
        button?.removeEventListener("click", handleClick);
      };
    },
    [onBackHome]
  );

  return <HtmlFragment html={backHomeHtml} onReady={handleReady} />;
}

export default BackHomeButton;
