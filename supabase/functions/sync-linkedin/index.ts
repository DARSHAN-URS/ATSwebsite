import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_HOST = "fresh-linkedin-profile-data-api.p.rapidapi.com";
const API_BASE = `https://${API_HOST}/api`;

function extractUsername(url: string): string | null {
  const match = url.match(/linkedin\.com\/in\/([^\/\?#]+)/);
  return match ? match[1] : null;
}

async function apiFetch(path: string, apiKey: string) {
  const url = `${API_BASE}${path}`;
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
    console.warn(`API ${path} returned ${res.status}:`, text);
    return null;
  }
  const json = await res.json();
  return json?.data ?? json;
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

    // Fetch profile, skills, education, and experience in parallel
    const [profile, skills, education, experience] = await Promise.all([
      apiFetch(`/profile/${username}`, apiKey),
      apiFetch(`/profile/${username}/skills`, apiKey),
      apiFetch(`/profile/${username}/education`, apiKey),
      apiFetch(`/profile/${username}/experience`, apiKey),
    ]);

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch LinkedIn profile. Check your RapidAPI subscription and the profile URL." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Profile keys:", JSON.stringify(Object.keys(profile)));

    // Map to ResumeData
    const resumeData = {
      personalInfo: {
        fullName: profile.fullName || "",
        email: profile.email || "",
        location: profile.location || "",
        linkedin: linkedinUrl,
      },
      summary: profile.about || profile.headline || "",
      skills: Array.isArray(skills)
        ? skills.map((s: any) => (typeof s === "string" ? s : s.name || s.title || "")).filter(Boolean)
        : [],
      experience: Array.isArray(experience)
        ? experience.map((pos: any) => ({
            title: pos.title || pos.position || "",
            company: pos.company || pos.companyName || "",
            description: pos.description || "",
            startDate: pos.startDate || pos.start || "",
            endDate: pos.endDate || pos.end || "Present",
            bullets: [],
          }))
        : [],
      education: Array.isArray(education)
        ? education.map((edu: any) => ({
            degree: edu.degree || edu.degreeName || [edu.degree_name, edu.field_of_study || edu.fieldOfStudy].filter(Boolean).join(" in ") || "",
            school: edu.school || edu.schoolName || "",
            startDate: edu.startDate || edu.start || "",
            endDate: edu.endDate || edu.end || "",
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
