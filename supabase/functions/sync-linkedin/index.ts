import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_HOST = "fresh-linkedin-scraper-api.p.rapidapi.com";

function extractUsername(url: string): string | null {
  const match = url.match(/linkedin\.com\/in\/([^\/\?#]+)/);
  return match ? match[1] : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const username = extractUsername(linkedinUrl);
    if (!username) {
      return new Response(JSON.stringify({ error: "Could not extract username from LinkedIn URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Fetching LinkedIn profile for username:", username);

    const url = `https://${API_HOST}/api/v1/user/profile?username=${encodeURIComponent(username)}`;
    console.log("Calling LinkedIn API:", url);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-host": API_HOST,
        "x-rapidapi-key": apiKey,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`API returned ${res.status}:`, text);
      return new Response(
        JSON.stringify({ error: `Failed to fetch LinkedIn profile (${res.status}). Check your RapidAPI subscription and the profile URL.` }),
        { status: res.status === 429 ? 429 : 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawProfile = await res.json();
    console.log("Profile keys:", JSON.stringify(Object.keys(rawProfile || {})));

    const profile =
      rawProfile &&
      typeof rawProfile === "object" &&
      "data" in rawProfile &&
      rawProfile.data &&
      typeof rawProfile.data === "object"
        ? (rawProfile.data as Record<string, any>)
        : (rawProfile as Record<string, any>);

    console.log("Mapped profile data keys:", JSON.stringify(Object.keys(profile || {})));

    const experience =
      profile.position ||
      profile.positions ||
      profile.experiences ||
      profile.experience ||
      [];
    const education = profile.educations || profile.education || [];
    const skills = profile.skills || profile.skill || [];

    const fullName =
      profile.full_name ||
      profile.fullName ||
      profile.name ||
      [profile.first_name || profile.firstName, profile.last_name || profile.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "";

    const resumeData = {
      personalInfo: {
        fullName,
        email: profile.email || profile.email_address || "",
        location:
          [profile.city, profile.state, profile.country].filter(Boolean).join(", ") ||
          (typeof profile.location === "string"
            ? profile.location
            : [
                profile.location?.city,
                profile.location?.state,
                profile.location?.country,
              ]
                .filter(Boolean)
                .join(", ")) ||
          "",
        linkedin: linkedinUrl,
      },
      summary: profile.about || profile.summary || profile.headline || profile.bio || "",
      skills: Array.isArray(skills)
        ? skills
            .map((s: any) => (typeof s === "string" ? s : s.name || s.title || s.skill || ""))
            .filter(Boolean)
        : [],
      experience: Array.isArray(experience)
        ? experience.map((pos: any) => ({
            title: pos.title || pos.position || pos.role || "",
            company: pos.company || pos.companyName || pos.company_name || "",
            description: pos.description || pos.summary || "",
            startDate: pos.start || pos.startDate || pos.start_date || "",
            endDate: pos.end || pos.endDate || pos.end_date || "Present",
            bullets: [],
          }))
        : [],
      education: Array.isArray(education)
        ? education.map((edu: any) => ({
            degree:
              edu.degree ||
              edu.degreeName ||
              edu.degree_name ||
              [edu.degree_name, edu.field_of_study || edu.fieldOfStudy]
                .filter(Boolean)
                .join(" in ") ||
              "",
            school: edu.school || edu.schoolName || edu.school_name || "",
            startDate: edu.start || edu.startDate || edu.start_date || "",
            endDate: edu.end || edu.endDate || edu.end_date || "",
          }))
        : [],
      languages: [],
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
