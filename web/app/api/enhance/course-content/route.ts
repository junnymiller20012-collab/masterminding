import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

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
    return NextResponse.json(
      { error: "You've used all 5 AI enhancements for this hour. Try again later." },
      { status: 429 }
    );
  }

  const { title, description, targetAudience } = await req.json();
  if (!title && !description) {
    return NextResponse.json({ error: "title or description required" }, { status: 400 });
  }

  // Fallback — return as-is if no API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ title, description });
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `You are an expert course copywriter. Improve the following course title and description to be more compelling, clear, and benefit-focused. Fix any grammar issues. Keep the same meaning but make it sound professional.

Title: ${title}
Description: ${description}
Target audience: ${targetAudience ?? "general"}

Return ONLY valid JSON with exactly these keys:
- "title": improved title (max 10 words, punchy and benefit-focused)
- "description": improved description (same length as input, polished and engaging)

No other text, just the JSON object.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === "text") {
      const raw = content.text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(raw);
      return NextResponse.json({
        title: parsed.title ?? title,
        description: parsed.description ?? description,
      });
    }
  } catch (err) {
    console.error("AI enhance failed", err);
  }

  return NextResponse.json({ title, description });
}
