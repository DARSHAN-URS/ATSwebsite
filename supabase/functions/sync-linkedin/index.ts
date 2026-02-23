import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function formatDate(dateObj: any): string {
  if (!dateObj) return "";
  const { month, year } = dateObj;
  if (!year) return "";
  if (!month) return `${year}`;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthNames[month - 1] || month} ${year}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { linkedinUrl } = await req.json();
    if (!linkedinUrl || typeof linkedinUrl !== "string") {
      return new Response(JSON.stringify({ error: "LinkedIn URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("RAPIDAPI_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "RapidAPI key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Fetching LinkedIn profile:", linkedinUrl);

    const host = "fresh-linkedin-profile-data-include-e-mail1.p.rapidapi.com";
    const response = await fetch(
      `https://${host}/get-personal-profile?linkedin_url=${encodeURIComponent(linkedinUrl)}&include_skills=true`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": host,
          "x-rapidapi-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `LinkedIn API error (${response.status}). Check your RapidAPI subscription.` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const profile = await response.json();
    console.log("Profile keys:", JSON.stringify(Object.keys(profile)));
    console.log("Profile preview:", JSON.stringify(profile).substring(0, 1500));

    // Map to ResumeData (Fresh LinkedIn Profile Data format)
    const resumeData = {
      personalInfo: {
        fullName: [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.full_name || "",
        email: profile.email || "",
        location: profile.location || profile.city || "",
        linkedin: linkedinUrl,
      },
      summary: profile.about || profile.summary || "",
      skills: Array.isArray(profile.skills)
        ? profile.skills.map((s: any) => (typeof s === "string" ? s : s.name || s.title || "")).filter(Boolean)
        : [],
      experience: Array.isArray(profile.experiences)
        ? profile.experiences.map((pos: any) => ({
            title: pos.title || pos.position || "",
            company: pos.company || pos.company_name || "",
            description: pos.description || "",
            startDate: pos.start_date || formatDate(pos.start),
            endDate: pos.end_date || (pos.end ? formatDate(pos.end) : "Present"),
            bullets: [],
          }))
        : [],
      education: Array.isArray(profile.educations)
        ? profile.educations.map((edu: any) => ({
            degree: edu.degree || [edu.degree_name, edu.field_of_study].filter(Boolean).join(" in ") || "",
            school: edu.school || edu.school_name || "",
            startDate: edu.start_date || formatDate(edu.start),
            endDate: edu.end_date || formatDate(edu.end),
          }))
        : [],
      languages: Array.isArray(profile.languages)
        ? profile.languages.map((lang: any) => ({
            name: typeof lang === "string" ? lang : lang.name || lang.title || "",
            proficiency: typeof lang === "string" ? "" : lang.proficiency || "",
          }))
        : [],
      customSections: [],
    };

    return new Response(JSON.stringify(resumeData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
