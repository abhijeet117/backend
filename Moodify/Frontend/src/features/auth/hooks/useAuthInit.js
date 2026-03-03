import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../auth.context.jsx";
import { getMeApi } from "../services/auth.api.js";

function useAuthInit() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthInit must be used within AuthProvider.");
  }

  const { setUser, setLoading, setError } = context;
  const initializedRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    let active = true;

    const init = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getMeApi();
        if (!active) {
          return;
        }
        setUser(response.user || null);
      } catch (error) {
        if (!active) {
          return;
        }

        setUser(null);
        if (error?.status && error.status !== 401) {
          setError(error.message || "Failed to restore session.");
        }
      } finally {
        if (active) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    init();

    return () => {
      active = false;
    };
  }, [setError, setLoading, setUser]);

  return { isInitialized };
}

export { useAuthInit };
