"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setIsSent(true);
      toast.success("Password reset instructions dispatched.", "Reset Email Sent");
    } catch (err) {
      const msg = err?.message || "Failed to send reset email. Please verify your address.";
      setError(msg);
      toast.error(msg, "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <span className="text-[#309255] font-bold">Forgot Password</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">
            Account <span className="text-[#309255]">Recovery</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
            Enter the email address associated with your CPS Academy account.
          </p>
        </div>
      </section>

      {/* Form Card Container */}
      <section className="py-12 md:py-16 flex-1 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4 sm:px-6">
          <div className="rounded-3xl bg-card border border-border p-8 sm:p-10 shadow-1 space-y-6">
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                Reset <span className="text-[#309255]">Password</span>
              </h2>
              <p className="text-xs text-muted mt-1">
                We will send you secure instructions to reset your password.
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

            {isSent ? (
              <div className="p-5 rounded-2xl bg-[#E7F8EE] dark:bg-[#181E27] border border-[#309255]/30 space-y-2 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#309255] text-white flex items-center justify-center text-lg font-bold">
                  ✓
                </div>
                <p className="text-sm font-bold text-foreground">
                  Reset link dispatched!
                </p>
                <p className="text-xs text-muted leading-relaxed">
                  If an account exists for <strong className="text-foreground">{email}</strong>, you will receive a password reset link shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Account Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-2 font-bold text-sm py-3.5 shadow-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending reset link..." : "Send Reset Link"}
                </Button>
              </form>
            )}

            <div className="pt-4 border-t border-border text-center text-xs text-muted">
              Remember your password?{" "}
              <Link
                href="/auth/login"
                className="font-bold text-[#309255] hover:underline transition-colors ml-1"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
