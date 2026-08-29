"use client";

import { useAdmin } from "@/context/AdminContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";

export default function AdminUsersPage() {
  const {
    users,
    filteredUsers,
    isLoading,
    userSearch,
    setUserSearch,
    userRoleFilter,
    setUserRoleFilter,
    totalUsers,
    adminsCount,
    managersCount,
    instructorsCount,
    studentsCount,
    currentAdmin,
    handleOpenRoleModal,
    handleToggleBlockUser,
    handleOpenDeleteUserModal,
  } = useAdmin();

  return (
    <div className="space-y-6">
      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search username or email..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-64 text-xs"
          />
          <select
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-surface border border-border text-xs text-foreground"
          >
            <option value="all">All Roles ({totalUsers})</option>
            <option value="Admin">Admins ({adminsCount})</option>
            <option value="Content Manager">Content Managers ({managersCount})</option>
            <option value="Instructor">Instructors ({instructorsCount})</option>
            <option value="Student">Students ({studentsCount})</option>
          </select>
        </div>

        <div className="text-xs text-muted font-semibold">
          Showing {filteredUsers.length} of {totalUsers} registered accounts
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <TableSkeleton rows={6} columns={5} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          title="No Users Found"
          description={
            userSearch || userRoleFilter !== "all"
              ? "No platform accounts match your active search or role filter."
              : "No platform user accounts found."
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Assigned Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => {
                  const roleName = u.role?.name || "Student";
                  const isBlocked = Boolean(u.blocked);
                  const isCurrentUser = String(u.id) === String(currentAdmin?.id);

                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary dark:text-highlight flex items-center justify-center font-bold text-xs">
                            {u.username?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-xs">
                              {u.username} {isCurrentUser && "(You)"}
                            </div>
                            <div className="text-[10px] text-muted">ID: {u.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted font-mono">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            roleName.toLowerCase() === "admin"
                              ? "primary"
                              : roleName.toLowerCase() === "instructor"
                              ? "highlight"
                              : "secondary"
                          }
                        >
                          {roleName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isBlocked ? (
                          <Badge variant="danger">Blocked</Badge>
                        ) : (
                          <Badge variant="secondary">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Recent"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs py-1"
                            onClick={() => handleOpenRoleModal(u)}
                          >
                            Change Role
                          </Button>
                          <Button
                            variant={isBlocked ? "secondary" : "surface"}
                            size="sm"
                            className="text-xs py-1"
                            disabled={isCurrentUser}
                            onClick={() => handleToggleBlockUser(u)}
                          >
                            {isBlocked ? "Unblock" : "Block"}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="text-xs py-1"
                            disabled={isCurrentUser}
                            onClick={() => handleOpenDeleteUserModal(u)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
