import { createContext, createElement, useCallback, useEffect, useMemo, useState } from "react";

import { getData, register, login, logout } from "./services/auth.api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const response = await getData();
      setUser(response?.user ?? null);
      return response?.user ?? null;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const handleLogin = useCallback(async (identifier, password) => {
    setLoading(true);

    try {
      const response = await login(identifier, password);
      setUser(response?.user ?? null);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRegister = useCallback(async (userName, email, password) => {
    setLoading(true);

    try {
      const response = await register(userName, email, password);
      setUser(response?.user ?? null);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setLoading(true);

    try {
      await logout();
    } catch {
      // Ignore logout API failure and clear local user state.
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const value = useMemo(
    () => ({
      user,
      loading,
      handleLogin,
      handleRegister,
      handleLogout,
      refreshUser,
    }),
    [user, loading, handleLogin, handleRegister, handleLogout, refreshUser],
  );

  return createElement(AuthContext.Provider, { value }, children);
}
