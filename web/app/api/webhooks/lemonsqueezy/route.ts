import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Resend } from "resend";
import { escapeHtml } from "@/lib/sanitize";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("x-signature");

  const hmac = createHmac("sha256", webhookSecret);
  hmac.update(body);
  const digest = hmac.digest("hex");

  if (!sig || sig !== digest) {
    logger.warn("lemonsqueezy.webhook.invalid_signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  const eventName = event.meta?.event_name;

  if (eventName === "order_created") {
    const order = event.data;
    const custom = event.meta?.custom_data ?? {};
    const { courseId, learnerId, mentorId, couponCode } = custom;

    if (courseId && learnerId && mentorId && order.attributes.total) {
      await convex.mutation(api.enrollments.fulfillPurchase, {
        courseId: courseId as Id<"courses">,
        learnerId: learnerId as Id<"users">,
        mentorId: mentorId as Id<"mentors">,
        amountPaidCents: order.attributes.total,
        currency: (order.attributes.currency ?? "usd").toLowerCase(),
        stripePaymentIntentId: `ls_${order.id}`,
      });

      if (couponCode) {
        try {
          await convex.mutation(api.coupons.incrementUsage, { code: couponCode });
        } catch {
          console.error("Failed to increment coupon usage:", couponCode);
        }
      }

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
            const amountFormatted = `$${(order.attributes.total / 100).toFixed(2)}`;
            const courseUrl = `${appUrl}/${emailData.mentorSlug}/${emailData.courseSlug}`;

            const safeLearnerName = escapeHtml(emailData.learnerName ?? "Student");
            const safeCourseTitle = escapeHtml(emailData.courseTitle ?? "");
            const safeMentorName = escapeHtml(emailData.mentorName ?? "");
            const safeLearnerEmail = escapeHtml(emailData.learnerEmail ?? "");

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
                        <strong>${safeLearnerName}</strong> just enrolled in
                        <strong>"${safeCourseTitle}"</strong> for <strong>${amountFormatted}</strong>.
                      </p>
                      <div style="background:white;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:24px">
                        <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;font-weight:600">Sale Summary</p>
                        <p style="margin:0 0 4px;font-size:15px">📚 Course: ${safeCourseTitle}</p>
                        <p style="margin:0 0 4px;font-size:15px">👤 Student: ${safeLearnerName} ${safeLearnerEmail ? `(${safeLearnerEmail})` : ""}</p>
                        <p style="margin:0;font-size:15px">💵 Amount: ${amountFormatted}</p>
                      </div>
                      <a href="${appUrl}/dashboard" style="background:#0F766E;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;display:inline-block;font-size:14px">
                        View Dashboard →
                      </a>
                    </div>
                  </div>
                `,
              });
            }

            const learnerEmail = order.attributes.user_email ?? emailData.learnerEmail;
            const learnerName = escapeHtml(order.attributes.user_name ?? emailData.learnerName ?? "there");
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
                        Hi ${learnerName}, you're now enrolled in <strong>"${safeCourseTitle}"</strong> by ${safeMentorName}. You have lifetime access.
                      </p>
                      <a href="${appUrl}/learn/${courseId}" style="background:#0F766E;color:white;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;display:inline-block;font-size:15px;margin-bottom:24px">
                        Start Learning Now →
                      </a>
                      <p style="margin:0 0 8px;font-size:13px;color:#64748b">You can also visit the course at:</p>
                      <a href="${courseUrl}" style="color:#0F766E;font-size:13px">${courseUrl}</a>
                    </div>
                  </div>
                `,
              });
            }
          }
        } catch (emailErr) {
          logger.error("lemonsqueezy.webhook.email_failed", { courseId, learnerId, err: String(emailErr) });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
