import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown, Calendar, IndianRupee } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const PLAN_CONFIG: Record<string, { name: string; days: number; amount: number; message: string }> = {
  pro_weekly: {
    name: "7-Day Pro",
    days: 7,
    amount: 99,
    message:
      "Your 7-Day Pro plan is now active. You have full access to all premium features — unlimited resumes, AI grading & tailoring, cover letter generator, and more — for the next 7 days. Make the most of your week — start building your dream resume now!",
  },
  pro_biweekly: {
    name: "14-Day Pro",
    days: 14,
    amount: 179,
    message:
      "Your 14-Day Pro plan is now active. Enjoy two full weeks of unlimited access to all Pro features — AI-powered resume optimization, job matching, LinkedIn import, and priority support. You've got 14 days to supercharge your job search!",
  },
  pro_monthly: {
    name: "Monthly Pro",
    days: 30,
    amount: 299,
    message:
      "Your Monthly Pro plan is now active. You now have 30 days of complete access to every premium feature — unlimited resumes, AI grading, one-click tailoring, cover letters, email outreach, and priority support. This is your month to land your dream job — let's make it happen!",
  },
};

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activating, setActivating] = useState(true);
  const [done, setDone] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const planId = searchParams.get("plan") || "";
  const plan = PLAN_CONFIG[planId];

  useEffect(() => {
    if (authLoading || !user || !plan || done) return;

    const activate = async () => {
      setActivating(true);
      const now = new Date();
      const expires = new Date(now.getTime() + plan.days * 24 * 60 * 60 * 1000);
      setExpiresAt(expires.toLocaleDateString());

      // Check if user already has an active subscription for this window
      const { data: existing } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gte("expires_at", now.toISOString())
        .maybeSingle();

      if (!existing) {
        await supabase.from("user_subscriptions").insert({
          user_id: user.id,
          plan_name: planId,
          status: "active",
          amount: plan.amount,
          currency: "INR",
          starts_at: now.toISOString(),
          expires_at: expires.toISOString(),
        });
      } else {
        // Already active — just show confirmation
        const { data: sub } = await supabase
          .from("user_subscriptions")
          .select("expires_at")
          .eq("id", existing.id)
          .single();
        if (sub?.expires_at) setExpiresAt(new Date(sub.expires_at).toLocaleDateString());
      }

      setActivating(false);
      setDone(true);
    };

    activate();
  }, [authLoading, user, plan, done]);

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <SEOHead title="Payment — ATS Pro Resume Builder" description="Payment confirmation page." />
        <p className="text-muted-foreground mb-4">Invalid or missing plan information.</p>
        <Button onClick={() => navigate("/pricing")}>Back to Pricing</Button>
      </div>
    );
  }

  if (authLoading || activating) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Activating your plan…
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-10 bg-background">
      <SEOHead title="Payment Successful — ATS Pro Resume Builder" description="Your Pro plan has been activated." />
      <Card className="max-w-lg w-full border-primary/30 shadow-xl shadow-primary/10">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-9 w-9 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">🎉 Thank You for Subscribing!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground text-center">{plan.message}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <Crown className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Plan</p>
              <p className="font-semibold text-sm">{plan.name}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-semibold text-sm">{plan.days} Days</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <IndianRupee className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Amount Paid</p>
              <p className="font-semibold text-sm">₹{plan.amount}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-xs text-muted-foreground">Expires On</p>
              <p className="font-semibold text-sm">{expiresAt}</p>
            </div>
          </div>

          <Button className="w-full gap-1.5" onClick={() => navigate("/dashboard")}>
            <Crown className="h-4 w-4" /> Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
