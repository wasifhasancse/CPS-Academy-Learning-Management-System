import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const headersList = await headers();
    const origin =
      headersList.get("origin") ||
      headersList.get("referer")?.replace(/\/$/, "") ||
      process.env.NEXT_PUBLIC_SITE_URL;

    const contentType = headersList.get("content-type") || "";
    let price, className, trainer, classId, duration, status, userId, userEmail, userName, courseSlug;
    let isFormData = false;

    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      isFormData = true;
      const formData = await request.formData();
      price = formData.get("price");
      className = formData.get("className") || formData.get("title");
      trainer = formData.get("trainer") || formData.get("instructor");
      classId = formData.get("classId") || formData.get("courseId");
      courseSlug = formData.get("courseSlug") || formData.get("slug");
      duration = formData.get("duration") || "Lifetime";
      status = formData.get("status");
      userId = formData.get("userId");
      userEmail = formData.get("userEmail");
      userName = formData.get("userName");
    } else {
      const body = await request.json().catch(() => ({}));
      price = body.price;
      className = body.className || body.title;
      trainer = body.trainer || body.instructor;
      classId = body.classId || body.courseId;
      courseSlug = body.courseSlug || body.slug;
      duration = body.duration || "Lifetime";
      status = body.status;
      userId = body.userId;
      userEmail = body.userEmail || body.email;
      userName = body.userName || body.name;
    }

    if (status === "banned") {
      return NextResponse.json(
        { error: "Action restricted by Admin." },
        { status: 403 }
      );
    }

    // Create Checkout Session from body params
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.max(100, Math.round(Number(price || 0) * 100)), // Convert to cents
            product_data: {
              name: className || "CPS Academy Course",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        price: Number(price || 0),
        userId: String(userId || ""),
        userEmail: String(userEmail || ""),
        userName: String(userName || ""),
        classId: String(classId || ""),
        className: String(className || ""),
        courseSlug: String(courseSlug || ""),
        trainer: String(trainer || ""),
        duration: String(duration || ""),
      },
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/courses/${encodeURIComponent(courseSlug || classId || "")}?canceled=true`,
    });

    if (isFormData) {
      return NextResponse.redirect(session.url, 303);
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[Payment Route Error]:", err);
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Payment API is working!" });
}
