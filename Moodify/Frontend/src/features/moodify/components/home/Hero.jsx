import { useCallback } from "react";
import heroHtml from "../../assets/fragments/home/hero.html?raw";
import HtmlFragment from "../common/HtmlFragment.jsx";

function Hero({ onStartVibe, onHowItWorks }) {
  const handleReady = useCallback(
    (node) => {
      const startButton = node.querySelector(".btn-primary");
      const howItWorksButton = node.querySelector(".btn-secondary");

      const handleStart = (event) => {
        event.preventDefault();
        onStartVibe?.();
      };

      const handleHowItWorks = (event) => {
        event.preventDefault();
        onHowItWorks?.();
      };

      startButton?.addEventListener("click", handleStart);
      howItWorksButton?.addEventListener("click", handleHowItWorks);

      return () => {
        startButton?.removeEventListener("click", handleStart);
        howItWorksButton?.removeEventListener("click", handleHowItWorks);
      };
    },
    [onHowItWorks, onStartVibe]
  );

  return <HtmlFragment html={heroHtml} onReady={handleReady} />;
}

export default Hero;
