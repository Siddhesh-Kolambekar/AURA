import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { apiRequest } from "../services/api";

const TOKEN_KEY = "aura.auth.token";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(async () => {
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }, []);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      let savedToken;
      try {
        savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!savedToken) return;

        const response = await apiRequest("/auth/me", { token: savedToken });
        if (active) {
          setToken(savedToken);
          setUser(response.data.user);
        }
      } catch (error) {
        if (error.status === 401) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        } else {
          setToken(savedToken);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const authenticate = useCallback(async (endpoint, values) => {
    const response = await apiRequest(endpoint, { method: "POST", body: values });
    await SecureStore.setItemAsync(TOKEN_KEY, response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  }, []);

  const register = useCallback(
    async (values) => {
      await apiRequest("/auth/register", { method: "POST", body: values });
      return authenticate("/auth/login", {
        email: values.email,
        password: values.password
      });
    },
    [authenticate]
  );
  const login = useCallback(
    (values) => authenticate("/auth/login", values),
    [authenticate]
  );

  const logout = useCallback(async () => {
    const currentToken = token;
    try {
      if (currentToken) {
        await apiRequest("/auth/logout", { method: "POST", token: currentToken });
      }
    } finally {
      await clearSession();
    }
  }, [clearSession, token]);

  const value = useMemo(
    () => ({
      token,
      user,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout
    }),
    [token, user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
