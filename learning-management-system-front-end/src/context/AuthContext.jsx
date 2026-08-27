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

  // Initialize authentication state and handle OAuth callback tokens from URL
  useEffect(() => {
    async function initAuth() {
      if (typeof window === "undefined") {
        setIsLoading(false);
        return;
      }

      // Check if redirected from Strapi Google OAuth with tokens in query params
      const searchParams = new URLSearchParams(window.location.search);
      const directJwt = searchParams.get("jwt");
      const accessToken = searchParams.get("access_token") || searchParams.get("raw[access_token]");
      const idToken = searchParams.get("id_token") || searchParams.get("raw[id_token]");

      // Case 1: Direct JWT received from OAuth redirect
      if (directJwt) {
        try {
          localStorage.setItem("cps_jwt", directJwt);
          setToken(directJwt);
          const fullUser = await api.get("/users/me?populate=role", { token: directJwt });
          const resolvedUser = {
            ...fullUser,
            roleName: fullUser?.role?.name || "Student",
          };
          setUser(resolvedUser);
          window.history.replaceState({}, document.title, window.location.pathname);
          const target = getRoleDashboardPath(resolvedUser.roleName);
          router.replace(target);
          setIsLoading(false);
          return;
        } catch (err) {
          console.error("Failed to process direct JWT:", err);
        }
      }

      // Case 2: Google access_token or id_token returned by Strapi Provider redirect
      if (accessToken || idToken) {
        try {
          const query = accessToken
            ? `access_token=${encodeURIComponent(accessToken)}`
            : `id_token=${encodeURIComponent(idToken)}`;
          const res = await api.get(`/auth/google/callback?${query}`);

          if (res?.jwt) {
            const jwt = res.jwt;
            localStorage.setItem("cps_jwt", jwt);
            setToken(jwt);
            const fullUser = await api.get("/users/me?populate=role", { token: jwt });
            const resolvedUser = {
              ...fullUser,
              roleName: fullUser?.role?.name || "Student",
            };
            setUser(resolvedUser);
            window.history.replaceState({}, document.title, window.location.pathname);
            const target = getRoleDashboardPath(resolvedUser.roleName);
            router.replace(target);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.error("Google OAuth token exchange failed:", err);
        }
      }

      // Case 3: Regular existing session verification from localStorage
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
  }, [router]);

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
