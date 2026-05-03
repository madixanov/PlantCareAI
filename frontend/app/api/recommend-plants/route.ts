/**
 * Advanced Plant Recommendation API Route (DIVERSE VERSION)
 */

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";

// ============================================================================
// TYPES
// ============================================================================

interface RecommendRequest {
  light: "low" | "medium" | "bright";
  temperature: number;
  humidity: "low" | "medium" | "high";
  windowDirection: "north" | "south" | "east" | "west" | "none";
  experienceLevel: "beginner" | "intermediate" | "expert";
}

interface PlantRecommendation {
  rank: number;
  name: string;
  reason: string;
  difficulty: "easy" | "medium" | "hard";
  benefits: string[];
  tips: string[];
}

// ============================================================================
// EXPANDED PLANT CONTEXT (IMPORTANT FIX)
// ============================================================================

const PLANT_CONTEXT = `
You are allowed to recommend a wide variety of houseplants, including:

Tropical plants:
Monstera Deliciosa, Philodendron, Calathea, Alocasia, Anthurium, Ficus Lyrata

Low maintenance plants:
Snake Plant, ZZ Plant, Pothos, Spider Plant, Jade Plant, Aloe Vera

Humidity lovers:
Boston Fern, Calathea Orbifolia, Maranta (Prayer Plant), Fern species

Flowering plants:
Peace Lily, Anthurium, Orchid, Begonia

Rare/interesting plants:
String of Hearts, String of Pearls, Tradescantia, Rubber Plant

Herbs:
Basil, Mint, Rosemary, Thyme

Succulents:
Echeveria, Haworthia, Crassula, Sedum
`;

// ============================================================================
// VALIDATION
// ============================================================================

function validateRequest(body: any): { valid: boolean; error?: string; data?: RecommendRequest } {
  if (!body) return { valid: false, error: "No body" };

  const { light, temperature, humidity, windowDirection, experienceLevel } = body;

  if (!light || !humidity || !windowDirection || !experienceLevel)
    return { valid: false, error: "Missing fields" };

  return {
    valid: true,
    data: { light, temperature, humidity, windowDirection, experienceLevel },
  };
}

// ============================================================================
// FALLBACK (DIVERSE NOW)
// ============================================================================

function getFallback(): PlantRecommendation[] {
  const plants = [
    "Monstera Deliciosa",
    "Snake Plant",
    "Calathea Orbifolia",
    "Aloe Vera",
    "Boston Fern",
  ];

  return plants.map((p, i) => ({
    rank: i + 1,
    name: p,
    reason: "Fallback recommendation based on general adaptability.",
    difficulty: "easy",
    benefits: ["Air purifying", "Decorative"],
    tips: ["Water moderately", "Avoid overwatering"],
  }));
}

// ============================================================================
// AI ENGINE (FIXED FOR DIVERSITY)
// ============================================================================

async function getRecommendations(conditions: RecommendRequest): Promise<PlantRecommendation[]> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("No API key");

  const randomness = Math.random().toString(36).slice(2);

  const prompt = `
You are a plant expert AND creative horticulture advisor.

${PLANT_CONTEXT}

CRITICAL INSTRUCTIONS:
- You MUST be creative and avoid repeating common answers
- Do NOT always choose snake plant / pothos unless truly best fit
- Use a mix of popular + rare + niche plants
- Encourage diversity in plant types
- Think like a real plant shop consultant, not a template system

User environment:
- Light: ${conditions.light}
- Temperature: ${conditions.temperature}
- Humidity: ${conditions.humidity}
- Window direction: ${conditions.windowDirection}
- Experience: ${conditions.experienceLevel}

Randomness seed: ${randomness}

TASK:
Generate 5 DIFFERENT plants ranked by suitability.

REQUIREMENTS:
- mix of plant types (not all easy plants)
- include at least 1 unique or less common plant if suitable
- explanations must be specific and contextual
- avoid repetitive reasoning patterns

Return ONLY JSON array:
[
  {
    "rank": 1,
    "name": "...",
    "reason": "...",
    "difficulty": "easy|medium|hard",
    "benefits": ["..."],
    "tips": ["..."]
  }
]
`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: "system",
          content:
            "You are a creative plant expert. You produce diverse, non-repetitive outputs.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 1.1, // 🔥 KEY CHANGE (more diversity)
      max_tokens: 1400,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    console.error('Groq API Error:', res.status, errorText);
    throw new Error(`AI failed: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) throw new Error("Empty response");

  try {
    const json = text.match(/\[[\s\S]*\]/)?.[0] || text;
    const parsed = JSON.parse(json);

    if (!Array.isArray(parsed) || parsed.length !== 5) {
      throw new Error("Invalid format");
    }

    return parsed;
  } catch (e) {
    throw new Error("Parse error");
  }
}

// ============================================================================
// ROUTE
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json({ error: "Rate limit" }, { status: 429 });
    }

    const body = await req.json();
    const validation = validateRequest(body);

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    let result;

    try {
      result = await getRecommendations(validation.data);
    } catch (e) {
      console.error("AI failed:", e);
      result = getFallback();
    }

    return NextResponse.json({
      recommendations: result,
      conditions: validation.data,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}