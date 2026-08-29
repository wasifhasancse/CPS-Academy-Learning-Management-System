import { stripe } from "@/lib/stripe";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaUser,
} from "react-icons/fa";

export const metadata = {
  title: "Payment Successful - CPS Academy",
  description:
    "Your payment was successful. Thank you for enrolling in CPS Academy! You now have full lifetime access to this course.",
};

export default async function Success({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const session_id = resolvedSearchParams?.session_id;

  if (!session_id) {
    return redirect("/courses");
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items", "payment_intent"],
    });
  } catch (err) {
    console.error("Stripe retrieve session error:", err);
    return redirect("/courses");
  }

  const status = session?.status;
  const customerEmail = session?.customer_details?.email || session?.customer_email || "your registered email";
  const metadata = session?.metadata || {};

  if (status === "open") {
    return redirect("/");
  }

  const {
    className = "CPS Course",
    trainer = "CPS Instructor",
    price = session?.amount_total ? session.amount_total / 100 : 0,
    duration = "Lifetime Access",
    classId,
    userId,
    courseSlug,
  } = metadata;

  // Auto-sync enrollment in Strapi backend
  if (status === "complete") {
    try {
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
      await fetch(`${strapiUrl}/api/orders/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "checkout.session.completed",
          data: { object: session },
        }),
      }).catch((e) => {
        console.error("Auto enrollment webhook fetch error:", e);
      });
    } catch (e) {
      console.error("Auto enrollment sync error:", e);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 transition-colors duration-300">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-sm p-8 md:p-12">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-secondary/15 flex items-center justify-center">
            <FaCheckCircle className="w-10 h-10 text-secondary" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-center text-foreground tracking-tight">
          Payment Successful!
        </h1>
        <p className="text-center text-sm text-muted mt-2">
          Thank you for your enrollment. A receipt has been sent to{" "}
          <strong className="font-semibold text-foreground">{customerEmail}</strong>.
        </p>

        {/* Booking & Course Summary */}
        <div className="mt-8 bg-surface rounded-xl p-6 space-y-3 border border-border">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
            Enrollment Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="flex items-center gap-3">
              <FaCalendarCheck className="w-5 h-5 text-secondary shrink-0" />
              <div>
                <p className="text-xs text-muted">Course</p>
                <p className="font-semibold text-xs sm:text-sm text-foreground">{className}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FaUser className="w-5 h-5 text-secondary shrink-0" />
              <div>
                <p className="text-xs text-muted">Instructor</p>
                <p className="font-semibold text-xs sm:text-sm text-foreground">{trainer}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FaClock className="w-5 h-5 text-secondary shrink-0" />
              <div>
                <p className="text-xs text-muted">Access Duration</p>
                <p className="font-semibold text-xs sm:text-sm text-foreground">{duration}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FaDollarSign className="w-5 h-5 text-secondary shrink-0" />
              <div>
                <p className="text-xs text-muted">Amount Paid</p>
                <p className="font-semibold text-xs sm:text-sm text-foreground">৳{Number(price).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          {courseSlug ? (
            <Link
              href={`/learn/${courseSlug}`}
              className="flex-1 text-center py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
            >
              ▶ Start Learning Now
            </Link>
          ) : (
            <Link
              href="/dashboard/student/courses"
              className="flex-1 text-center py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
            >
              View My Courses
            </Link>
          )}

          <Link
            href="/courses"
            className="flex-1 text-center py-3 border border-border text-foreground font-semibold rounded-xl hover:bg-surface transition-colors cursor-pointer"
          >
            Browse More Courses
          </Link>
        </div>

        {/* Extra Info */}
        <p className="mt-6 text-center text-xs text-muted">
          Need support? Reach out to{" "}
          <a href="mailto:support@cpsacademy.com" className="text-secondary hover:underline font-medium">
            support@cpsacademy.com
          </a>.
        </p>
      </div>
    </div>
  );
}
