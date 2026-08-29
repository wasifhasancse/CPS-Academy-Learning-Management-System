'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    strapi.log.warn('[Stripe] STRIPE_SECRET_KEY is not configured in environment.');
    return null;
  }
  return require('stripe')(secretKey);
};

const resolveUser = async (ctx, strapi) => {
  if (ctx.state.user && ctx.state.user.role?.type) return ctx.state.user;
  const authHeader = ctx.request.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = await strapi.plugin('users-permissions').service('jwt').verify(token);
      if (decoded && decoded.id) {
        return await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { id: decoded.id },
          populate: ['role'],
        });
      }
    } catch (e) {
      strapi.log.warn('[Order Auth] Token verification error:', e.message);
    }
  }
  if (ctx.state.user?.id) {
    return await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: ctx.state.user.id },
      populate: ['role'],
    });
  }
  return null;
};

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
  /**
   * Create a Stripe Checkout Session for Course Purchase
   * POST /api/orders/create-checkout-session
   */
  async createCheckoutSession(ctx) {
    const user = await resolveUser(ctx, strapi);
    if (!user) {
      return ctx.unauthorized('Authentication required to purchase courses.');
    }

    const roleType = (user.role?.type || '').toLowerCase();
    const roleName = (user.role?.name || '').toLowerCase();
    if (roleType !== 'student' && roleName !== 'student' && roleType !== 'authenticated') {
      return ctx.forbidden('Only student accounts are eligible to purchase and enroll in courses.');
    }

    const { courseId, priceId } = ctx.request.body || {};

    if (!courseId) {
      return ctx.badRequest('courseId is required.');
    }

    // 1. Authoritative lookup of course
    let course = null;
    try {
      course = await strapi.documents('api::course.course').findFirst({
        filters: {
          $or: [
            { documentId: String(courseId) },
            { slug: String(courseId) },
            ...(isNaN(Number(courseId)) ? [] : [{ id: Number(courseId) }]),
          ],
        },
        populate: ['enrollments'],
      });
    } catch (e) {
      strapi.log.error('[Stripe Checkout] Course lookup error:', e);
    }

    if (!course) {
      return ctx.notFound('Course not found.');
    }

    // 2. Check if user is already enrolled
    const existingEnrollment = await strapi.db.query('api::enrollment.enrollment').findOne({
      where: {
        student: user.id,
        course: course.id,
      },
    });

    if (existingEnrollment) {
      return ctx.badRequest('You are already enrolled in this course.');
    }

    const coursePrice = Number(course.price || 0);

    // If free course, direct enrollment
    if (coursePrice <= 0) {
      const freeEnrollment = await strapi.db.query('api::enrollment.enrollment').create({
        data: {
          student: user.id,
          course: course.id,
          status: 'active',
          enrolledAt: new Date(),
          progressPercentage: 0,
          publishedAt: new Date(),
        },
      });

      return ctx.send({
        success: true,
        free: true,
        message: 'Enrolled successfully in free course.',
        enrollment: freeEnrollment,
      });
    }

    const stripe = getStripe();
    if (!stripe) {
      return ctx.internalServerError('Payment gateway is currently unavailable.');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const chosenPriceId =
      priceId ||
      (course.priceId ? course.priceId : null) ||
      process.env.STRIPE_PRICE_ID;

    // 3. Create Pending Order record in database
    const order = await strapi.db.query('api::order.order').create({
      data: {
        student: user.id,
        course: course.id,
        amount: coursePrice,
        currency: 'usd',
        status: 'pending',
        priceId: chosenPriceId || undefined,
        publishedAt: new Date(),
      },
    });

    // 4. Configure Stripe line items
    let lineItems = [];
    if (chosenPriceId && chosenPriceId.startsWith('price_')) {
      lineItems = [
        {
          price: chosenPriceId,
          quantity: 1,
        },
      ];
    } else {
      const unitAmount = Math.round(coursePrice * 100);
      const cleanDescription = (course.description || '')
        .replace(/<[^>]*>/g, '')
        .slice(0, 250);

      lineItems = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              ...(cleanDescription ? { description: cleanDescription } : {}),
              ...(course.thumbnailUrl ? { images: [course.thumbnailUrl] } : {}),
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ];
    }

    try {
      // 5. Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: user.email,
        client_reference_id: String(order.id),
        line_items: lineItems,
        mode: 'payment',
        metadata: {
          orderId: String(order.id),
          courseId: String(course.id),
          courseDocumentId: course.documentId || String(course.id),
          courseSlug: course.slug || '',
          userId: String(user.id),
          userEmail: user.email,
        },
        success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/courses/${encodeURIComponent(course.slug || course.id)}?canceled=true`,
      });

      // Update Order with created session ID
      await strapi.db.query('api::order.order').update({
        where: { id: order.id },
        data: {
          stripeSessionId: session.id,
        },
      });

      return ctx.send({
        url: session.url,
        sessionId: session.id,
        orderId: order.id,
      });
    } catch (stripeErr) {
      strapi.log.error('[Stripe Checkout Error]', stripeErr);
      await strapi.db.query('api::order.order').update({
        where: { id: order.id },
        data: {
          status: 'failed',
        },
      });
      return ctx.badRequest(stripeErr.message || 'Failed to initialize Stripe checkout session.');
    }
  },

  /**
   * Stripe Webhook Ingestion & Transactional Enrollment
   * POST /api/orders/webhook
   */
  async webhook(ctx) {
    const stripe = getStripe();
    const sig = ctx.request.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      const rawBody =
        ctx.request.body?.[Symbol.for('unparsedBody')] ||
        ctx.request.unparsedBody ||
        ctx.request.body;

      if (webhookSecret && sig && stripe) {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } else {
        event = ctx.request.body;
      }
    } catch (err) {
      strapi.log.error('[Stripe Webhook Signature Error]', err.message);
      return ctx.badRequest(`Webhook Error: ${err.message}`);
    }

    if (!event) {
      return ctx.badRequest('Invalid webhook payload.');
    }

    strapi.log.info(`[Stripe Webhook] Processing event: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = session.metadata || {};
      const orderDocId = metadata.orderDocumentId || session.client_reference_id;
      const orderId = metadata.orderId;
      const courseId = metadata.courseDocumentId || metadata.courseId || metadata.classId;
      const userId = metadata.userId;

      try {
        // 1. Resolve Student
        let student = null;
        if (userId) {
          student = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: {
              $or: [
                ...(isNaN(Number(userId)) ? [] : [{ id: Number(userId) }]),
                { email: String(userId).toLowerCase() },
              ],
            },
          });
        }

        if (!student) {
          const emailToLookup = metadata.userEmail || session.customer_details?.email || session.customer_email;
          if (emailToLookup) {
            student = await strapi.db.query('plugin::users-permissions.user').findOne({
              where: { email: emailToLookup.toLowerCase() },
            });
          }
        }

        // 2. Resolve Course
        let targetCourse = null;
        const rawCourseIdentifier = courseId || metadata.classId || metadata.courseSlug || metadata.className;
        if (rawCourseIdentifier) {
          targetCourse = await strapi.db.query('api::course.course').findOne({
            where: {
              $or: [
                { documentId: String(rawCourseIdentifier) },
                { slug: String(rawCourseIdentifier) },
                { title: String(rawCourseIdentifier) },
                ...(isNaN(Number(rawCourseIdentifier)) ? [] : [{ id: Number(rawCourseIdentifier) }]),
              ],
            },
          });
        }

        if (!targetCourse && metadata.courseSlug) {
          targetCourse = await strapi.db.query('api::course.course').findOne({
            where: { slug: metadata.courseSlug },
          });
        }

        if (!targetCourse && metadata.className) {
          targetCourse = await strapi.db.query('api::course.course').findOne({
            where: { title: metadata.className },
          });
        }

        // 3. Resolve Order
        let order = null;
        if (orderId || orderDocId || session.id) {
          order = await strapi.db.query('api::order.order').findOne({
            where: {
              $or: [
                ...(isNaN(Number(orderId)) ? [] : [{ id: Number(orderId) }]),
                { stripeSessionId: session.id },
              ],
            },
          });
        }

        // 4. Update or Create Order
        if (order) {
          await strapi.db.query('api::order.order').update({
            where: { id: order.id },
            data: {
              status: 'paid',
              stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
              stripeSessionId: session.id,
            },
          });
        } else if (student && targetCourse) {
          try {
            order = await strapi.db.query('api::order.order').create({
              data: {
                student: student.id,
                course: targetCourse.id,
                amount: session.amount_total ? session.amount_total / 100 : Number(metadata.price || 0),
                currency: session.currency || 'usd',
                status: 'paid',
                stripeSessionId: session.id,
                stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
                publishedAt: new Date(),
              },
            });
            strapi.log.info(`[Stripe Webhook] Created new paid order for user ${student.email}`);
          } catch (createOrderErr) {
            strapi.log.warn('[Stripe Webhook] Could not create order record:', createOrderErr.message);
          }
        }

        // 5. Activate Enrollment
        if (student && targetCourse) {
          const existingEnrollment = await strapi.db.query('api::enrollment.enrollment').findOne({
            where: {
              student: student.id,
              course: targetCourse.id,
            },
          });

          if (!existingEnrollment) {
            await strapi.db.query('api::enrollment.enrollment').create({
              data: {
                student: student.id,
                course: targetCourse.id,
                status: 'active',
                enrolledAt: new Date(),
                progressPercentage: 0,
                publishedAt: new Date(),
              },
            });
            strapi.log.info(`[Stripe Webhook] Activated enrollment for student ${student.email} in course ${targetCourse.title}`);
          }
        }
      } catch (procErr) {
        strapi.log.error('[Stripe Webhook Processing Error]', procErr);
        return ctx.internalServerError('Failed to process checkout completion.');
      }
    }

    return ctx.send({ received: true });
  },

  /**
   * Verify Session & Reconcile Enrollment
   * GET /api/orders/verify-session?session_id=...
   */
  async verifySession(ctx) {
    const user = await resolveUser(ctx, strapi);
    if (!user) {
      return ctx.unauthorized('Authentication required.');
    }

    const { session_id } = ctx.query;
    if (!session_id) {
      return ctx.badRequest('session_id parameter is required.');
    }

    const stripe = getStripe();
    if (!stripe) {
      return ctx.internalServerError('Stripe configuration missing.');
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['payment_intent', 'line_items'],
      });

      if (!session) {
        return ctx.notFound('Stripe session not found.');
      }

      const isPaid = session.payment_status === 'paid' || session.status === 'complete';
      const metadata = session.metadata || {};

      if (isPaid) {
        // Trigger internal webhook logic to sync DB
        await this.webhook({
          request: {
            body: {
              type: 'checkout.session.completed',
              data: { object: session },
            },
            headers: {},
          },
          send: () => {},
          badRequest: () => {},
          internalServerError: () => {},
        });

        return ctx.send({
          success: true,
          status: 'paid',
          session: {
            id: session.id,
            amount_total: session.amount_total,
            currency: session.currency,
            customer_email: session.customer_email || session.customer_details?.email,
          },
        });
      }

      return ctx.send({
        success: false,
        status: session.payment_status,
        message: 'Payment not yet finalized.',
      });
    } catch (err) {
      strapi.log.error('[Stripe Verify Session Error]', err);
      return ctx.badRequest(err.message || 'Failed to verify session.');
    }
  },

  /**
   * Find orders scoped by Role (Student: Own only, Instructor: Own courses only, Admin/Manager: All)
   * GET /api/orders
   */
  async find(ctx) {
    const user = await resolveUser(ctx, strapi);
    if (!user) {
      return ctx.unauthorized('Authentication required to view orders.');
    }

    const roleType = (user.role?.type || '').toLowerCase();
    const roleName = (user.role?.name || '').toLowerCase();

    const isStudent = roleType === 'student' || roleName === 'student' || roleType === 'authenticated';
    const isInstructor = roleType === 'instructor' || roleName === 'instructor';
    const isAdminOrManager =
      roleType === 'admin' ||
      roleName === 'admin' ||
      roleType === 'content_manager' ||
      roleName === 'content manager';

    const where = {};

    if (isStudent && !isInstructor && !isAdminOrManager) {
      where.student = user.id;
    } else if (isInstructor && !isAdminOrManager) {
      where.course = {
        instructor: user.id,
      };
    }

    const orders = await strapi.db.query('api::order.order').findMany({
      where,
      populate: {
        student: {
          select: ['id', 'username', 'email'],
        },
        course: {
          populate: {
            instructor: {
              select: ['id', 'username', 'email'],
            },
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data: orders };
  },

  /**
   * Get Student Purchase History
   * GET /api/orders/my-orders
   */
  async myOrders(ctx) {
    return this.find(ctx);
  },

  /**
   * Public config for frontend
   * GET /api/orders/config
   */
  async getConfig(ctx) {
    return ctx.send({
      stripePriceId: process.env.STRIPE_PRICE_ID || null,
      stripeSellerProPriceId: process.env.STRIPE_SELLER_PRO_PRICE_ID || null,
    });
  },
}));
