import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("account_id");
  const clerkId = searchParams.get("clerk_id");

  if (!accountId || !clerkId) {
    return NextResponse.redirect(new URL("/settings/payouts?error=1", req.url));
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return NextResponse.redirect(new URL("/settings/payouts?error=1", req.url));

  const stripe = new Stripe(stripeKey);
  const account = await stripe.accounts.retrieve(accountId);

  const status =
    account.charges_enabled ? "active" : account.details_submitted ? "pending" : "pending";

  await convex.mutation(api.mentors.updateStripeAccountByClerkId, {
    clerkId,
    stripeAccountId: accountId,
    stripeAccountStatus: status,
  });

  return NextResponse.redirect(new URL("/settings/payouts?connected=1", req.url));
}
