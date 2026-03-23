import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

// Disable body parsing so we get raw bytes for signature verification
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
