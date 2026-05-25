import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown, Calendar, IndianRupee, Zap, ShieldCheck, ArrowRight, Loader2, Sparkles } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { motion, AnimatePresence } from "framer-motion";

const PLAN_CONFIG: Record<string, { name: string; days: number; amount: number; message: string }> = {
  pro_weekly: {
    name: "7-Day Pro",
    days: 7,
    amount: 198,
    message: "Your 7-Day Pro plan is now active. You have full access to all premium features for the next 7 days.",
  },
  pro_biweekly: {
    name: "14-Day Pro",
    days: 14,
    amount: 358,
    message: "Your 14-Day Pro plan is now active. Enjoy two full weeks of unlimited access to all Pro features.",
  },
  pro_monthly: {
    name: "Monthly Pro",
    days: 30,
    amount: 598,
    message: "Your Monthly Pro plan is now active. You now have 30 days of complete access to every premium feature.",
  },
};

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activating, setActivating] = useState(true);
  const [done, setDone] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  
  const planId = searchParams.get("plan") || "";
  const token = searchParams.get("token") || "";
  const sessionId = searchParams.get("session_id") || "";
  
  const plan = activePlanId ? PLAN_CONFIG[activePlanId] : PLAN_CONFIG[planId];

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user || done || (!token && !sessionId)) return;

    const activate = async () => {
      setActivating(true);
      setError(null);

      try {
        if (sessionId) {
          // Stripe verification flow
          const { data, error: invokeError } = await invokeFunction("verify-session", {
            body: { session_id: sessionId },
          });

          if (invokeError || data?.error) {
            console.error("Session verification error:", invokeError || data?.error);
            setError(data?.error || "Verification failed. Please contact support.");
            setActivating(false);
            return;
          }

          if (data?.plan_id) {
            setActivePlanId(data.plan_id);
          }
          if (data?.expires_at) {
            setExpiresAt(new Date(data.expires_at).toLocaleDateString());
          }
        } else if (token && planId) {
          // Legacy/Mock activation flow
          setActivePlanId(planId);
          const { data, error: invokeError } = await invokeFunction("activate-subscription", {
            body: { plan_id: planId, token },
          });

          if (invokeError || data?.error) {
            console.error("Activation error:", invokeError || data?.error);
            setError(data?.error || "Activation failed. Please contact support.");
            setActivating(false);
            return;
          }

          if (data?.expires_at) {
            setExpiresAt(new Date(data.expires_at).toLocaleDateString());
          }
        }
      } catch (err: any) {
        console.error("Critical error:", err);
        setError("An unexpected error occurred. Please try again.");
      }

      setActivating(false);
      setDone(true);
    };

    activate();
  }, [authLoading, user, done, token, sessionId, planId]);

  if ((!plan && !sessionId && !activePlanId) || (!token && !sessionId)) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center font-sans">
        <SEOHead title="Payment — ResumePro" description="Payment confirmation page." />
        <div className="space-y-6 max-w-md">
           <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mx-auto">
              <ShieldCheck className="w-8 h-8 opacity-20" />
           </div>
           <h2 className="text-2xl font-black uppercase tracking-tight">Verification Error</h2>
           <p className="text-slate-500 font-medium leading-relaxed">
             {!token && !sessionId ? "Missing payment verification token. If you completed payment, please contact support." : "Invalid or missing plan information."}
           </p>
           <Button onClick={() => navigate("/pricing")} className="h-14 px-8 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px]">Back to Pricing</Button>
        </div>
      </div>
    );
  }

  if (authLoading || (activating && !error)) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center font-sans">
        <div className="space-y-6">
           <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Initializing Premium Architecture...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center font-sans">
        <SEOHead title="Payment — ResumePro" description="Payment confirmation page." />
        <div className="space-y-8 max-w-md">
           <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mx-auto shadow-2xl shadow-blue-600/10">
              <Zap className="w-10 h-10" />
           </div>
           <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase tracking-tight">Activation Pending</h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                Please sign in to activate your <strong>{plan.name}</strong> plan. Your payment has been received — once you log in, your plan will be activated automatically.
              </p>
           </div>
           <Button onClick={() => navigate("/?login=true&redirect=" + encodeURIComponent("/payment-success?plan=" + planId + "&token=" + token))} className="h-16 w-full rounded-2xl bg-blue-600 text-white font-bold uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-600/20">
             Sign In to Activate
           </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center font-sans">
        <SEOHead title="Activation Error — ResumePro" description="Payment activation error." />
        <div className="space-y-6 max-w-md">
           <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-600 mx-auto">
              <ShieldCheck className="w-10 h-10" />
           </div>
           <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">Deployment Failed</h2>
              <p className="text-rose-600/80 font-bold uppercase text-[10px] tracking-widest">{error}</p>
           </div>
           <Button onClick={() => navigate("/pricing")} className="h-14 px-8 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px]">Back to Pricing</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-8 font-sans overflow-hidden">
      <SEOHead title="Mission Accomplished — ResumePro" description="Your Pro plan has been activated." />
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-full lg:w-[400px] h-auto lg:h-[400px] bg-emerald-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <motion.div 
         initial={{ opacity: 0, y: 40 }} 
         animate={{ opacity: 1, y: 0 }}
         className="max-w-xl w-full relative z-10"
      >
        <Card className="rounded-[4rem] border-none bg-white dark:bg-slate-900 shadow-[0_40px_80px_rgba(0,0,0,0.06)] overflow-hidden">
           <div className="p-12 text-center space-y-8">
              <div className="relative">
                 <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: "spring", damping: 12, delay: 0.2 }}
                    className="w-24 h-24 rounded-[2.5rem] bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/40 relative z-10"
                 >
                    <CheckCircle className="w-12 h-12" />
                 </motion.div>
                 <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center"
                 >
                    <div className="w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                 </motion.div>
              </div>

              <div className="space-y-4">
                 <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                    <Crown className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Protocol Activated</span>
                 </div>
                 <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">
                    Mission <br /> <span className="text-blue-600">Accomplished.</span>
                 </h1>
                 <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                    {plan.message} Your career infrastructure is now optimized for elite performance.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                 <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Plan</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{plan.name}</p>
                 </div>
                 <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expiry Date</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{expiresAt || "Loading..."}</p>
                 </div>
              </div>

              <div className="pt-8 space-y-4">
                 <Button onClick={() => navigate("/dashboard")} className="h-20 w-full rounded-[2rem] bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[11px] gap-4 shadow-2xl hover:bg-blue-600 transition-all group">
                    Initialize Workspace <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                 </Button>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                    <Sparkles className="w-3 h-3" /> System fully operational
                 </p>
              </div>
           </div>
        </Card>
      </motion.div>
    </div>
  );
}
