import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import React from "react";
import { invokeFunction } from "@/lib/api-client";

export type AppRole = "job_seeker" | "recruiter";

interface UserRoleContextType {
  role: AppRole | null;
  loading: boolean;
  setUserRole: (newRole: AppRole) => Promise<{ message: string } | null>;
}

const UserRoleContext = createContext<UserRoleContextType>({
  role: null,
  loading: true,
  setUserRole: async () => null,
});

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
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
      if (!cancelled) {
        setRole((data?.role as AppRole) ?? null);
        setLoading(false);
      }
    };

    fetchRole();
    return () => { cancelled = true; };
  }, [user]);

  const setUserRole = async (newRole: AppRole) => {
    if (!user) return null;
    const { data, error } = await invokeFunction("assign-role", {
      body: { role: newRole },
    });

    if (error || data?.error) {
      const msg = data?.error || error?.message || "Failed to assign role";
      return { message: msg };
    }
    setRole(newRole);
    return null;
  };

  return React.createElement(
    UserRoleContext.Provider,
    { value: { role, loading, setUserRole } },
    children
  );
}

export function useUserRole() {
  return useContext(UserRoleContext);
}
