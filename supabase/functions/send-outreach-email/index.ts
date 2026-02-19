import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limit: max 10 outreach emails per user per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60_000;
const RATE_LIMIT_MAX = 10;

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}, 120_000);

function isValidEmail(email: string): boolean {
  return typeof email === "string" && email.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limit by user id
    if (isRateLimited(user.id)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait before sending more emails." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { to, subject, body: emailBody, fromName, replyTo, position, company } = body;

    // Validate required fields
    if (!isValidEmail(to)) {
      return new Response(JSON.stringify({ error: "Invalid recipient email address." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!subject || typeof subject !== "string" || subject.trim().length === 0 || subject.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid subject line." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!emailBody || typeof emailBody !== "string" || emailBody.trim().length === 0 || emailBody.length > 10000) {
      return new Response(JSON.stringify({ error: "Invalid email body." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Email service temporarily unavailable." }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sender identity — always from our domain for deliverability, but with user's name
    const senderName = fromName?.trim() ? `${fromName.trim()} via ATS Pro` : "ATS Pro Resume Builder";
    const SENDER = `${senderName} <no-reply@atsproresumebuilder.com>`;

    // Validate replyTo if provided
    const replyToEmail = replyTo && isValidEmail(replyTo) ? replyTo : user.email;

    // Convert plain text body to HTML preserving line breaks
    const htmlBody = emailBody
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");

    const positionContext = position && company
      ? `<p style="color:#6b7280;font-size:13px;margin:0 0 16px;padding:8px 12px;background:#f3f4f6;border-radius:6px;border-left:3px solid #6366f1;">
           📋 Re: <strong>${position}</strong> at <strong>${company}</strong>
         </p>`
      : "";

    const html = `
      <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:640px;margin:0 auto;padding:32px 20px;">
        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
          ${positionContext}
          <div style="color:#1f2937;font-size:15px;line-height:1.7;">
            ${htmlBody}
          </div>
        </div>
        <p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:24px;">
          Sent via <a href="https://atsproresumebuilder.com" style="color:#6366f1;text-decoration:none;">ATS Pro Resume Builder</a>
          ${replyToEmail ? `· Reply to: <a href="mailto:${replyToEmail}" style="color:#6366f1;text-decoration:none;">${replyToEmail}</a>` : ""}
        </p>
      </div>
    `;

    const resendPayload: Record<string, unknown> = {
      from: SENDER,
      to: [to],
      subject: subject.trim(),
      html,
    };

    if (replyToEmail) {
      resendPayload.reply_to = replyToEmail;
    }

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      return new Response(JSON.stringify({ error: "Failed to send email. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log the sent email in job_applications notes (optional audit trail)
    try {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      await supabaseAdmin.from("job_applications").update({
        notes: `[Email sent to ${to} on ${new Date().toLocaleDateString()}]`,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id).eq("company", company ?? "").eq("position", position ?? "");
    } catch {
      // Non-critical — don't fail the request
    }

    return new Response(JSON.stringify({ success: true, messageId: resendData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
