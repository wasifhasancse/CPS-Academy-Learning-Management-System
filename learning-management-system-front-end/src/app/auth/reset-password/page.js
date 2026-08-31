"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!code) {
      setError("Reset code is missing. Please use the link sent to your email.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/auth/reset-password", {
        code,
        password,
        passwordConfirmation,
      });
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2500);
    } catch (err) {
      setError(err?.message || "Password reset failed. The code may have expired.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl bg-card border border-border p-8 sm:p-10 shadow-1 space-y-6">
      <div>
        <h2 className="text-2xl font-black text-foreground tracking-tight">
          Create <span className="text-[#309255]">New Password</span>
        </h2>
        <p className="text-xs text-muted mt-1">
          Enter your new password below.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold"
        >
          {error}
        </div>
      )}

      {isSuccess ? (
        <div className="p-5 rounded-2xl bg-[#E7F8EE] dark:bg-[#181E27] border border-[#309255]/30 space-y-2 text-center">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#309255] text-white flex items-center justify-center text-lg font-bold">
            ✓
          </div>
          <p className="text-sm font-bold text-foreground">
            Password updated successfully!
          </p>
          <p className="text-xs text-muted leading-relaxed">
            Redirecting you to the sign-in page...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showPasswordToggle={true}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            showPasswordToggle={true}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2 font-bold text-sm py-3.5 shadow-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Resetting password..." : "Set New Password"}
          </Button>
        </form>
      )}

      <div className="pt-4 border-t border-border text-center text-xs text-muted">
        <Link
          href="/auth/login"
          className="font-bold text-[#309255] hover:underline transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-background">
      {/* Page Banner */}
      <section className="relative w-full py-12 md:py-16 bg-[#E7F8EE] dark:bg-[#181E27] border-b border-border transition-colors">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <nav className="flex items-center justify-center gap-2 text-xs font-semibold text-muted">
            <Link href="/" className="hover:text-[#309255] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#309255] font-bold">Reset Password</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">
            Security & <span className="text-[#309255]">Credentials</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
            Choose a strong, secure password for your CPS Academy account.
          </p>
        </div>
      </section>

      {/* Form Card Container */}
      <section className="py-12 md:py-16 flex-1 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4 sm:px-6">
          <Suspense fallback={<div className="p-8 text-center text-xs text-muted">Loading form...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
