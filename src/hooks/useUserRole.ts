import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "job_seeker" | "recruiter";

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching role:", error);
      }
      setRole((data?.role as AppRole) ?? null);
      setLoading(false);
    };

    fetchRole();
  }, [user]);

  const setUserRole = async (newRole: AppRole) => {
    if (!user) return;
    const { data, error } = await supabase.functions.invoke("assign-role", {
      body: { role: newRole },
    });

    if (error || data?.error) {
      const msg = data?.error || error?.message || "Failed to assign role";
      return { message: msg };
    }
    setRole(newRole);
    return null;
  };

  return { role, loading, setUserRole };
}
