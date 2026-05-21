import { supabase } from "@/integrations/supabase/client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Custom invoker that routes migrated functions to Railway
 * and falls back to Supabase Edge Functions for others.
 */
export const invokeFunction = async (name: string, options: any) => {
  // Extract body from options if it's in { body: ... } format, else use options as body
  const body = options?.body !== undefined ? options.body : options;
  console.log(`[API Client] Calling ${name}. Backend URL: ${BACKEND_URL || "NOT SET"}`);

  if (!BACKEND_URL) {
    const errorMsg = `Backend URL is not set. Cannot invoke function ${name}.`;
    console.error(`[API Client] ${errorMsg}`);
    return { data: null, error: new Error(errorMsg) };
  }

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
    } else if (name === "create-checkout") {
      path = "/api/payments/create-checkout";
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

    const errData = await response.json().catch(() => ({ error: response.statusText }));
    console.error(`[API Client] Railway API Error (${name}):`, errData);
    return { data: null, error: errData };
  } catch (err: any) {
    console.error(`[API Client] Railway Critical Error (${name}):`, err);
    return { data: null, error: err };
  }
};
