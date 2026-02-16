import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SENDER = "ATS Pro Resume Builder <no-reply@atsproresumebuilder.com>";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, redirectTo } = await req.json();

    if (!type || !email) {
      return new Response(JSON.stringify({ error: "Missing type or email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Resend not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to generate magic links / password reset links
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    let subject = "";
    let html = "";

    if (type === "password_reset") {
      // Generate a password reset link via admin API
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo },
      });

      if (error || !data) {
        console.error("Generate link error:", error);
        return new Response(
          JSON.stringify({ error: error?.message || "Failed to generate reset link" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const resetLink = `${redirectTo}#access_token=${data.properties.access_token}&refresh_token=${data.properties.refresh_token}&type=recovery`;

      subject = "Reset Your Password — ATS Pro Resume Builder";
      html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">ATS Pro Resume Builder</h1>
          </div>
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
            <h2 style="color: #1a1a2e; font-size: 20px; margin: 0 0 16px;">Reset Your Password</h2>
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
              We received a request to reset your password. Click the button below to set a new password. This link expires in 1 hour.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}" style="background: #6366f1; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0;">
              If you didn't request this, you can safely ignore this email. Your password won't change.
            </p>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 32px;">
            © ${new Date().getFullYear()} ATS Pro Resume Builder. All rights reserved.
          </p>
        </div>
      `;
    } else if (type === "signup_confirmation") {
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email,
        options: { redirectTo },
      });

      if (error || !data) {
        console.error("Generate link error:", error);
        return new Response(
          JSON.stringify({ error: error?.message || "Failed to generate confirmation link" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const confirmLink = `${redirectTo}#access_token=${data.properties.access_token}&refresh_token=${data.properties.refresh_token}&type=signup`;

      subject = "Confirm Your Email — ATS Pro Resume Builder";
      html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">ATS Pro Resume Builder</h1>
          </div>
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
            <h2 style="color: #1a1a2e; font-size: 20px; margin: 0 0 16px;">Welcome! Confirm Your Email</h2>
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
              Thanks for signing up! Click the button below to confirm your email address and get started.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${confirmLink}" style="background: #6366f1; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; display: inline-block;">
                Confirm Email
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0;">
              If you didn't create this account, you can safely ignore this email.
            </p>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 32px;">
            © ${new Date().getFullYear()} ATS Pro Resume Builder. All rights reserved.
          </p>
        </div>
      `;
    } else {
      return new Response(JSON.stringify({ error: "Invalid email type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: SENDER,
        to: [email],
        subject,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      return new Response(JSON.stringify({ error: resendData.message || "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: resendData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
