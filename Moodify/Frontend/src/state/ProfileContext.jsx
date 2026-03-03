import { createContext, useCallback, useMemo, useState } from "react";

const ProfileContext = createContext(null);

function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetProfileState = useCallback(() => {
    setProfile(null);
    setHistory([]);
    setLoading(false);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      history,
      loading,
      error,
      setProfile,
      setHistory,
      setLoading,
      setError,
      resetProfileState,
    }),
    [profile, history, loading, error, resetProfileState]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export { ProfileContext, ProfileProvider };
