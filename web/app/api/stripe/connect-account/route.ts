import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });

  const stripe = new Stripe(stripeKey);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const account = await stripe.accounts.create({ type: "express" });

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${appUrl}/api/stripe/connect-account`,
    return_url: `${appUrl}/api/stripe/connect-callback?account_id=${account.id}&clerk_id=${userId}`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
