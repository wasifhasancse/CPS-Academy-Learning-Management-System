"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

/**
 * Returns the destination dashboard path based on the user's role
 * @param {string} [roleName]
 * @returns {string}
 */
export function getRoleDashboardPath(roleName) {
  const normalized = (roleName || "").toLowerCase().replace(/\s+/g, "");
  switch (normalized) {
    case "admin":
      return "/dashboard/admin";
    case "contentmanager":
    case "manager":
      return "/dashboard/manager";
    case "instructor":
    case "teacher":
      return "/dashboard/teacher";
    case "student":
    default:
      return "/dashboard/student";
  }
}

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state from local storage and verify with backend
  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem("cps_jwt");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        setToken(storedToken);
        const me = await api.get("/users/me?populate=role", { token: storedToken });
        if (me) {
          const resolvedUser = {
            ...me,
            roleName: me?.role?.name || "Student",
          };
          setUser(resolvedUser);
        }
      } catch (err) {
        console.error("Auth session expired or invalid:", err);
        localStorage.removeItem("cps_jwt");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = useCallback(
    async (identifier, password) => {
      const response = await api.post("/auth/local", {
        identifier,
        password,
      });

      if (response?.jwt && response?.user) {
        const jwt = response.jwt;
        localStorage.setItem("cps_jwt", jwt);
        setToken(jwt);

        // Fetch user with role populated
        const fullUser = await api.get("/users/me?populate=role", { token: jwt });
        const resolvedUser = {
          ...fullUser,
          roleName: fullUser?.role?.name || "Student",
        };
        setUser(resolvedUser);

        const target = getRoleDashboardPath(resolvedUser.roleName);
        router.push(target);
        return resolvedUser;
      }
      throw new Error("Invalid response received from authentication server.");
    },
    [router]
  );

  const register = useCallback(
    async ({ username, email, password, role = "Student" }) => {
      const response = await api.post("/auth/local/register", {
        username,
        email,
        password,
      });

      if (response?.jwt && response?.user) {
        const jwt = response.jwt;
        localStorage.setItem("cps_jwt", jwt);
        setToken(jwt);

        const fullUser = await api.get("/users/me?populate=role", { token: jwt });
        const resolvedUser = {
          ...fullUser,
          roleName: fullUser?.role?.name || role || "Student",
        };
        setUser(resolvedUser);

        const target = getRoleDashboardPath(resolvedUser.roleName);
        router.push(target);
        return resolvedUser;
      }
      throw new Error("Registration could not be completed.");
    },
    [router]
  );

  const setAuthData = useCallback(
    async (jwt) => {
      localStorage.setItem("cps_jwt", jwt);
      setToken(jwt);

      const fullUser = await api.get("/users/me?populate=role", { token: jwt });
      const resolvedUser = {
        ...fullUser,
        roleName: fullUser?.role?.name || "Student",
      };
      setUser(resolvedUser);

      const target = getRoleDashboardPath(resolvedUser.roleName);
      router.push(target);
      return resolvedUser;
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("cps_jwt");
    setToken(null);
    setUser(null);
    router.push("/auth/login");
  }, [router]);

  const value = {
    user,
    token,
    role: user?.roleName || null,
    isAuthenticated: Boolean(user && token),
    isLoading,
    login,
    register,
    logout,
    setAuthData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
