"use client";

import { useState } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BarChartCard, PieChartCard } from "@/components/ui/ChartCard";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
  ];

  return (
    <RoleGuard allowedRoles={["Admin"]}>
      <DashboardLayout
        roleTitle="Admin Dashboard"
        subtitle="Welcome back"
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Admin Overview</h2>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Card className="p-5 flex items-center gap-4 bg-card border-border">
                <div className="w-12 h-12 rounded-xl bg-[#285A48]/15 text-[#285A48] dark:bg-[#B0E4CC]/15 dark:text-[#B0E4CC] flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-foreground">29</span>
                  <span className="text-xs font-semibold text-muted block">Total Users</span>
                </div>
              </Card>

              <Card className="p-5 flex items-center gap-4 bg-card border-border">
                <div className="w-12 h-12 rounded-xl bg-[#408A71]/15 text-[#408A71] dark:bg-[#408A71]/25 dark:text-[#B0E4CC] flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-foreground">9</span>
                  <span className="text-xs font-semibold text-muted block">Approved Classes</span>
                </div>
              </Card>

              <Card className="p-5 flex items-center gap-4 bg-card border-border">
                <div className="w-12 h-12 rounded-xl bg-[#285A48]/15 text-[#285A48] dark:bg-[#B0E4CC]/15 dark:text-[#B0E4CC] flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-foreground">6</span>
                  <span className="text-xs font-semibold text-muted block">Transactions</span>
                </div>
              </Card>
            </div>

            {/* Profile Overview Card */}
            <Card className="p-6 bg-card border-border flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#285A48] border-2 border-[#408A71] text-[#B0E4CC] flex items-center justify-center font-black text-2xl shrink-0">
                {user?.username?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-foreground">{user?.username || "Administrator"}</h3>
                <p className="text-xs text-muted">{user?.email || "admin@cpsacademy.io"}</p>
                <div className="pt-1">
                  <Badge variant="highlight" size="sm">
                    Platform Super Admin
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BarChartCard
                title="Classes by Category"
                data={[
                  { label: "Competitive Prog", value: 4, color: "#285A48" },
                  { label: "Job Prep", value: 3, color: "#408A71" },
                  { label: ".NET Backend", value: 2, color: "#B0E4CC" },
                  { label: "Algorithms", value: 1, color: "#285A48" },
                ]}
              />

              <PieChartCard
                title="User Role Distribution"
                data={[
                  { label: "Student", value: 22, color: "#285A48" },
                  { label: "Instructor", value: 5, color: "#408A71" },
                  { label: "Content Manager", value: 1, color: "#B0E4CC" },
                  { label: "Admin", value: 1, color: "#122421" },
                ]}
              />
            </div>
          </div>
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
