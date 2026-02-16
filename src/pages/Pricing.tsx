import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Crown, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import { useLocalCurrency } from "@/hooks/useLocalCurrency";

declare global {
  interface Window { Razorpay: any; }
}

export default function Pricing() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isPro, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const localCurrency = useLocalCurrency();

  const PLANS = [
    {
      id: "free", name: t.pricingPage.freeName, period: "", description: t.pricingPage.freeDesc,
      features: [t.pricingPage.oneResume, t.pricingPage.basicTemplates, t.pricingPage.pdfDownload, t.pricingPage.jobTrackerLimit],
      icon: <Zap className="h-6 w-6" />,
    },
    {
      id: "pro_monthly", name: t.pricingPage.proName, period: t.pricingPage.perMonth, description: t.pricingPage.proDesc,
      features: [t.pricingPage.unlimitedResumes, t.pricingPage.allPremiumTemplates, t.pricingPage.aiResumeGrading, t.pricingPage.aiResumeTailoring, t.pricingPage.coverLetterGen, t.pricingPage.unlimitedJobTracking, t.pricingPage.prioritySupport],
      icon: <Crown className="h-6 w-6" />, popular: true,
    },
  ];

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan: (typeof PLANS)[0]) => {
    if (!user) { navigate("/"); return; }
    if (plan.id === "free") return;
    setProcessingPlan(plan.id);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Failed to load payment gateway");
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-order`,
        { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionData.session?.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }, body: JSON.stringify({ plan_name: plan.id, amount: localCurrency.proPrice, currency: localCurrency.code }) }
      );
      if (!response.ok) { const errData = await response.json(); throw new Error(errData.error || "Failed to create order"); }
      const orderData = await response.json();
      const options = {
        key: orderData.key_id, amount: orderData.amount, currency: orderData.currency,
        name: "ATS Pro Resume Builder", description: `${plan.name} Plan - Monthly Subscription`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-verify`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionData.session?.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY }, body: JSON.stringify({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature }) });
            if (!verifyResponse.ok) throw new Error("Payment verification failed");
            toast({ title: t.pricingPage.paymentSuccess, description: t.pricingPage.proActive });
            window.location.reload();
          } catch { toast({ title: t.pricingPage.verificationError, description: t.pricingPage.verificationErrorDesc, variant: "destructive" }); }
        },
        prefill: { email: user.email },
        theme: { color: "#6366f1" },
        modal: { ondismiss: () => setProcessingPlan(null) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => { toast({ title: t.pricingPage.paymentFailed, description: t.pricingPage.paymentFailedDesc, variant: "destructive" }); setProcessingPlan(null); });
      rzp.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({ title: t.pricingPage.paymentError, description: error.message || "Something went wrong.", variant: "destructive" });
    } finally { setProcessingPlan(null); }
  };

  return (
    <div className="container mx-auto max-w-4xl py-10 px-4">
      <SEOHead title="Pricing — ATS Pro Resume Builder" description="Compare free and pro plans for ATS Pro Resume Builder. AI resume grading, tailoring, cover letters, and unlimited resumes starting at ₹299/month." canonical="https://atsproresumebuilder.com/pricing" keywords="resume builder pricing, ATS pro plans, AI resume subscription" />
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => user ? navigate("/dashboard") : navigate("/")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">{t.pricingPage.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.pricingPage.subtitle}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
        {PLANS.map((plan) => (
          <Card key={plan.id} className={`relative overflow-hidden transition-all ${plan.popular ? "border-primary shadow-lg shadow-primary/10" : "border-border"}`}>
            {plan.popular && <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">{t.pricingPage.mostPopular}</div>}
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">{plan.icon}</div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-extrabold">{plan.id === "free" ? localCurrency.formatPrice(0) : localCurrency.formatProPrice()}</span>
                {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-primary shrink-0" />{feature}</li>
                ))}
              </ul>
              <Button className="w-full" variant={plan.popular ? "default" : "outline"} disabled={plan.id === "free" || (isPro && plan.id === "pro_monthly") || processingPlan === plan.id || subLoading} onClick={() => handleSubscribe(plan)}>
                {isPro && plan.id === "pro_monthly" ? t.pricingPage.currentPlan : plan.id === "free" ? t.pricingPage.currentPlan : processingPlan === plan.id ? t.pricingPage.processing : t.pricingPage.subscribeNow}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
