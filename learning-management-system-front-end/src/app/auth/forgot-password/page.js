"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function ForgotPasswordPage() {
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
    } catch (err) {
      setError(err?.message || "Failed to send reset email. Please verify your address.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="surface" size="sm">
            Account Recovery
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Reset Password
          </h1>
          <p className="text-sm text-muted">
            Enter the email associated with your account to receive a reset link.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle as="h2" className="text-lg">
              Password Recovery
            </CardTitle>
            <CardDescription>
              We will send you secure instructions to reset your password.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium"
              >
                {error}
              </div>
            )}

            {isSent ? (
              <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/30 space-y-2 text-center">
                <p className="text-sm font-semibold text-foreground">
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
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending reset link..." : "Send Reset Link"}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="justify-center text-xs text-muted">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="ml-1.5 font-semibold text-secondary hover:text-foreground transition-colors"
            >
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
