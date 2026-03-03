import { createContext, useMemo, useState } from "react";

const FaceMoodContext = createContext(null);

function FaceMoodProvider({ children }) {
  const [detectedMood, setDetectedMood] = useState(null);

  const value = useMemo(
    () => ({
      detectedMood,
      setDetectedMood,
    }),
    [detectedMood]
  );

  return <FaceMoodContext.Provider value={value}>{children}</FaceMoodContext.Provider>;
}

export { FaceMoodContext, FaceMoodProvider };
