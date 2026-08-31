"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

export function ProfileTab() {
  const { user, token, role, updateUser } = useAuth();

  // Profile Form States
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const displayRole = (role || "Student").toUpperCase();
  const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : "U";
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Member";

  // Handle Profile Details Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!username.trim()) {
      setProfileError("Username cannot be empty.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const targetId = user.documentId || user.id;
      const res = await api.put(
        `/users/${targetId}`,
        { username: username.trim() },
        { token }
      );

      if (updateUser) {
        updateUser({ ...user, username: username.trim() });
      }

      setProfileSuccess("Profile information updated successfully.");
    } catch (err) {
      setProfileError(err?.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.post(
        "/auth/change-password",
        {
          currentPassword,
          password: newPassword,
          passwordConfirmation: confirmPassword,
        },
        { token }
      );

      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err?.message || "Failed to change password. Please check your current password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Profile Overview Hero Card */}
      <Card className="bg-card border-border p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#309255] text-white flex items-center justify-center font-black text-2xl border-2 border-[#309255]/40 shrink-0 shadow-sm">
              {userInitial}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-extrabold text-foreground">
                  {user?.username || "User"}
                </h2>
                <Badge variant="highlight" size="sm">
                  {displayRole}
                </Badge>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Account
                </span>
              </div>
              <p className="text-xs text-muted mt-1">{user?.email}</p>
              <p className="text-[11px] text-muted/80 mt-0.5">Joined CPS Academy • {joinedDate}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Grid: Personal Details & Password Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <Card className="bg-card border-border rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
            <CardDescription className="text-xs">
              Update your public handle and contact details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {profileSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  ✓ {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                  {profileError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Username / Display Handle
                </label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Email Address
                </label>
                <Input
                  value={email}
                  disabled
                  className="text-xs opacity-70 bg-surface cursor-not-allowed"
                />
                <span className="text-[10px] text-muted block mt-1">
                  Email address is linked to your authentication account.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Assigned Platform Role
                </label>
                <Input
                  value={displayRole}
                  disabled
                  className="text-xs opacity-70 bg-surface cursor-not-allowed font-bold"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSavingProfile}
                  disabled={isSavingProfile}
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security & Password Form */}
        <Card className="bg-card border-border rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Security & Password</CardTitle>
            <CardDescription className="text-xs">
              Change your password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  ✓ {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                  {passwordError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  New Password
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1.5">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="text-xs"
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  isLoading={isChangingPassword}
                  disabled={isChangingPassword}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* 3. Account Identity Details */}
      <Card className="bg-card border-border rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted">
          <div>
            <span className="font-bold text-foreground">Account ID:</span>{" "}
            <code className="px-2 py-0.5 rounded bg-surface text-foreground font-mono text-[11px]">
              {user?.documentId || user?.id || "N/A"}
            </code>
          </div>
          <div>
            <span className="font-bold text-foreground">Authentication Provider:</span>{" "}
            <span className="text-foreground capitalize">{user?.provider || "Local / Email"}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
