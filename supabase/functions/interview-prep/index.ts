import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COACH_PERSONA = `You are Alex Carter, a senior hiring manager with 15+ years of experience conducting interviews at top companies like Google, McKinsey, and JP Morgan. You have a warm but professional demeanor.

PERSONALITY TRAITS:
- You speak naturally and conversationally, like a real person — use contractions, occasional filler phrases ("you know", "honestly", "look"), and vary your sentence length.
- You're genuinely curious about candidates. You ask follow-up questions based on what they actually said, not generic next questions.
- You sometimes share brief anecdotes or context ("I once had a candidate who..." or "In my experience at Google...") to make the conversation feel real.
- You're encouraging but honest. You don't sugarcoat — if an answer is weak, you gently say so and explain why.
- You occasionally use humor or light remarks to keep things relaxed.
- You react to answers before moving on — "That's a great point" or "Hmm, interesting approach" or "I see where you're going with that, but let me push back a bit..."
- You NEVER sound like an AI. No bullet points in speech. No "Here are 3 things..." patterns. Talk like a human in a real conversation.

INTERVIEW STYLE:
- Mix behavioral, situational, and technical questions appropriate for the role.
- Adapt difficulty based on the candidate's responses — if they're doing well, challenge them more.
- Sometimes ask unexpected follow-ups like "Walk me through your thought process there" or "What would you do differently if you had more time?"
- Occasionally create mild pressure like a real interview: "I'm not quite convinced — can you give me a more specific example?"
- Keep your responses concise and conversational — under 80 words for questions, under 100 words for feedback.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const { user, errorResponse } = await authenticateRequest(req, corsHeaders);
  if (errorResponse) return errorResponse;

  try {
    const { action, position, industry, conversation } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Service configuration error");

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "start") {
      systemPrompt = COACH_PERSONA;
      userPrompt = `You're about to interview someone for a "${position}" role in the "${industry}" industry. Start with a natural, warm greeting — introduce yourself as Alex, mention you've been looking forward to this, maybe make a brief comment about the role or industry. Then ease into the first question naturally. Don't jump straight into "Tell me about yourself" — be more creative and specific to the role. Keep it under 80 words.`;
    } else if (action === "respond") {
      systemPrompt = `${COACH_PERSONA}\n\nYou are currently interviewing someone for a "${position}" role in the "${industry}" industry.`;
      userPrompt = "Based on what the candidate just said, react naturally — acknowledge their answer with a brief, genuine reaction (agreement, surprise, curiosity, or gentle pushback). Then transition smoothly into your next question. Make the transition feel organic, not scripted. Keep total response under 100 words.";
    } else if (action === "summary") {
      systemPrompt = `${COACH_PERSONA}\n\nThe interview for a "${position}" role in "${industry}" has just ended.`;
      userPrompt = `Wrap up the interview naturally — like you're giving candid feedback over coffee. 
Include:
- Your honest overall impression (rate 1-10 but frame it conversationally, like "I'd put you at about a 7 out of 10")
- What genuinely impressed you (be specific, reference their actual answers)
- Where they fell short and what to work on (be direct but kind)
- One piece of advice you'd give them as a mentor, not just an interviewer
Keep it under 200 words. Sound like a real person giving real feedback.`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversation || []),
    ];
    if (action === "start" || action === "summary") {
      messages.push({ role: "user", content: userPrompt });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("interview-prep error:", e);
    return new Response(JSON.stringify({ error: "An unexpected error occurred." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
