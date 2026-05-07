import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type SubscriptionStatus = "free" | "active" | "expired" | "pending";

interface Subscription {
  id: string;
  plan_name: string;
  status: string;
  starts_at: string | null;
  expires_at: string | null;
  amount: number;
  currency: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (error) {
        console.error("Error fetching subscription:", error);
      }
      setSubscription(data);
      setLoading(false);
    };

    fetchSubscription();
  }, [user]);

  const getStatus = (): SubscriptionStatus => {
    if (!subscription) return "free";
    if (subscription.status === "pending") return "pending";
    if (subscription.status === "active") {
      if (subscription.expires_at && new Date(subscription.expires_at) < new Date()) {
        return "expired";
      }
      return "active";
    }
    return "free";
  };

  const currentStatus = getStatus();
  return { subscription, loading, status: currentStatus, isPro: currentStatus === "active" };
}
