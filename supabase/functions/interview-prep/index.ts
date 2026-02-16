import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
      systemPrompt = `You are an expert interview coach. You will conduct a mock interview for the candidate. Be encouraging but realistic. Ask one question at a time and wait for the answer before proceeding.`;
      userPrompt = `Start a mock interview for someone applying for a "${position}" role in the "${industry}" industry. Begin with a brief greeting and then ask the first common interview question for this role. Keep your response conversational and under 100 words.`;
    } else if (action === "respond") {
      systemPrompt = `You are an expert interview coach conducting a mock interview for a "${position}" role in the "${industry}" industry. 
After the candidate answers, do the following in order:
1. Give brief, specific feedback on their answer (what was good, what could improve) - 2-3 sentences max.
2. Then ask the next interview question.
Keep total response under 120 words. Be conversational and supportive.`;
      userPrompt = "Continue the interview based on the conversation so far.";
    } else if (action === "summary") {
      systemPrompt = `You are an expert interview coach. Provide a concise performance summary for a "${position}" mock interview in "${industry}".`;
      userPrompt = `Based on the conversation, give a brief performance summary with: 
1. Overall rating (1-10)
2. Top 3 strengths observed
3. Top 3 areas to improve
4. One key tip
Keep it under 200 words.`;
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
