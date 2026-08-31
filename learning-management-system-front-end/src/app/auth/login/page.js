"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getStrapiUrl } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

export default function LoginPage() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
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
      if (
        msg.toLowerCase().includes("identifier") ||
        msg.toLowerCase().includes("email") ||
        msg.toLowerCase().includes("user")
      ) {
        setErrors({ identifier: msg, password: "", general: "" });
      } else if (msg.toLowerCase().includes("password")) {
        setErrors({ identifier: "", password: msg, general: "" });
      } else {
        setErrors({
          identifier: "",
          password: "Invalid email or password. Please try again.",
          general: "",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    const strapiUrl = getStrapiUrl();
    window.location.href = `${strapiUrl}/api/connect/google`;
  };

  const demoAccounts = [
    {
      role: "Admin",
      email: "admin@gmail.com",
      pass: "abc12345",
      desc: "Platform governance & user roles",
      icon: HiOutlineShieldCheck,
    },
    {
      role: "Content Manager",
      email: "contentmanager@gmail.com",
      pass: "abc12345",
      desc: "Curriculum, quizzes & blogs",
      icon: HiOutlineAcademicCap,
    },
    {
      role: "Instructor",
      email: "instractor@gmail.com",
      pass: "abc12345",
      desc: "Course authoring & checkpoints",
      icon: HiOutlineSparkles,
    },
    {
      role: "Student",
      email: "student@gmail.com",
      pass: "abc12345",
      desc: "Interactive video player & quizzes",
      icon: HiOutlineUserGroup,
    },
  ];

  const handleSelectDemo = (demo) => {
    setSelectedRole(demo.role);
    setIdentifier(demo.email);
    setPassword(demo.pass);
    setErrors({ identifier: "", password: "", general: "" });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-background text-foreground">
      {/* 1. Edule-Style Page Banner */}
      <section className="relative w-full py-12 md:py-16 bg-[#E7F8EE] dark:bg-[#181E27] border-b border-border transition-colors">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <nav className="flex items-center justify-center gap-2 text-xs font-semibold text-muted">
            <Link href="/" className="hover:text-[#309255] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#309255] font-bold">Login</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">
            Login <span className="text-[#309255]">Form</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
            Access your personalized learning portal, course materials, and live quizzes.
          </p>
        </div>
      </section>

      {/* 2. Login Content Container */}
      <section className="py-12 md:py-16 flex-1 flex items-center justify-center">
        <div className="w-full max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left Column: Platform Branding & Interactive Demo Switcher */}
            <div className="lg:col-span-5 rounded-3xl bg-surface border border-border p-7 sm:p-9 flex flex-col justify-between space-y-7 shadow-xs">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7F8EE] dark:bg-[#E7F8EE]/15 border border-[#309255]/30 text-xs font-bold text-[#309255] dark:text-[#E7F8EE]">
                  <HiOutlineSparkles className="w-4 h-4" />
                  <span>CPS Academy Member Access</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
                  Welcome to Your Engineering Portal
                </h2>

                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  Join over 15,000 students and engineers mastering algorithms, dynamic programming, and scalable software systems.
                </p>

                {/* Stat Highlight Chips */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-card border border-border flex items-center gap-3 shadow-xs">
                    <div className="w-9 h-9 rounded-xl bg-[#E7F8EE] text-[#309255] dark:bg-[#E7F8EE]/20 dark:text-[#E7F8EE] flex items-center justify-center shrink-0 font-bold">
                      <HiOutlineUserGroup className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-sm font-extrabold text-foreground">15,000+</span>
                      <span className="block text-[11px] text-muted">Active Coders</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-card border border-border flex items-center gap-3 shadow-xs">
                    <div className="w-9 h-9 rounded-xl bg-[#E7F8EE] text-[#309255] dark:bg-[#E7F8EE]/20 dark:text-[#E7F8EE] flex items-center justify-center shrink-0 font-bold">
                      <HiOutlineAcademicCap className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-sm font-extrabold text-foreground">50+</span>
                      <span className="block text-[11px] text-muted">Tracks & Quizzes</span>
                    </div>
                  </div>
                </div>

                {/* Key Benefits List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#E7F8EE] text-[#309255] dark:bg-[#E7F8EE]/20 dark:text-[#E7F8EE] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-[#309255]/20">
                      ✓
                    </div>
                    <div className="text-xs text-muted leading-relaxed">
                      <strong className="text-foreground font-semibold">Universal Synchronization:</strong> Video player with progress checkpoints.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#E7F8EE] text-[#309255] dark:bg-[#E7F8EE]/20 dark:text-[#E7F8EE] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-[#309255]/20">
                      ✓
                    </div>
                    <div className="text-xs text-muted leading-relaxed">
                      <strong className="text-foreground font-semibold">Server-Evaluated Quizzes:</strong> Instant verification with zero answer leakage.
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Demo Credentials Panel */}
              <div className="pt-5 border-t border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                    1-Click Demo Accounts
                  </span>
                  <span className="text-[10px] text-muted">Select role to auto-fill</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {demoAccounts.map((demo) => {
                    const isSelected = selectedRole === demo.role;
                    const IconComponent = demo.icon;
                    return (
                      <button
                        key={demo.role}
                        type="button"
                        onClick={() => handleSelectDemo(demo)}
                        className={`p-2.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                          isSelected
                            ? "bg-[#E7F8EE] dark:bg-[#181E27] border-[#309255] shadow-xs"
                            : "bg-background hover:bg-[#E7F8EE]/30 border-border hover:border-[#309255]/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <IconComponent
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isSelected ? "text-[#309255]" : "text-muted group-hover:text-[#309255]"
                              }`}
                            />
                            <span
                              className={`text-xs font-bold truncate ${
                                isSelected ? "text-[#309255] dark:text-[#E7F8EE]" : "text-foreground"
                              }`}
                            >
                              {demo.role}
                            </span>
                          </div>
                          {isSelected ? (
                            <HiOutlineCheckCircle className="w-3.5 h-3.5 text-[#309255] shrink-0" />
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/15 text-muted font-mono group-hover:bg-[#309255] group-hover:text-white transition-colors">
                              Fill
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted truncate block font-mono">
                          {demo.email}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Login Form Card */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="rounded-3xl bg-card border border-border p-8 sm:p-10 shadow-1 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    Login <span className="text-[#309255]">Now</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-muted mt-1">
                    Enter your credentials or authenticate instantly with Google.
                  </p>
                </div>

                {errors.general && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold"
                  >
                    {errors.general}
                  </div>
                )}

                {/* Google OAuth Button */}
                <Button
                  type="button"
                  variant="surface"
                  onClick={handleGoogleLogin}
                  className="w-full py-3 border border-border flex items-center justify-center gap-3 shadow-1 hover:border-[#309255] transition-all duration-300"
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
                  <span className="font-semibold text-xs sm:text-sm">Continue with Google</span>
                </Button>

                {/* Clean Centered Divider */}
                <div className="relative my-2 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-4 text-[11px] uppercase tracking-wider text-muted font-bold">
                      Or with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Email or Username"
                    type="text"
                    placeholder="you@example.com"
                    icon={HiOutlineEnvelope}
                    value={identifier}
                    error={errors.identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setSelectedRole(null);
                      if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: "" }));
                    }}
                    required
                  />

                  <div className="space-y-2">
                    <Input
                      label="Password"
                      type="password"
                      placeholder="••••••••"
                      icon={HiOutlineLockClosed}
                      value={password}
                      error={errors.password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setSelectedRole(null);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                      }}
                      showPasswordToggle={true}
                      required
                    />

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-border text-[#309255] focus:ring-[#309255]/30 cursor-pointer accent-[#309255]"
                        />
                        <span className="text-xs text-muted hover:text-foreground transition-colors">
                          Remember me
                        </span>
                      </label>

                      <Link
                        href="/auth/forgot-password"
                        className="text-xs text-muted hover:text-[#309255] font-semibold transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full mt-3 font-bold text-sm py-3.5 shadow-1 transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <div className="pt-4 border-t border-border text-center text-xs text-muted">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/register"
                    className="font-bold text-[#309255] hover:underline transition-colors ml-1"
                  >
                    Create an account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
