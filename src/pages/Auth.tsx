import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Sparkles, Loader2, Mail, Lock, User, Chrome, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { cn } from "@/lib/utils";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email, password, options: { data: { display_name: displayName } }
        });
        if (error) throw error;
        toast({ title: "Account Initialized", description: "Verification link dispatched to your email vector." });
      }
    } catch (err: any) {
      toast({ title: "Protocol Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider, options: { redirectTo: `${window.location.origin}/dashboard` }
    });
    if (error) toast({ title: "Authentication Failed", description: error.message, variant: "destructive" });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col md:flex-row font-sans overflow-hidden">
      <SEOHead title="Access Control — ResumePro" description="Initialize your professional architecture and authentication protocols." />
      
      <div className="hidden md:flex md:w-1/2 bg-slate-900 relative items-center justify-center p-20">
         <div className="absolute inset-0 bg-blue-600/10 pointer-events-none" />
         <div className="relative z-10 space-y-12 max-w-lg">
            <Link to="/" className="flex items-center gap-4 group">
               <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-600/40 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-8 h-8" />
               </div>
               <span className="text-3xl font-black text-white tracking-tighter">RESUME<span className="text-blue-600">PRO</span></span>
            </Link>
            
            <div className="space-y-6">
               <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">
                  Access <br /> <span className="text-blue-600">Protocol.</span>
               </h1>
               <p className="text-xl text-slate-400 font-medium leading-relaxed">
                  Initialize your professional identity matrix and deploy high-fidelity career architectures.
               </p>
            </div>

            <div className="space-y-8 pt-10 border-t border-slate-800">
               {[
                  { icon: Sparkles, title: "Neural Synthesis", desc: "AI-driven architectural optimization." },
                  { icon: Lock, title: "Data Integrity", desc: "Bank-grade encryption protocols." },
                  { icon: User, title: "Identity Control", desc: "Modular professional management." }
               ].map((item, i) => (
                  <div key={i} className="flex gap-5">
                     <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-500"><item.icon className="w-6 h-6" /></div>
                     <div className="space-y-1">
                        <h4 className="font-black text-white uppercase text-[10px] tracking-widest">{item.title}</h4>
                        <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-20 relative">
         <Link to="/" className="absolute top-10 left-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Return to Base
         </Link>

         <Card className="w-full max-w-md rounded-[4rem] border-none bg-white dark:bg-slate-900 shadow-[0_40px_100px_rgba(0,0,0,0.05)] p-12 space-y-10">
            <div className="space-y-2 text-center">
               <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{isLogin ? "Authenticate" : "Register Matrix"}</h2>
               <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">{isLogin ? "Welcome back, Architect." : "Deploy your professional module."}</p>
            </div>

            <div className="grid grid-cols-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-[2rem]">
               <button onClick={() => setIsLogin(true)} className={cn("h-12 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all", isLogin ? "bg-white dark:bg-slate-700 text-blue-600 shadow-xl" : "text-slate-400")}>Login</button>
               <button onClick={() => setIsLogin(false)} className={cn("h-12 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all", !isLogin ? "bg-white dark:bg-slate-700 text-blue-600 shadow-xl" : "text-slate-400")}>Signup</button>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
               <AnimatePresence mode="wait">
                  {!isLogin && (
                     <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Identification</Label>
                        <div className="relative">
                           <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                           <Input required value={displayName} onChange={e => setDisplayName(e.target.value)} className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-14 font-bold" placeholder="Architect Name" />
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
               <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Vector</Label>
                  <div className="relative">
                     <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                     <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-14 font-bold" placeholder="architect@resumepro.ai" />
                  </div>
               </div>
               <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Access Key</Label>
                  <div className="relative">
                     <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                     <Input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-14 font-bold" placeholder="••••••••" />
                  </div>
               </div>
               <Button disabled={loading} className="w-full h-16 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-blue-600/30 gap-4 mt-6">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  {isLogin ? "Execute Login" : "Initialize Account"}
               </Button>
            </form>

            <div className="relative py-4">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800" /></div>
               <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400"><span className="bg-white dark:bg-slate-900 px-4">Social Protocols</span></div>
            </div>

            <div className="grid grid-cols-1 gap-4">
               <Button variant="outline" onClick={() => handleSocialLogin("google")} className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 font-black uppercase tracking-widest text-[10px] gap-3">
                  <Chrome className="w-4 h-4" /> Google Matrix
               </Button>
            </div>
         </Card>
      </div>
    </div>
  );
}
