import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, Eye, EyeOff, Check, X, ShieldCheck, Zap, Lock, ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { miscTranslations } from "@/i18n/miscTranslations";
import { motion } from "framer-motion";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { locale } = useLanguage();
  const mt = miscTranslations[locale].resetPw;

  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isValid = hasMinLength && hasUppercase && hasNumber && passwordsMatch;

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get("type") === "recovery") setIsRecovery(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setIsRecovery(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: mt.invalidTitle, description: error.message, variant: "destructive" });
    } else {
      toast({ title: mt.successTitle, description: mt.successDesc });
      navigate("/dashboard");
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center font-sans">
        <div className="space-y-6 max-w-md">
           <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mx-auto">
              <ShieldCheck className="w-8 h-8 opacity-20" />
           </div>
           <h2 className="text-2xl font-black uppercase tracking-tight">{mt.invalidTitle}</h2>
           <p className="text-slate-500 font-medium leading-relaxed">{mt.invalidDesc}</p>
           <Button onClick={() => navigate("/")} className="h-14 px-8 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px]">{mt.goHome}</Button>
        </div>
      </div>
    );
  }

  const Requirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
      <div className={met ? "text-emerald-500" : "text-slate-300"}>
         {met ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
      </div>
      <span className={met ? "text-emerald-600" : "text-slate-400"}>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-8 font-sans overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/5 via-transparent to-transparent -z-10" />

      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }} 
         animate={{ opacity: 1, scale: 1 }}
         className="w-full max-w-md space-y-12 relative z-10"
      >
        <div className="text-center space-y-6">
           <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 mx-auto">
              <Lock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Secure Password Reset</span>
           </div>
           <div className="space-y-2">
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">{mt.title}<span className="text-blue-600">.</span></h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{mt.subtitle}</p>
           </div>
        </div>

        <Card className="rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-[0_40px_80px_rgba(0,0,0,0.06)] overflow-hidden">
          <form onSubmit={handleReset}>
            <CardContent className="p-10 space-y-8">
              <div className="space-y-6">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{mt.newPassword}</Label>
                    <div className="relative">
                       <Input id="new-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="h-14 rounded-2xl bg-white border-slate-100 font-bold px-6 pr-12 focus-visible:ring-blue-600" />
                       <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                       </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 pt-2">
                       <Requirement met={hasMinLength} text={mt.minLength} />
                       <Requirement met={hasUppercase} text={mt.uppercase} />
                       <Requirement met={hasNumber} text={mt.number} />
                    </div>
                 </div>
                 
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{mt.confirmPassword}</Label>
                    <Input id="confirm-password" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="h-14 rounded-2xl bg-white border-slate-100 font-bold px-6 focus-visible:ring-blue-600" />
                    {confirmPassword && (
                       <div className="pt-1">
                          <Requirement met={passwordsMatch} text={passwordsMatch ? mt.match : mt.noMatch} />
                       </div>
                    )}
                 </div>
              </div>

              <div className="pt-4">
                 <Button type="submit" className="w-full h-18 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-blue-600 transition-all gap-3" disabled={loading || !isValid}>
                    {loading ? mt.updating : mt.updateBtn} <ArrowRight className="w-4 h-4" />
                 </Button>
              </div>
            </CardContent>
          </form>
        </Card>

        <div className="text-center opacity-20">
           <ShieldCheck className="w-8 h-8 mx-auto text-slate-900 dark:text-white" />
        </div>
      </motion.div>
    </div>
  );
}
