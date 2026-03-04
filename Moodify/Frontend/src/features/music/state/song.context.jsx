import { createContext, useCallback, useMemo, useState } from "react";

const SongContext = createContext(null);

function SongProvider({ children }) {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [currentMood, setCurrentMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetSongState = useCallback(() => {
    setSongs([]);
    setCurrentSong(null);
    setCurrentMood("");
    setLoading(false);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      songs,
      currentSong,
      currentMood,
      loading,
      error,
      setSongs,
      setCurrentSong,
      setCurrentMood,
      setLoading,
      setError,
      resetSongState,
    }),
    [songs, currentSong, currentMood, loading, error, resetSongState]
  );

  return <SongContext.Provider value={value}>{children}</SongContext.Provider>;
}

export { SongContext, SongProvider };
