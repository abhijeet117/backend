import { createContext, createElement, useCallback, useEffect, useMemo, useState } from "react";

import { getData, register, login } from "./services/auth.api";

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

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const value = useMemo(
    () => ({
      user,
      loading,
      handleLogin,
      handleRegister,
      refreshUser,
    }),
    [user, loading, handleLogin, handleRegister, refreshUser],
  );

  return createElement(AuthContext.Provider, { value }, children);
}
