import { createContext, createElement, useState } from "react";

import { register, login } from "./services/auth.api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (username, password) => {
    setLoading(true);

    try {
      const response = await login(username, password);
      setUser(response?.user ?? null);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (username, email, password) => {
    setLoading(true);

    try {
      const response = await register(username, email, password);
      setUser(response?.user ?? null);
      return response;
    } finally {
      setLoading(false);
    }
  };

  return createElement(
    AuthContext.Provider,
    { value: { user, loading, handleLogin, handleRegister } },
    children
  );
}
