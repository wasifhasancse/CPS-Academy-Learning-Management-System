"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { HiOutlineCreditCard, HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAllOrders() {
      if (!token) return;
      try {
        setLoading(true);
        const res = await api.get("/orders", { token });
        const ordersList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setOrders(ordersList);
      } catch (err) {
        console.error("Failed to load platform orders:", err);
        setError("Could not load student purchase records.");
      } finally {
        setLoading(false);
      }
    }

    loadAllOrders();
  }, [token]);

  const paidOrders = orders.filter((o) => o.status === "paid");
  const totalGrossRevenue = paidOrders.reduce((acc, o) => acc + Number(o.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Platform Orders & Student Invoices
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Full audit log of course transactions, student payments, and Stripe invoices.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-surface border border-border flex items-center gap-3">
            <span className="text-xs text-muted font-medium">Completed Transactions:</span>
            <span className="text-base font-bold text-foreground">{paidOrders.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-surface border border-border flex items-center gap-3">
            <span className="text-xs text-muted font-medium">Total Platform Sales:</span>
            <span className="text-base font-black text-foreground">৳{totalGrossRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : error ? (
        <Card className="p-6 bg-red-500/10 border-red-500/30 text-red-600 text-xs font-semibold">
          {error}
        </Card>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<HiOutlineCreditCard className="w-12 h-12 text-muted" />}
          title="No Transactions Recorded"
          description="Platform student purchase orders will appear here once processed."
        />
      ) : (
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const student = order.student || {};
                  const studentName = student.username || student.name || student.email || "Student";
                  const course = order.course || {};
                  const instructorName = course.instructor?.username || course.instructor?.name || "CPS Instructor";
                  const courseSlug = course.slug || course.documentId || course.id;
                  const dateStr = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—";

                  const isPaid = order.status === "paid";

                  return (
                    <TableRow key={order.documentId || order.id}>
                      <TableCell className="font-mono text-xs font-semibold text-foreground">
                        #{order.id}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="font-semibold text-xs text-foreground">{studentName}</div>
                          {student.email && (
                            <div className="text-[11px] text-muted">{student.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-xs text-foreground line-clamp-1">
                          {course.title || "Course Track"}
                        </div>
                        {order.stripeSessionId && (
                          <div className="font-mono text-[10px] text-muted truncate max-w-xs">
                            Session: {order.stripeSessionId.slice(0, 20)}...
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted">
                        {instructorName}
                      </TableCell>
                      <TableCell className="font-bold text-xs text-foreground">
                        ৳{Number(order.amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={isPaid ? "success" : order.status === "pending" ? "surface" : "danger"}
                          size="sm"
                          className="capitalize"
                        >
                          {order.status || "pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted">{dateStr}</TableCell>
                      <TableCell className="text-right">
                        {courseSlug && (
                          <Button
                            href={`/courses/${courseSlug}`}
                            variant="outline"
                            size="sm"
                            className="text-xs py-1 px-2.5 inline-flex items-center gap-1"
                          >
                            <span>Course</span>
                            <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
