import { supabase } from "@/integrations/supabase/client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Custom invoker that routes migrated functions to Railway
 * and falls back to Supabase Edge Functions for others.
 */
export const invokeFunction = async (name: string, options: { body: any }) => {
  // List of functions that have been moved to Railway
  const migratedFunctions = [
    "ai-apply", 
    "parse-resume", 
    "resume-assist", 
    "grade-resume", 
    "tailor-resume", 
    "interview-prep", 
    "sync-linkedin", 
    "send-outreach",
    "generate-cover-letter",
    "send-email"
  ];
  
  if (migratedFunctions.includes(name)) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Map names to their new Railway endpoints if different
      const endpointMap: Record<string, string> = {
        "ai-apply": "/api/ai/ai-apply",
        "parse-resume": "/api/ai/parse-resume",
        "resume-assist": "/api/ai/resume-assist",
        "grade-resume": "/api/ai/grade-resume",
        "tailor-resume": "/api/ai/tailor-resume",
        "interview-prep": "/api/ai/interview-prep",
        "sync-linkedin": "/api/ai/sync-linkedin",
        "generate-cover-letter": "/api/ai/generate-cover-letter",
        "send-outreach": "/api/emails/send-outreach",
        "send-email": "/api/emails/send-outreach" // Reuse outreach for now
      };

      const path = endpointMap[name] || `/api/ai/${name}`;
      
      const response = await fetch(`${BACKEND_URL}${path}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options.body),
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: response.statusText }));
        return { data: null, error: errData };
      }
      
      const data = await response.json();
      return { data, error: null };
    } catch (err: any) {
      console.error(`Railway API Error (${name}):`, err);
      return { data: null, error: err };
    }
  }
  
  // Fallback to standard Supabase functions
  return await supabase.functions.invoke(name, options);
};
