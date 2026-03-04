import { useEffect, useRef } from "react";
import "./HtmlFragment.scss";

function HtmlFragment({ html, onReady }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const hostNode = hostRef.current;
    if (!hostNode) {
      return undefined;
    }

    hostNode.innerHTML = html;

    const cleanup = typeof onReady === "function" ? onReady(hostNode) : undefined;

    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
      hostNode.innerHTML = "";
    };
  }, [html, onReady]);

  return <div ref={hostRef} style={{ display: "contents" }} />;
}

export default HtmlFragment;
