import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const milestoneContext: Record<string, string> = {
  link_shared:         "They need to share their course link for the first time to get their first students.",
  first_3_students:    "They have published their course but have no students yet. They need their first 3.",
  first_100_dollars:   "They have a few students but need to reach $100 in revenue.",
  first_10_students:   "They have some students and need to grow to 10 total.",
  first_500_dollars:   "They are growing and need to reach $500 in total revenue.",
  second_course:       "They have students coming in and should launch a second course to increase revenue.",
  first_1000_dollars:  "They are doing well and need to push to their first $1,000.",
  first_50_students:   "They have momentum and need to scale to 50 students.",
  first_100_students:  "They are growing fast and need to reach 100 students total.",
};

// Rate limiter: 10 requests per user per hour
const rateLimitMap = new Map<string, number[]>();
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const window = 3_600_000;
  const hits = (rateLimitMap.get(userId) ?? []).filter((t) => now - t < window);
  if (hits.length >= 10) return false;
  rateLimitMap.set(userId, [...hits, now]);
  return true;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!checkRateLimit(userId)) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const { milestoneId, courseTitle, targetAudience, expertise, priceCents } = await req.json();

  const context = milestoneContext[milestoneId];
  if (!context) return NextResponse.json({ error: "Invalid milestone" }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ tip: "Share your course link on your social media profiles and tell your audience exactly who it's for and what they'll learn." });
  }

  try {
    const client = new Anthropic({ apiKey });
    const price = priceCents ? `$${(priceCents / 100).toFixed(0)}` : "paid";

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: `You are a marketing coach for online course creators. Give ONE specific, actionable marketing tip for this mentor.

Mentor details:
- Expertise: ${expertise ?? "general"}
- Course topic: ${courseTitle ?? "online course"}
- Target audience: ${targetAudience ?? "general learners"}
- Price: ${price}

Their current goal: ${context}

Write 2-3 sentences max. Be very specific to their niche. Give a concrete action they can take TODAY. Do not use generic advice. No bullet points, just plain text.`,
      }],
    });

    const content = message.content[0];
    if (content.type === "text") {
      return NextResponse.json({ tip: content.text.trim() });
    }
  } catch (err) {
    console.error("Milestone tip generation failed", err);
  }

  return NextResponse.json({ tip: "Share your course link with your audience today and explain exactly what problem it solves for them." });
}
