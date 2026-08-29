"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { api } from "@/lib/api";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!sessionId) {
      setLoading(false);
      setError("No checkout session reference was found in the URL.");
      return;
    }

    let isMounted = true;

    async function verifyCheckout() {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/orders/verify-session?session_id=${encodeURIComponent(sessionId)}`, {
          token: token || undefined,
        });

        if (isMounted) {
          if (res?.success) {
            setOrderData(res);
          } else {
            setError(res?.message || "Payment verification is pending or incomplete.");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Order verification error:", err);
          setError(err?.message || "Failed to verify Stripe checkout session.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verifyCheckout();

    return () => {
      isMounted = false;
    };
  }, [sessionId, token, isAuthLoading]);

  if (loading || isAuthLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 px-4">
        <Card className="p-8 text-center space-y-4 bg-card border-border">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Verifying Stripe Payment...</h2>
          <p className="text-xs text-muted">
            Please wait while we confirm your payment and unlock your course enrollment.
          </p>
        </Card>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 px-4">
        <Card className="p-8 text-center space-y-5 bg-card border-border">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-foreground">Order Verification Issue</h2>
          <p className="text-sm text-muted max-w-md mx-auto">
            {error || "We could not find the details for this checkout session."}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button href="/courses" variant="primary" size="md">
              Browse Courses
            </Button>
            <Button href="/dashboard/student" variant="outline" size="md">
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const course = orderData.order?.course || orderData.enrollment?.course || {};
  const courseSlug = course.slug || course.documentId || course.id;
  const courseTitle = course.title || "Your Enrolled Course";
  const amountTotal = orderData.session?.amount_total
    ? (orderData.session.amount_total / 100).toFixed(2)
    : orderData.order?.amount;

  const currency = (orderData.session?.currency || orderData.order?.currency || "usd").toUpperCase();

  return (
    <main className="w-full max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <Card className="bg-card border-border overflow-hidden shadow-sm">
        {/* Header Banner */}
        <div className="bg-surface border-b border-border p-6 sm:p-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-secondary/15 text-secondary flex items-center justify-center mx-auto text-3xl font-black">
            ✓
          </div>
          <Badge variant="success" size="sm" className="font-bold uppercase tracking-wider">
            Payment Confirmed
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Enrollment Activated
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
            Thank you for your purchase! Your enrollment is active and you have lifetime access to the curriculum.
          </p>
        </div>

        {/* Order Details Body */}
        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Purchased Course Card */}
          <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Purchased Course</span>
              <h2 className="text-base font-bold text-foreground">{courseTitle}</h2>
              {course.category?.name && (
                <Badge variant="highlight" size="sm">
                  {course.category.name}
                </Badge>
              )}
            </div>

            {courseSlug && (
              <Button href={`/learn/${courseSlug}`} variant="primary" size="md" className="shrink-0 font-bold">
                ▶ Open Course Player
              </Button>
            )}
          </div>

          {/* Receipt Breakdown */}
          <div className="border border-border rounded-xl p-4 sm:p-5 space-y-3 text-xs">
            <h3 className="font-bold text-foreground uppercase tracking-wider text-[11px] pb-2 border-b border-border">
              Transaction Details
            </h3>

            <div className="flex justify-between text-muted">
              <span>Payment Status</span>
              <span className="font-semibold text-green-600 dark:text-green-400">Paid & Verified</span>
            </div>

            {amountTotal !== undefined && (
              <div className="flex justify-between text-muted">
                <span>Amount Paid</span>
                <span className="font-bold text-foreground">{currency} {amountTotal}</span>
              </div>
            )}

            {sessionId && (
              <div className="flex justify-between text-muted break-all gap-4">
                <span>Stripe Session ID</span>
                <span className="font-mono text-[11px] text-foreground text-right">{sessionId.slice(0, 24)}...</span>
              </div>
            )}

            {orderData.order?.id && (
              <div className="flex justify-between text-muted">
                <span>Order Reference</span>
                <span className="font-mono text-foreground">#{orderData.order.id}</span>
              </div>
            )}

            <div className="flex justify-between text-muted">
              <span>Access Level</span>
              <span className="font-semibold text-foreground">Full Lifetime Access</span>
            </div>
          </div>

          {/* Next Steps & Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {courseSlug && (
              <Button href={`/learn/${courseSlug}`} variant="primary" size="md" className="flex-1 font-bold">
                ▶ Start Learning Now
              </Button>
            )}
            <Button href="/dashboard/student" variant="outline" size="md" className="flex-1">
              Go to Student Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-2xl mx-auto py-16 px-4 text-center text-xs text-muted">
          Loading order details...
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
