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
      return "/dashboard/instructor";
    case "student":
    default:
      return "/dashboard/student";
  }
}

export function AuthProvider({ children }) {
  const router = useRouter();

  // Instant hydration from localStorage
  const [token, setToken] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cps_jwt") || null;
    }
    return null;
  });

  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("cps_user");
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("cps_jwt");
    }
    return true;
  });

  // Background token verification & OAuth callback handler
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
          let fullUser = null;
          try {
            fullUser = await api.get("/users/me?populate=role", { token: directJwt });
          } catch {
            fullUser = null;
          }
          const resolvedUser = {
            ...(fullUser || {}),
            roleName: fullUser?.role?.name || "Student",
          };
          localStorage.setItem("cps_user", JSON.stringify(resolvedUser));
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
            let fullUser = null;
            try {
              fullUser = await api.get("/users/me?populate=role", { token: jwt });
            } catch {
              fullUser = res.user;
            }
            const resolvedUser = {
              ...(fullUser || res.user),
              roleName: fullUser?.role?.name || res.user?.role?.name || "Student",
            };
            localStorage.setItem("cps_user", JSON.stringify(resolvedUser));
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

      // Case 3: Verify existing token in background without blocking UI
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
          localStorage.setItem("cps_user", JSON.stringify(resolvedUser));
          setUser(resolvedUser);
        }
      } catch (err) {
        console.warn("Session expired or invalid:", err);
        localStorage.removeItem("cps_jwt");
        localStorage.removeItem("cps_user");
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

        let resolvedRole = response.user?.role?.name;
        let fullUser = response.user;

        // If role not populated in local auth response, fetch user with role
        if (!resolvedRole) {
          try {
            fullUser = await api.get("/users/me?populate=role", { token: jwt });
            resolvedRole = fullUser?.role?.name;
          } catch {
            resolvedRole = "Student";
          }
        }

        const resolvedUser = {
          ...(fullUser || response.user),
          roleName: resolvedRole || "Student",
        };

        localStorage.setItem("cps_user", JSON.stringify(resolvedUser));
        setUser(resolvedUser);
        setIsLoading(false);

        const target = getRoleDashboardPath(resolvedUser.roleName);
        router.push(target);
        return resolvedUser;
      }
      throw new Error("Invalid response received from authentication server.");
    },
    [router]
  );

  const register = useCallback(
    async ({ username, email, password }) => {
      const response = await api.post("/auth/local/register", {
        username,
        email,
        password,
      });

      if (response?.jwt && response?.user) {
        const jwt = response.jwt;
        localStorage.setItem("cps_jwt", jwt);
        setToken(jwt);

        let resolvedRole = response.user?.role?.name;
        let fullUser = response.user;

        if (!resolvedRole) {
          try {
            fullUser = await api.get("/users/me?populate=role", { token: jwt });
            resolvedRole = fullUser?.role?.name;
          } catch {
            resolvedRole = "Student";
          }
        }

        const resolvedUser = {
          ...(fullUser || response.user),
          roleName: resolvedRole || "Student",
        };

        localStorage.setItem("cps_user", JSON.stringify(resolvedUser));
        setUser(resolvedUser);
        setIsLoading(false);

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

      let fullUser = null;
      try {
        fullUser = await api.get("/users/me?populate=role", { token: jwt });
      } catch {
        fullUser = null;
      }

      const resolvedUser = {
        ...(fullUser || {}),
        roleName: fullUser?.role?.name || "Student",
      };

      localStorage.setItem("cps_user", JSON.stringify(resolvedUser));
      setUser(resolvedUser);
      setIsLoading(false);

      const target = getRoleDashboardPath(resolvedUser.roleName);
      router.push(target);
      return resolvedUser;
    },
    [router]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("cps_jwt");
    localStorage.removeItem("cps_user");
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
