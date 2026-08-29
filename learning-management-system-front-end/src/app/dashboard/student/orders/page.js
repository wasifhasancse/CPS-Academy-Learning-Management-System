"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { HiOutlineCreditCard, HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";

export default function StudentOrdersPage() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      if (!token) return;
      try {
        setLoading(true);
        let res = await api.get("/orders/my-orders", { token }).catch(() => null);
        if (!res || (!res.data && !Array.isArray(res))) {
          res = await api.get("/orders", { token }).catch(() => null);
        }
        const ordersList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setOrders(ordersList);
      } catch (err) {
        console.error("Failed to load orders:", err);
        setError("Could not load your purchase receipts.");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Purchase History & Invoices
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            View your Stripe checkout transactions, course invoices, and payment receipts.
          </p>
        </div>
        <Button href="/courses" variant="primary" size="sm">
          Browse More Courses
        </Button>
      </div>

      {loading ? (
        <Card className="p-8 text-center bg-card border-border">
          <div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-muted">Loading your purchase history...</p>
        </Card>
      ) : error ? (
        <Card className="p-6 bg-red-500/10 border-red-500/30 text-red-600 text-xs font-semibold">
          {error}
        </Card>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<HiOutlineCreditCard className="w-12 h-12 text-muted" />}
          title="No Purchase History Yet"
          description="You haven't made any course purchases yet. Explore our course catalog to find your next track."
          action={
            <Button href="/courses" variant="primary" size="sm">
              Explore Courses
            </Button>
          }
        />
      ) : (
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const course = order.course || {};
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
                          <div className="font-semibold text-xs text-foreground line-clamp-1">
                            {course.title || "Course"}
                          </div>
                          {order.stripeSessionId && (
                            <div className="font-mono text-[10px] text-muted">
                              Session: {order.stripeSessionId.slice(0, 16)}...
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-xs text-foreground">
                        {(order.currency || "usd").toUpperCase()} {order.amount}
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
                            href={`/learn/${courseSlug}`}
                            variant="outline"
                            size="sm"
                            className="text-xs py-1 px-2.5 inline-flex items-center gap-1"
                          >
                            <span>Open</span>
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
