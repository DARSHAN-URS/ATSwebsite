import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeData, jobDescription, tone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("Service configuration error");
    }

    const systemPrompt = `You are an expert cover letter writer. Generate a tailored cover letter based on the provided resume and job description. The tone should be: ${tone || "professional"}.`;

    const userPrompt = `Resume:\n${JSON.stringify(resumeData)}\n\nJob Description:\n${jobDescription}\n\nGenerate a cover letter with sections: greeting, opening paragraph, body paragraphs, and closing.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_cover_letter",
              description: "Generate a structured cover letter with sections",
              parameters: {
                type: "object",
                properties: {
                  greeting: { type: "string", description: "The greeting line, e.g. 'Dear Hiring Manager,'" },
                  opening: { type: "string", description: "Opening paragraph introducing yourself and the position" },
                  body: { type: "string", description: "Body paragraphs highlighting relevant experience and skills" },
                  closing: { type: "string", description: "Closing paragraph with call to action and sign-off" },
                  suggested_title: { type: "string", description: "A suggested title for this cover letter" },
                },
                required: ["greeting", "opening", "body", "closing", "suggested_title"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_cover_letter" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const coverLetterData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(coverLetterData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-cover-letter error:", e);
    return new Response(JSON.stringify({ error: "An unexpected error occurred. Please try again later." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
