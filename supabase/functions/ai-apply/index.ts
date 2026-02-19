import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest } from "../_shared/auth.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const { user, errorResponse } = await authenticateRequest(req, corsHeaders);
  if (errorResponse) return errorResponse;

  try {
    const { resume_id, resume_data, resume_title } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Service configuration error");

    const JSEARCH_API_KEY = Deno.env.get("Jsearch_API_key");
    if (!JSEARCH_API_KEY) throw new Error("Service configuration error");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Build search query from resume
    const skills = resume_data?.skills || [];
    const experience = resume_data?.experience || [];
    const latestTitle = experience[0]?.title || resume_title || "";
    const searchQuery = latestTitle || skills.slice(0, 3).join(" ") || "software engineer";

    // Step 1: Find top 10 matching jobs via JSearch
    const params = new URLSearchParams({ query: searchQuery, page: "1", num_pages: "2" });
    const jsearchResponse = await fetch(
      `https://jsearch.p.rapidapi.com/search?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "jsearch.p.rapidapi.com",
          "x-rapidapi-key": JSEARCH_API_KEY,
        },
      }
    );

    if (!jsearchResponse.ok) {
      throw new Error("Job search service error");
    }

    const jsearchData = await jsearchResponse.json();
    const rawJobs = (jsearchData.data || []).slice(0, 10);

    if (rawJobs.length === 0) {
      return new Response(JSON.stringify({ queued: 0, message: "No matching jobs found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const jobs = rawJobs.map((j: any) => ({
      job_title: j.job_title || "Untitled",
      company: j.employer_name || "Unknown",
      location: j.job_city && j.job_state ? `${j.job_city}, ${j.job_state}` : j.job_country || "Not specified",
      job_type: j.job_is_remote ? "Remote" : "On-site",
      description: j.job_description?.slice(0, 800) || "",
      url: j.job_apply_link || j.job_google_link || "#",
    }));

    // Step 2: AI scores all jobs and tailors resume + cover letter for each
    const batchPrompt = `You are an expert career coach. Given a candidate's resume and ${jobs.length} job listings, do the following for each job:
1. Score the match (0-100)
2. Write a tailored 2-3 sentence professional summary optimized for this specific job
3. Suggest the top 8-10 most relevant skills from the resume (reordered for this role, adding 1-2 from the JD if missing)
4. Write a 3-paragraph cover letter (opening, body, closing) tailored to this job and company

Resume:
- Title: ${resume_title}
- Summary: ${resume_data?.summary || ""}
- Skills: ${skills.join(", ")}
- Latest Role: ${latestTitle}
- Experience: ${experience.slice(0, 2).map((e: any) => `${e.title} at ${e.company}`).join("; ")}

Jobs:
${jobs.map((j: any, i: number) => `[${i}] ${j.job_title} at ${j.company} (${j.location})\n${j.description?.slice(0, 300)}`).join("\n\n")}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a career coach. Return only valid JSON." },
          { role: "user", content: batchPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_ai_apply_results",
              description: "Return AI apply results for all jobs",
              parameters: {
                type: "object",
                properties: {
                  results: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        index: { type: "number" },
                        match_score: { type: "number" },
                        match_explanation: { type: "string" },
                        tailored_summary: { type: "string" },
                        tailored_skills: { type: "array", items: { type: "string" } },
                        cover_letter_opening: { type: "string" },
                        cover_letter_body: { type: "string" },
                        cover_letter_closing: { type: "string" },
                      },
                      required: ["index", "match_score", "match_explanation", "tailored_summary", "tailored_skills", "cover_letter_opening", "cover_letter_body", "cover_letter_closing"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["results"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_ai_apply_results" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const { results } = JSON.parse(toolCall.function.arguments);

    // Step 3: Save each job package to ai_apply_queue
    const inserts = results
      .filter((r: any) => r.match_score >= 40) // only insert reasonable matches
      .map((r: any) => {
        const job = jobs[r.index];
        if (!job) return null;
        return {
          user_id: user!.id,
          resume_id,
          job_title: job.job_title,
          company: job.company,
          location: job.location,
          job_type: job.job_type,
          job_url: job.url,
          description: job.description?.slice(0, 500),
          match_score: r.match_score,
          match_explanation: r.match_explanation,
          tailored_resume_data: {
            ...resume_data,
            summary: r.tailored_summary,
            skills: r.tailored_skills,
          },
          cover_letter_data: {
            greeting: `Dear Hiring Manager at ${job.company},`,
            opening: r.cover_letter_opening,
            body: r.cover_letter_body,
            closing: r.cover_letter_closing,
          },
        };
      })
      .filter(Boolean);

    if (inserts.length > 0) {
      const { error: insertError } = await supabaseAdmin.from("ai_apply_queue").insert(inserts);
      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error("Failed to save apply queue");
      }
    }

    return new Response(JSON.stringify({ queued: inserts.length, total_found: jobs.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-apply error:", e);
    return new Response(JSON.stringify({ error: "An unexpected error occurred. Please try again later." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
