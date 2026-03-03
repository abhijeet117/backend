import { useCallback } from "react";
import backHomeHtml from "../../assets/fragments/dashboard/back-home-button.html?raw";
import HtmlFragment from "../common/HtmlFragment.jsx";

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
