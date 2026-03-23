import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Rate limiter: 5 requests per user per hour
const rateLimitMap = new Map<string, number[]>();
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const window = 3_600_000; // 1 hour
  const hits = (rateLimitMap.get(userId) ?? []).filter((t) => now - t < window);
  if (hits.length >= 5) return false;
  rateLimitMap.set(userId, [...hits, now]);
  return true;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!checkRateLimit(userId)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { courseId } = await req.json();
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

  const course = await convex.query(api.courses.getById, {
    courseId: courseId as Id<"courses">,
  });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const apiKey = process.env.ANTHROPIC_API_KEY;

  let headline = `Master ${course.title}`;
  let subheadline = `The complete guide for ${course.targetAudience ?? "professionals"} who want real results.`;
  let body = `${course.description.slice(0, 200)}...\n\nYou'll get clear, actionable lessons built around real results — not theory.\n\nJoin hundreds of students who have already transformed their skills and their businesses.\n\nEnroll today and start making progress immediately.`;

  if (apiKey) {
    try {
      const client = new Anthropic({ apiKey });
      const outcomesText = (course.outcomes ?? []).join(", ");
      const message = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `You are an expert copywriter specializing in online courses. Generate a compelling sales page for this course. Return ONLY valid JSON with exactly these keys: headline (max 10 words, compelling, benefit-focused), subheadline (1 sentence, expands on headline), body (3-4 short paragraphs, benefit-focused not feature-focused, speaks directly to the target audience, use line breaks between paragraphs).

Course:
- Title: ${course.title}
- Description: ${course.description}
- Target audience: ${course.targetAudience ?? "professionals"}
- Learning outcomes: ${outcomesText}

Return only the JSON object, no other text.`,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === "text") {
        const raw = content.text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
        const parsed = JSON.parse(raw);
        headline = parsed.headline ?? headline;
        subheadline = parsed.subheadline ?? subheadline;
        body = parsed.body ?? body;
      }
    } catch (err) {
      console.error("AI generation failed, using fallback", err);
    }
  }

  // Save to Convex — we need the mutation to run as the user
  // Since this is a server route, use the HTTP client with auth token from the request
  // For simplicity we return the content and let the client save it
  return NextResponse.json({ headline, subheadline, body });
}
