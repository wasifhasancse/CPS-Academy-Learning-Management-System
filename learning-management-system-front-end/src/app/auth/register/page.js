"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function RegisterPage() {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    general: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password validation criteria
  const hasMinLength = password.length >= 8;
  const hasNumberOrSpecial = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const validateField = (field, value) => {
    let errorMsg = "";
    if (field === "username") {
      if (!value.trim()) {
        errorMsg = "Username is required.";
      } else if (value.trim().length < 3) {
        errorMsg = "Username must be at least 3 characters.";
      }
    } else if (field === "email") {
      if (!value.trim()) {
        errorMsg = "Email address is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        errorMsg = "Please enter a valid email address.";
      }
    } else if (field === "password") {
      if (!value) {
        errorMsg = "Password is required.";
      } else if (value.length < 8) {
        errorMsg = "Password must be at least 8 characters long.";
      } else if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
        errorMsg = "Password must contain at least one number or special character.";
      }
    } else if (field === "confirmPassword") {
      if (!value) {
        errorMsg = "Please confirm your password.";
      } else if (password && value !== password) {
        errorMsg = "Passwords do not match.";
      }
    }
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    return !errorMsg;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = { username: "", email: "", password: "", confirmPassword: "", general: "" };
    let hasError = false;

    if (!username.trim()) {
      newErrors.username = "Username is required.";
      hasError = true;
    } else if (username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters.";
      hasError = true;
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required.";
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
      hasError = true;
    }

    if (!hasMinLength) {
      newErrors.password = "Password must be at least 8 characters long.";
      hasError = true;
    } else if (!hasNumberOrSpecial) {
      newErrors.password = "Password must contain at least one number or special character.";
      hasError = true;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
      hasError = true;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setErrors({ username: "", email: "", password: "", confirmPassword: "", general: "" });
    setIsSubmitting(true);

    try {
      await register({ username: username.trim(), email: email.trim(), password });
    } catch (err) {
      const msg = err?.message || "Registration failed.";
      if (msg.toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: msg }));
      } else if (msg.toLowerCase().includes("username")) {
        setErrors((prev) => ({ ...prev, username: msg }));
      } else if (msg.toLowerCase().includes("password")) {
        setErrors((prev) => ({ ...prev, password: msg }));
      } else {
        setErrors((prev) => ({ ...prev, general: msg }));
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
            Join CPS Academy
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Create Your Account
          </h1>
          <p className="text-sm text-muted">
            Start learning competitive programming and software engineering today.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle as="h2" className="text-lg">
              Sign Up
            </CardTitle>
            <CardDescription>
              Create an account or continue with your Google account.
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
              <span>Sign up with Google</span>
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
                label="Username"
                type="text"
                placeholder="cps_coder"
                value={username}
                error={errors.username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors((prev) => ({ ...prev, username: "" }));
                }}
                onBlur={(e) => validateField("username", e.target.value)}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                error={errors.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                onBlur={(e) => validateField("email", e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                error={errors.password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  if (confirmPassword && errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }
                }}
                onBlur={(e) => validateField("password", e.target.value)}
                showPasswordToggle={true}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                error={errors.confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
                onBlur={(e) => validateField("confirmPassword", e.target.value)}
                showPasswordToggle={true}
                required
              />

              {/* Real-Time Password Validation Checklist */}
              {password && (
                <div className="p-3 rounded-lg bg-surface border border-border space-y-1.5 text-xs">
                  <span className="font-semibold text-foreground text-[11px] uppercase tracking-wide">
                    Password Requirements
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={hasMinLength ? "text-green-600 dark:text-green-400 font-bold" : "text-muted"}>
                      {hasMinLength ? "✓" : "○"} At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={hasNumberOrSpecial ? "text-green-600 dark:text-green-400 font-bold" : "text-muted"}>
                      {hasNumberOrSpecial ? "✓" : "○"} At least one number or special character
                    </span>
                  </div>
                  {confirmPassword && (
                    <div className="flex items-center gap-2">
                      <span className={passwordsMatch ? "text-green-600 dark:text-green-400 font-bold" : "text-red-500"}>
                        {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center text-xs text-muted">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="ml-1.5 font-semibold text-secondary hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
