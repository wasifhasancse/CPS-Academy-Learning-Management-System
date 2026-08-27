---
name: stripe-payments
description: >-
  Use this skill when implementing, configuring, or debugging Stripe checkout sessions,
  webhooks, payment reconciliation, order models, and automated student enrollment.
---

# Stripe Payments & Enrollment Runbook

Follow these procedures for Stripe integration in CPS Academy LMS:

## 1. Backend Checkout Session Creation
- Create `/api/orders/create-checkout-session` endpoint in Strapi.
- Procedure:
  1. Authenticate student via JWT.
  2. Query authoritative Course record from PostgreSQL database for title, price, and currency.
  3. Create an `Order` record with status `pending`.
  4. Create Stripe Checkout session:
     ```javascript
     const session = await stripe.checkout.sessions.create({
       payment_method_types: ['card'],
       customer_email: user.email,
       client_reference_id: order.id.toString(),
       line_items: [{
         price_data: {
           currency: 'usd',
           product_data: {
             name: course.title,
             description: course.description?.slice(0, 200),
           },
           unit_amount: Math.round(course.price * 100),
         },
         quantity: 1,
       }],
       mode: 'payment',
       metadata: {
         courseId: course.id.toString(),
         userId: user.id.toString(),
         orderId: order.id.toString(),
       },
       success_url: `${FRONTEND_URL}/student/orders/success?session_id={CHECKOUT_SESSION_ID}`,
       cancel_url: `${FRONTEND_URL}/courses/${course.slug}?canceled=true`,
     });
     ```
  5. Return `{ url: session.url }` to the frontend.

## 2. Webhook Ingestion & Transactional Enrollment
- Endpoint: `POST /api/orders/webhook` (must use raw body parser).
- Procedure:
  1. Verify signature:
     ```javascript
     const event = stripe.webhooks.constructEvent(
       rawBody,
       req.headers['stripe-signature'],
       process.env.STRIPE_WEBHOOK_SECRET
     );
     ```
  2. For `checkout.session.completed`:
     - Extract `orderId`, `userId`, `courseId` from session metadata.
     - Check if the order is already marked `paid` (idempotency check).
     - Update `Order` status to `paid` and store `stripePaymentIntentId`.
     - Create or activate `Enrollment` record for the student and course.
     - Emit in-app notification & purchase receipt.

## 3. Verification Steps
1. Use Stripe CLI to simulate webhook events: `stripe trigger checkout.session.completed`.
2. Confirm invalid signatures are rejected with status 400.
3. Verify that the course is immediately unlocked in the student's dashboard after checkout completion.
