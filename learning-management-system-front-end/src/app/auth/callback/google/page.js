"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthData } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    async function handleCallback() {
      const directJwt = searchParams.get("jwt");
      const accessToken = searchParams.get("access_token") || searchParams.get("raw[access_token]");
      const idToken = searchParams.get("id_token") || searchParams.get("raw[id_token]");

      // Case 1: Direct JWT from backend
      if (directJwt) {
        try {
          await setAuthData(directJwt);
          return;
        } catch (err) {
          console.error("JWT exchange error:", err);
          setError(err?.message || "Session initialization failed.");
          return;
        }
      }

      // Case 2: Exchange Google access_token or id_token for Strapi JWT
      if (accessToken || idToken) {
        try {
          const query = accessToken
            ? `access_token=${encodeURIComponent(accessToken)}`
            : `id_token=${encodeURIComponent(idToken)}`;
          const res = await api.get(`/auth/google/callback?${query}`);

          if (res?.jwt) {
            await setAuthData(res.jwt);
            return;
          }
          throw new Error("No session token returned from provider.");
        } catch (err) {
          console.error("Google auth callback exchange error:", err);
          setError(err?.message || "Google authentication exchange could not be completed.");
          return;
        }
      }

      setError("No authentication token received from Google provider.");
    }

    handleCallback();
  }, [searchParams, setAuthData, router]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="text-center">
        <CardTitle as="h2" className="text-lg">
          {error ? "Authentication Issue" : "Connecting Your Account"}
        </CardTitle>
        <CardDescription>
          {error
            ? "We encountered an issue during Google authentication."
            : "Verifying your credentials and establishing your session..."}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center py-6">
        {error ? (
          <div className="space-y-4">
            <div
              role="alert"
              className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium"
            >
              {error}
            </div>
            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="text-xs font-semibold text-secondary hover:text-foreground transition-colors cursor-pointer"
            >
              ← Return to Login
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Spinner size="lg" color="primary" />
            <p className="text-xs text-muted">Finalizing authentication...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function GoogleCallbackPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="highlight" size="sm">
            Google Authentication
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Authenticating
          </h1>
        </div>

        <Suspense fallback={<div className="p-8 text-center text-muted">Verifying session...</div>}>
          <GoogleCallbackContent />
        </Suspense>
      </div>
    </div>
  );
}
