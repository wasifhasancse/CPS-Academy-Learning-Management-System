"use client";

import { useState } from "react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { BarChartCard, PieChartCard } from "@/components/ui/ChartCard";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const [usersList, setUsersList] = useState([
    { id: 1, name: "Admin", email: "admin@cpsacademy.io", role: "Admin", status: "Active" },
    { id: 2, name: "Mohaimin", email: "mohaimin@cpsacademy.io", role: "Instructor", status: "Active" },
    { id: 3, name: "Arafat", email: "arafat@cpsacademy.io", role: "Instructor", status: "Active" },
    { id: 4, name: "Aileen Anderson", email: "aileen@mailinator.com", role: "Student", status: "Active" },
    { id: 5, name: "Arin Sarkar", email: "arin@gmail.com", role: "Student", status: "Active" },
    { id: 6, name: "Tanvir Ahmed", email: "tanvir@gmail.com", role: "Student", status: "Blocked" },
  ]);

  const [applications, setApplications] = useState([
    {
      id: 1,
      name: "Shafiqul Islam",
      email: "shafiq@gmail.com",
      specialty: "Competitive Programming",
      experience: "5 years",
      bio: "Codeforces Master with extensive ICPC coaching experience. Seeking to author CP track modules.",
      status: "Pending",
    },
    {
      id: 2,
      name: "Nusrat Jahan",
      email: "nusrat@dev.com",
      specialty: "ASP.NET & Clean Architecture",
      experience: "4 years",
      bio: "Senior backend developer working with .NET 8, CQRS, and Azure microservices.",
      status: "Pending",
    },
  ]);

  const [selectedApp, setSelectedApp] = useState(null);
  const [roleModalUser, setRoleModalUser] = useState(null);

  const handleToggleBlock = (userId) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: u.status === "Active" ? "Blocked" : "Active" } : u))
    );
  };

  const handlePromoteToAdmin = (userId) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: "Admin" } : u))
    );
  };

  const handleChangeRole = (userId, newRole) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    setRoleModalUser(null);
  };

  const handleApproveApp = (appId) => {
    const app = applications.find((a) => a.id === appId);
    if (app) {
      setUsersList((prev) => [
        ...prev,
        { id: Date.now(), name: app.name, email: app.email, role: "Instructor", status: "Active" },
      ]);
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      setSelectedApp(null);
    }
  };

  const handleRejectApp = (appId) => {
    setApplications((prev) => prev.filter((a) => a.id !== appId));
    setSelectedApp(null);
  };

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
    {
      id: "users",
      label: "Manage Users",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: "applications",
      label: "Trainer Applications",
      badge: applications.length > 0 ? applications.length : null,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  <span className="text-2xl font-extrabold text-foreground">{usersList.length}</span>
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

        {/* TAB 2: MANAGE USERS */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-foreground">Manage Users</h2>
              <div className="w-full sm:w-80">
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <Card className="overflow-hidden border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#285A48]/20 text-[#285A48] dark:text-[#B0E4CC] font-bold flex items-center justify-center text-xs shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-foreground block">{u.name}</span>
                            <span className="text-[11px] text-muted block">{u.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={u.role === "Admin" ? "highlight" : u.role === "Instructor" ? "primary" : "surface"}
                          size="sm"
                        >
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            u.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-red-500/10 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {u.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleToggleBlock(u.id)}
                            variant={u.status === "Active" ? "danger" : "surface"}
                            size="sm"
                            className="text-xs py-1"
                          >
                            {u.status === "Active" ? "Block" : "Unblock"}
                          </Button>
                          {u.role !== "Admin" && (
                            <Button
                              onClick={() => handlePromoteToAdmin(u.id)}
                              variant="outline"
                              size="sm"
                              className="text-xs py-1"
                            >
                              Make Admin
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* TAB 3: TRAINER APPLICATIONS */}
        {activeTab === "applications" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Trainer Applications</h2>
              <Badge variant="surface" size="sm">
                {applications.length} Pending
              </Badge>
            </div>

            {applications.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <p className="text-xs text-muted">No pending instructor applications at this time.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <Card key={app.id} className="p-5 bg-card border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-foreground">{app.name}</h3>
                        <Badge variant="highlight" size="sm">
                          {app.specialty}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted">{app.email} • {app.experience} experience</p>
                      <p className="text-xs text-foreground/80 line-clamp-1">{app.bio}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setSelectedApp(app)}
                        variant="primary"
                        size="sm"
                      >
                        👁 View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL: APPLICATION DETAILS */}
        {selectedApp && (
          <Modal
            isOpen={!!selectedApp}
            onClose={() => setSelectedApp(null)}
            title="Application Details"
          >
            <div className="space-y-5 text-foreground">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-muted block uppercase">Name</span>
                  <span className="font-bold text-sm">{selectedApp.name}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-muted block uppercase">Email</span>
                  <span className="font-bold text-sm">{selectedApp.email}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-muted block uppercase">Specialty</span>
                  <span className="font-bold text-sm">{selectedApp.specialty}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-muted block uppercase">Experience</span>
                  <span className="font-bold text-sm">{selectedApp.experience}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-muted block uppercase mb-1">Bio</span>
                <p className="text-xs text-foreground/90 p-3 rounded-lg bg-surface leading-relaxed border border-border">
                  {selectedApp.bio}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  onClick={() => handleApproveApp(selectedApp.id)}
                  variant="primary"
                  size="md"
                  className="bg-[#285A48] hover:bg-[#1E4336] text-white"
                >
                  ✓ Approve
                </Button>
                <Button
                  onClick={() => handleRejectApp(selectedApp.id)}
                  variant="danger"
                  size="md"
                >
                  ✕ Reject
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* MODAL: CHANGE ROLE */}
        {roleModalUser && (
          <Modal
            isOpen={!!roleModalUser}
            onClose={() => setRoleModalUser(null)}
            title={`Change Role for ${roleModalUser.name}`}
          >
            <div className="space-y-4">
              <p className="text-xs text-muted">
                Select the target permission role for <strong className="text-foreground">{roleModalUser.email}</strong>:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {["Admin", "Content Manager", "Instructor", "Student"].map((r) => (
                  <Button
                    key={r}
                    onClick={() => handleChangeRole(roleModalUser.id, r)}
                    variant={roleModalUser.role === r ? "primary" : "surface"}
                    size="sm"
                    className="w-full justify-start text-xs"
                  >
                    {r}
                  </Button>
                ))}
              </div>
            </div>
          </Modal>
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
