"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function LoginPage() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ identifier: "", password: "", general: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = { identifier: "", password: "", general: "" };
    let hasError = false;

    if (!identifier.trim()) {
      newErrors.identifier = "Please enter your email address or username.";
      hasError = true;
    }

    if (!password) {
      newErrors.password = "Please enter your password.";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setErrors({ identifier: "", password: "", general: "" });
    setIsSubmitting(true);

    try {
      await login(identifier.trim(), password);
    } catch (err) {
      const msg = err?.message || "Invalid credentials.";
      if (msg.toLowerCase().includes("identifier") || msg.toLowerCase().includes("email") || msg.toLowerCase().includes("user")) {
        setErrors({ identifier: msg, password: "", general: "" });
      } else if (msg.toLowerCase().includes("password")) {
        setErrors({ identifier: "", password: msg, general: "" });
      } else {
        setErrors({ identifier: "", password: "Invalid email or password. Please try again.", general: "" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
    window.location.href = `${strapiUrl}/api/connect/google`;
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="highlight" size="sm">
            CPS Academy Account
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-muted">
            Log in to continue your learning journey and access your dashboard.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle as="h2" className="text-lg">
              Sign In
            </CardTitle>
            <CardDescription>
              Enter your account credentials or continue with Google.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {errors.general && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium"
              >
                {errors.general}
              </div>
            )}

            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="surface"
              onClick={handleGoogleLogin}
              className="w-full mb-6 border border-border flex items-center justify-center gap-2.5 shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </Button>

            {/* Clean Centered Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-[11px] uppercase tracking-wider text-muted font-medium">
                  Or with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email or Username"
                type="text"
                placeholder="you@example.com"
                value={identifier}
                error={errors.identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: "" }));
                }}
                required
              />

              <div className="space-y-1">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  error={errors.password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  showPasswordToggle={true}
                  required
                />
                <div className="text-right pt-1">
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-secondary hover:text-foreground transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center text-xs text-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="ml-1.5 font-semibold text-secondary hover:text-foreground transition-colors"
            >
              Sign Up
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
