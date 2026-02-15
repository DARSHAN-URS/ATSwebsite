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

    const response = await fetch(
      `https://linkedin-data-api.p.rapidapi.com/get-profile-data-by-url?url=${encodeURIComponent(linkedinUrl)}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "linkedin-data-api.p.rapidapi.com",
          "x-rapidapi-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("RapidAPI error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `LinkedIn API error (${response.status}). Check your API subscription.` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const profile = await response.json();
    console.log("Profile fetched, mapping data...");

    // Map to ResumeData
    const resumeData = {
      personalInfo: {
        fullName: [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "",
        location: profile.geo?.full || "",
      },
      summary: profile.summary || "",
      skills: Array.isArray(profile.skills)
        ? profile.skills.map((s: any) => (typeof s === "string" ? s : s.name || "")).filter(Boolean)
        : [],
      experience: Array.isArray(profile.position)
        ? profile.position.map((pos: any) => ({
            title: pos.title || "",
            company: pos.companyName || "",
            description: pos.description || "",
            startDate: formatDate(pos.start),
            endDate: pos.end ? formatDate(pos.end) : "Present",
            bullets: [],
          }))
        : [],
      education: Array.isArray(profile.educations)
        ? profile.educations.map((edu: any) => ({
            degree: [edu.degree, edu.fieldOfStudy].filter(Boolean).join(" in ") || edu.degreeName || "",
            school: edu.schoolName || "",
            startDate: formatDate(edu.start),
            endDate: formatDate(edu.end),
          }))
        : [],
      languages: Array.isArray(profile.languages)
        ? profile.languages.map((lang: any) => ({
            name: typeof lang === "string" ? lang : lang.name || "",
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
