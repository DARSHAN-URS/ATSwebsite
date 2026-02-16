import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Crown, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import { useLocalCurrency } from "@/hooks/useLocalCurrency";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PLANS = [
  {
    id: "free",
    name: "Free",
    period: "",
    description: "Get started with basic features",
    features: [
      "1 Resume",
      "Basic Templates",
      "PDF Download",
      "Job Tracker (up to 10)",
    ],
    icon: <Zap className="h-6 w-6" />,
  },
  {
    id: "pro_monthly",
    name: "Pro",
    period: "/month",
    description: "Unlock all premium features",
    features: [
      "Unlimited Resumes",
      "All Premium Templates",
      "AI Resume Grading",
      "AI Resume Tailoring",
      "Cover Letter Generator",
      "Unlimited Job Tracking",
      "Priority Support",
    ],
    icon: <Crown className="h-6 w-6" />,
    popular: true,
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const { isPro, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const localCurrency = useLocalCurrency();

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan: (typeof PLANS)[0]) => {
    if (!user) {
      navigate("/");
      return;
    }

    if (plan.id === "free") return;

    setProcessingPlan(plan.id);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load payment gateway");
      }

      // Create order via edge function
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            plan_name: plan.id,
            amount: localCurrency.proPrice,
            currency: localCurrency.code,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to create order");
      }

      const orderData = await response.json();

      // Open Razorpay checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ATS Pro Resume Builder",
        description: `${plan.name} Plan - Monthly Subscription`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          // Verify payment
          try {
            const verifyResponse = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${sessionData.session?.access_token}`,
                  apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            toast({
              title: "Payment Successful! 🎉",
              description: "Your Pro subscription is now active.",
            });

            // Reload to reflect subscription
            window.location.reload();
          } catch {
            toast({
              title: "Verification Error",
              description: "Payment was made but verification failed. Please contact support.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: () => {
            setProcessingPlan(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        toast({
          title: "Payment Failed",
          description: "Your payment could not be processed. Please try again.",
          variant: "destructive",
        });
        setProcessingPlan(null);
      });
      rzp.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-10 px-4">
      <SEOHead
        title="Pricing — ATS Pro Resume Builder"
        description="Choose a plan that fits your needs. Upgrade to Pro for unlimited resumes, AI grading, and more."
        noindex
      />

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Choose Your Plan</h1>
        <p className="mt-2 text-muted-foreground">
          Upgrade to Pro to unlock all premium features
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative overflow-hidden transition-all ${
              plan.popular
                ? "border-primary shadow-lg shadow-primary/10"
                : "border-border"
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">
                Most Popular
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {plan.icon}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-extrabold">
                  {plan.id === "free" ? localCurrency.formatPrice(0) : localCurrency.formatProPrice()}
                </span>
                {plan.period && (
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                disabled={
                  plan.id === "free" ||
                  (isPro && plan.id === "pro_monthly") ||
                  processingPlan === plan.id ||
                  subLoading
                }
                onClick={() => handleSubscribe(plan)}
              >
                {isPro && plan.id === "pro_monthly"
                  ? "Current Plan"
                  : plan.id === "free"
                  ? "Current Plan"
                  : processingPlan === plan.id
                  ? "Processing..."
                  : "Subscribe Now"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
