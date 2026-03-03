import { useCallback, useContext, useMemo } from "react";
import { AuthContext } from "../auth.context.jsx";
import { loginApi, logoutApi, registerApi } from "../services/auth.api.js";

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  const { setError, setLoading, setUser, ...state } = context;
  const isAuthenticated = useMemo(() => Boolean(state.user), [state.user]);

  const handleLogin = useCallback(
    async (credentials) => {
      const identifier = typeof credentials?.identifier === "string" ? credentials.identifier.trim() : "";
      const password = typeof credentials?.password === "string" ? credentials.password : "";
      const loginPayload = {
        password,
        ...(identifier.includes("@") ? { email: identifier } : { username: identifier }),
      };

      setLoading(true);
      setError(null);

      try {
        const response = await loginApi(loginPayload);
        setUser(response.user);
        return response;
      } catch (error) {
        setUser(null);
        setError(error?.message || "Login failed.");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, setUser]
  );

  const handleRegister = useCallback(
    async (payload) => {
      const registerPayload = {
        fullName: typeof payload?.fullName === "string" ? payload.fullName.trim() : "",
        email: typeof payload?.email === "string" ? payload.email.trim() : "",
        username: typeof payload?.username === "string" ? payload.username.trim() : "",
        password: typeof payload?.password === "string" ? payload.password : "",
      };

      setLoading(true);
      setError(null);

      try {
        const response = await registerApi(registerPayload);
        setUser(response.user);
        return response;
      } catch (error) {
        setUser(null);
        setError(error?.message || "Registration failed.");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setError, setLoading, setUser]
  );

  const handleLogout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await logoutApi();
    } catch (error) {
      setError(error?.message || "Logout failed.");
      throw error;
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, [setError, setLoading, setUser]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    ...state,
    isAuthenticated,
    handleLogin,
    handleRegister,
    handleLogout,
    clearError,
  };
}

export { useAuth };
