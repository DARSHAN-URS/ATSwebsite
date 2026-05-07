import { supabase } from "@/integrations/supabase/client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Custom invoker that routes migrated functions to Railway
 * and falls back to Supabase Edge Functions for others.
 */
export const invokeFunction = async (name: string, options: any) => {
  // Extract body from options if it's in { body: ... } format, else use options as body
  const body = options?.body !== undefined ? options.body : options;
  console.log(`[API Client] Calling ${name}. Backend URL: ${BACKEND_URL || "NOT SET (Falling back to Supabase)"}`);

  if (BACKEND_URL) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Determine the correct Railway endpoint path
      let path = `/api/ai/${name}`;
      
      // Special mappings for non-AI routes
      if (name === "assign-role") {
        path = "/api/auth/assign-role";
      } else if (name === "send-outreach" || name === "send-email" || name === "send-outreach-email") {
        path = "/api/emails/send-outreach";
      } else if (name === "contact") {
        path = "/api/emails/contact";
      } else if (name === "activate-subscription") {
        path = "/api/payments/activate-subscription";
      }

      const response = await fetch(`${BACKEND_URL}${path}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        return { data, error: null };
      }

      // If Railway returns 404, it means this specific function isn't implemented in Node.js yet.
      // Fallback to Supabase Edge Function to ensure service continuity.
      if (response.status === 404) {
        console.warn(`[API Client] Function "${name}" not found on Railway (${path}). Falling back to Supabase.`);
        return await supabase.functions.invoke(name, { body });
      }

      const errData = await response.json().catch(() => ({ error: response.statusText }));
      console.error(`[API Client] Railway API Error (${name}):`, errData);
      return { data: null, error: errData };
    } catch (err: any) {
      console.error(`[API Client] Railway Critical Error (${name}):`, err);
      // Fallback to Supabase on network/unexpected errors to avoid blocking the user
      console.warn(`[API Client] Falling back to Supabase for "${name}" due to network error.`);
      return await supabase.functions.invoke(name, { body });
    }
  }

  // Default to Supabase if BACKEND_URL is not configured
  return await supabase.functions.invoke(name, { body });
};
