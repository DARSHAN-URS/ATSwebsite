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
import Logo from "@/components/Logo";
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
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col md:flex-row font-sans overflow-hidden">
      <SEOHead title="Access Control — ResumePro" description="Initialize your professional architecture and authentication protocols." />
      
      <div className="hidden md:flex md:w-1/2 bg-slate-900 relative items-center justify-center p-20">
         <div className="absolute inset-0 bg-blue-600/10 pointer-events-none" />
         <div className="relative z-10 space-y-12 max-w-lg">
            <Link to="/" className="flex items-center gap-4 group">
               <Logo variant="light" className="h-12" />
            </Link>
            
            <div className="space-y-6">
               <h1 className="text-2xl md:text-4xl md:text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">
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
               <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{isLogin ? "Welcome Back" : "Create Account"}</h2>
               <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">{isLogin ? "Sign in to your account" : "Get started with ResumePro"}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 p-2 bg-white dark:bg-slate-800 rounded-[2rem]">
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
                           <Input required value={displayName} onChange={e => setDisplayName(e.target.value)} className="h-16 rounded-2xl bg-white dark:bg-slate-800 border-none px-14 font-bold" placeholder="Architect Name" />
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
               <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Vector</Label>
                  <div className="relative">
                     <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                     <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-16 rounded-2xl bg-white dark:bg-slate-800 border-none px-14 font-bold" placeholder="architect@resumepro.ai" />
                  </div>
               </div>
               <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Access Key</Label>
                  <div className="relative">
                     <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                     <Input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-16 rounded-2xl bg-white dark:bg-slate-800 border-none px-14 font-bold" placeholder="••••••••" />
                  </div>
               </div>
               <Button disabled={loading} className="w-full h-16 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-blue-600/30 gap-4 mt-6">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  {isLogin ? "Login" : "Sign Up"}
               </Button>
            </form>

            <div className="relative py-4">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800" /></div>
               <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400"><span className="bg-white dark:bg-slate-900 px-4">Or continue with</span></div>
            </div>

            <div className="grid grid-cols-1 gap-4">
               <Button variant="outline" onClick={() => handleSocialLogin("google")} className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 font-black uppercase tracking-widest text-[10px] gap-3">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
               </Button>
               
               <Button variant="outline" onClick={() => handleSocialLogin("apple")} className="h-14 rounded-2xl border-slate-100 dark:border-slate-800 font-black uppercase tracking-widest text-[10px] gap-3">
                  <svg viewBox="0 0 384 512" className="w-4 h-4 text-slate-900 dark:text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                  </svg>
                  Sign in with Apple
               </Button>
            </div>
         </Card>
      </div>
    </div>
  );
}
