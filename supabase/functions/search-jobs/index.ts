import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resume_data, resume_title, location, job_type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Extract skills and keywords from resume using AI
    const skills = resume_data?.skills || [];
    const summary = resume_data?.summary || "";
    const experience = resume_data?.experience || [];
    const latestTitle = experience[0]?.title || resume_title || "";

    const searchPrompt = `Based on this resume information, generate realistic job listings that would match this candidate's profile.

Resume Title: ${resume_title}
Skills: ${skills.join(", ")}
Summary: ${summary}
Latest Job Title: ${latestTitle}
${location ? `Preferred Location: ${location}` : ""}
${job_type ? `Job Type: ${job_type}` : ""}

Generate exactly 8 realistic job listings as a JSON array. Each job should have:
- job_title: string
- company: string (use real-sounding company names)
- location: string
- job_type: string (remote/hybrid/onsite)
- description: string (2-3 sentences about the role)
- url: string (use "#" as placeholder)
- posted_date: string (recent date in YYYY-MM-DD format)
- match_score: number (0-100, how well this job matches the resume)
- match_explanation: string (1 sentence explaining the match score)

Make the jobs realistic and varied in match quality. Some should be excellent matches (80-95%), some good (60-79%), and some moderate (40-59%).
Return ONLY the JSON array, no other text.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a job search assistant. Return only valid JSON arrays." },
          { role: "user", content: searchPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "[]";

    // Parse JSON from AI response (handle markdown code blocks)
    let jobs = [];
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      jobs = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      jobs = [];
    }

    return new Response(JSON.stringify({ jobs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("search-jobs error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
