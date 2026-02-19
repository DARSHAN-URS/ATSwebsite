import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authenticateRequest } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const { user, errorResponse } = await authenticateRequest(req, corsHeaders);
  if (errorResponse) return errorResponse;

  try {
    const { position, company, resumeId, coverLetterId } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Service configuration error");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch resume data if provided
    let resumeContext = "";
    if (resumeId) {
      const { data: resume } = await supabase
        .from("resumes")
        .select("resume_data, title")
        .eq("id", resumeId)
        .eq("user_id", user.id)
        .single();

      if (resume?.resume_data) {
        const rd = resume.resume_data as Record<string, unknown>;
        const personal = rd.personalInfo as Record<string, string> | undefined;
        const skills = (rd.skills as string[]) || [];
        const experience = (rd.experience as Array<{ title: string; company: string; description?: string }>) || [];
        const name = personal?.fullName || personal?.name || "";
        resumeContext = `
Applicant Name: ${name}
Skills: ${skills.slice(0, 12).join(", ")}
Experience: ${experience.slice(0, 3).map((e) => `${e.title} at ${e.company}`).join("; ")}
        `.trim();
      }
    }

    // Fetch cover letter content if provided
    let coverLetterContext = "";
    if (coverLetterId) {
      const { data: cl } = await supabase
        .from("cover_letters")
        .select("cover_letter_data")
        .eq("id", coverLetterId)
        .eq("user_id", user.id)
        .single();

      if (cl?.cover_letter_data) {
        const clData = cl.cover_letter_data as Record<string, unknown>;
        const sections = clData.sections as Array<{ title: string; content: string }> | undefined;
        if (sections) {
          coverLetterContext = sections.map((s) => s.content).join("\n\n");
        }
      }
    }

    const systemPrompt = `You are an expert job application coach. Write professional, concise, and personalized outreach emails for job applicants.`;

    const userPrompt = coverLetterContext
      ? `Using the following cover letter content, write a professional email for a job application.
Position: ${position}
Company: ${company}
${resumeContext ? `Applicant info:\n${resumeContext}` : ""}

Cover letter content:
${coverLetterContext.slice(0, 2000)}

Write:
1. A compelling subject line (max 80 chars)
2. A professional email body (3-4 short paragraphs, plain text, no markdown, no asterisks)

The email should feel personal and directly reference the role and company. End with a clear call to action.`
      : `Write a professional job application outreach email.
Position: ${position}
Company: ${company}
${resumeContext ? `Applicant info:\n${resumeContext}` : ""}

Write:
1. A compelling subject line (max 80 chars)
2. A professional email body (3-4 short paragraphs, plain text, no markdown, no asterisks)

The email should feel personal and directly reference the role and company. End with a clear call to action.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_email",
              description: "Return the generated email subject and body",
              parameters: {
                type: "object",
                properties: {
                  subject: { type: "string", description: "Email subject line" },
                  body: { type: "string", description: "Email body in plain text" },
                },
                required: ["subject", "body"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_email" } },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI error:", aiRes.status, t);
      throw new Error("AI generation failed");
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No AI response");

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-outreach-email error:", err);
    return new Response(JSON.stringify({ error: "Failed to generate email. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
