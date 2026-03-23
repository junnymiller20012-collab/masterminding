import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { courseId, learnerId, mentorId } = session.metadata ?? {};
    const paymentIntent =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? "";

    if (courseId && learnerId && mentorId && session.amount_total) {
      await convex.mutation(api.enrollments.fulfillPurchase, {
        courseId: courseId as Id<"courses">,
        learnerId: learnerId as Id<"users">,
        mentorId: mentorId as Id<"mentors">,
        amountPaidCents: session.amount_total,
        currency: session.currency ?? "usd",
        stripePaymentIntentId: paymentIntent,
      });

      // Send notification emails if Resend is configured
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        try {
          const emailData = await convex.query(api.enrollments.getEnrollmentEmailData, {
            mentorId: mentorId as Id<"mentors">,
            courseId: courseId as Id<"courses">,
            learnerId: learnerId as Id<"users">,
          });

          if (emailData) {
            const resend = new Resend(resendKey);
            const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.masterminding.app";
            const fromEmail = process.env.RESEND_FROM_EMAIL ?? "notifications@masterminding.app";
            const amountFormatted = `$${(session.amount_total / 100).toFixed(2)}`;
            const courseUrl = `${appUrl}/${emailData.mentorSlug}/${emailData.courseSlug}`;

            // Email to mentor — new sale notification
            if (emailData.mentorEmail) {
              await resend.emails.send({
                from: `MasterMinding <${fromEmail}>`,
                to: emailData.mentorEmail,
                subject: `💰 New sale! ${emailData.learnerName} just enrolled in "${emailData.courseTitle}"`,
                html: `
                  <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1e293b">
                    <div style="background:#0F766E;padding:24px 32px;border-radius:12px 12px 0 0">
                      <h1 style="color:white;margin:0;font-size:22px">You made a sale! 🎉</h1>
                    </div>
                    <div style="background:#f8fafc;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
                      <p style="margin:0 0 20px;font-size:16px">
                        <strong>${emailData.learnerName}</strong> just enrolled in
                        <strong>"${emailData.courseTitle}"</strong> for <strong>${amountFormatted}</strong>.
                      </p>
                      <div style="background:white;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:24px">
                        <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;font-weight:600">Sale Summary</p>
                        <p style="margin:0 0 4px;font-size:15px">📚 Course: ${emailData.courseTitle}</p>
                        <p style="margin:0 0 4px;font-size:15px">👤 Student: ${emailData.learnerName} ${emailData.learnerEmail ? `(${emailData.learnerEmail})` : ""}</p>
                        <p style="margin:0;font-size:15px">💵 Amount: ${amountFormatted}</p>
                      </div>
                      <a href="${appUrl}/dashboard" style="background:#0F766E;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;display:inline-block;font-size:14px">
                        View Dashboard →
                      </a>
                      <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">
                        Payout will be sent to your Stripe account automatically.
                      </p>
                    </div>
                  </div>
                `,
              });
            }

            // Email to learner — enrollment confirmation
            const learnerEmail = session.customer_details?.email ?? emailData.learnerEmail;
            const learnerName = session.customer_details?.name ?? emailData.learnerName;
            if (learnerEmail) {
              await resend.emails.send({
                from: `MasterMinding <${fromEmail}>`,
                to: learnerEmail,
                subject: `You're enrolled in "${emailData.courseTitle}"! Here's your access link`,
                html: `
                  <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1e293b">
                    <div style="background:#0F766E;padding:24px 32px;border-radius:12px 12px 0 0">
                      <h1 style="color:white;margin:0;font-size:22px">Welcome to the course! 🎓</h1>
                    </div>
                    <div style="background:#f8fafc;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
                      <p style="margin:0 0 20px;font-size:16px">
                        Hi ${learnerName}, you're now enrolled in <strong>"${emailData.courseTitle}"</strong> by ${emailData.mentorName}. You have lifetime access.
                      </p>
                      <a href="${appUrl}/learn/${courseId}" style="background:#0F766E;color:white;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;display:inline-block;font-size:15px;margin-bottom:24px">
                        Start Learning Now →
                      </a>
                      <p style="margin:0 0 8px;font-size:13px;color:#64748b">
                        You can also find this course at any time by visiting:
                      </p>
                      <a href="${courseUrl}" style="color:#0F766E;font-size:13px">${courseUrl}</a>
                      <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">
                        If you have any questions, reply to this email and we'll help you out.
                      </p>
                    </div>
                  </div>
                `,
              });
            }
          }
        } catch (emailErr) {
          // Don't fail the webhook if email sending fails — just log it
          console.error("Email send failed:", emailErr);
        }
      }
    }
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const stripeCustomerId =
      typeof sub.customer === "string" ? sub.customer : sub.customer.id;

    const status = sub.status as
      | "active"
      | "trialing"
      | "past_due"
      | "canceled"
      | "incomplete";

    await convex.mutation(api.mentors.updateSubscription, {
      stripeCustomerId,
      subscriptionId: sub.id,
      subscriptionStatus: status,
      subscriptionCurrentPeriodEnd: sub.current_period_end * 1000,
    });
  }

  return NextResponse.json({ received: true });
}
