import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Rate limiter: 5 requests per user per hour
const rateLimitMap = new Map<string, number[]>();
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const window = 3_600_000;
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
      { error: "You've used all 5 curriculum generations for this hour. Try again later." },
      { status: 429 }
    );
  }

  const { title, description, targetAudience } = await req.json();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fallback sections if no API key
    return NextResponse.json({
      sections: [
        { title: "Introduction & Welcome", textContent: "Welcome to the course! In this section you'll learn what to expect." },
        { title: "Getting Started", textContent: "Let's dive into the fundamentals." },
        { title: "Core Concepts", textContent: "The key ideas you need to master." },
        { title: "Practical Application", textContent: "Put what you've learned into practice." },
        { title: "Next Steps & Conclusion", textContent: "Where to go from here." },
      ],
    });
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are an expert course curriculum designer. Create a structured curriculum for this online course.

Course Title: ${title}
Description: ${description ?? ""}
Target Audience: ${targetAudience ?? "general learners"}

Generate 5 to 7 course sections. Each section should have a clear title and a short description of what will be covered (2-3 sentences).

Return ONLY valid JSON in this exact format:
{
  "sections": [
    { "title": "Section title here", "textContent": "What this section covers in 2-3 sentences." },
    ...
  ]
}

No other text, just the JSON.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === "text") {
      // Strip markdown code blocks if present
      const raw = content.text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(raw);
      return NextResponse.json({ sections: parsed.sections });
    }
  } catch (err) {
    console.error("Curriculum generation failed", err);
  }

  return NextResponse.json({ error: "Generation failed" }, { status: 500 });
}
