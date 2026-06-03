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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      <SEOHead title="Sign In — ATS Pro" description="Sign in to your ATS Pro account to manage your resumes." />
      
      {/* Left panel: Info Panel (Sleek Dark Premium Design) */}
      <div className="hidden md:flex md:w-1/2 bg-[#090D1A] text-white relative flex-col justify-between p-12 lg:p-20 overflow-hidden border-r border-slate-900">
         {/* Decorative Grid & Glow Elements */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />
         <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[90px] pointer-events-none" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
         
         {/* Top Brand Logo */}
         <Link to="/" className="flex items-center gap-4 group relative z-10 w-fit">
            <Logo variant="light" className="h-10 hover:opacity-90 transition-opacity" />
         </Link>
         
         {/* Middle Value Proposition & Mockup Card */}
         <div className="relative z-10 space-y-10 max-w-md my-auto">
            <div className="space-y-4 text-left">
               <span className="text-[9px] font-black uppercase text-blue-400 tracking-[0.2em] bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full inline-block">
                  ATS Resume Optimization
               </span>
               <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tighter leading-[1.05] font-display">
                  Build a resume that <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
                     lands interviews.
                  </span>
               </h1>
               <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  ATS Pro helps you craft recruiter-grade resumes, optimize keyword matching for applicant tracking systems, and manage your pipeline in one unified platform.
               </p>
            </div>

            {/* Interactive Dashboard Mockup Card */}
            <div className="relative group">
               <div className="absolute inset-0 bg-blue-500/15 blur-[40px] rounded-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none" />
               <div className="relative rounded-3xl border border-white/10 bg-slate-950/60 backdrop-blur-2xl p-6 lg:p-8 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Resume Optimizer</span>
                     </div>
                     <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-md">
                        Highly Compatible
                     </span>
                  </div>
                  
                  <div className="space-y-3 text-left">
                     <div className="flex justify-between items-baseline">
                        <span className="text-xs font-semibold text-slate-300">Injecting target keywords...</span>
                        <span className="text-2xl font-black text-white tracking-tight font-display">94%</span>
                     </div>
                     <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                           initial={{ width: "45%" }}
                           animate={{ width: "94%" }}
                           transition={{ duration: 1.8, ease: "easeOut" }}
                           className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 rounded-full"
                        />
                     </div>
                  </div>

                  <div className="space-y-3 pt-2 text-left">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Enhancements</p>
                     <div className="flex flex-wrap gap-2">
                        {[
                           { name: "+ Kubernetes", delay: 0.1 },
                           { name: "+ System Design", delay: 0.2 },
                           { name: "+ Next.js", delay: 0.3 },
                           { name: "Format Standardized", delay: 0.4 }
                        ].map((tag, i) => (
                           <motion.span 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: tag.delay }}
                              key={i} 
                              className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-300 flex items-center gap-1.5"
                           >
                              <span className="w-1 h-1 rounded-full bg-blue-400" />
                              {tag.name}
                           </motion.span>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Bottom Infrastructure Status */}
         <div className="relative z-10 pt-8 border-t border-white/5 flex flex-wrap gap-x-8 gap-y-4 text-left">
            {[
               { label: "AI MATCH GRADER", value: "Instant feedback" },
               { label: "100% PARSABLE", value: "ATS-optimized structures" },
               { label: "CENTRAL PIPELINE", value: "Application manager" }
            ].map((stat, i) => (
               <div key={i} className="space-y-1">
                  <p className="text-[8px] font-black tracking-widest text-slate-500 uppercase">{stat.label}</p>
                  <p className="text-xs font-bold text-slate-300">{stat.value}</p>
               </div>
            ))}
         </div>
      </div>

      {/* Right panel: Auth Card Panel (Pristine, Clean, Beautiful Layout) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-20 relative bg-slate-50/50">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03),transparent_60%)] pointer-events-none" />
         
         <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" /> Back to Home
         </Link>

         {/* Mobile Logo Only */}
         <div className="md:hidden flex justify-center mb-8">
            <Logo variant="dark" className="h-10" />
         </div>

         <Card className="w-full max-w-md rounded-3xl border border-slate-200/50 bg-white shadow-2xl shadow-slate-200/30 p-8 md:p-10 space-y-8 text-left relative overflow-hidden">
            <div className="space-y-2 text-center">
               <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display">{isLogin ? "Welcome back" : "Create your account"}</h2>
               <p className="text-slate-500 text-xs font-medium">{isLogin ? "Sign in to access your resumes" : "Get started with ATS Pro for free"}</p>
            </div>

            {/* Framer Motion Sliding Tabs */}
            <div className="relative grid grid-cols-2 p-1 bg-slate-100/80 rounded-xl border border-slate-200/20">
               <button 
                  type="button"
                  onClick={() => setIsLogin(true)} 
                  className={cn("relative z-10 h-10 rounded-lg text-xs font-bold transition-all duration-300", isLogin ? "text-blue-600" : "text-slate-400 hover:text-slate-600")}
               >
                  Login
               </button>
               <button 
                  type="button"
                  onClick={() => setIsLogin(false)} 
                  className={cn("relative z-10 h-10 rounded-lg text-xs font-bold transition-all duration-300", !isLogin ? "text-blue-600" : "text-slate-400 hover:text-slate-600")}
               >
                  Sign Up
               </button>
               
               {/* Active Slider Indicator */}
               <motion.div
                  className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm border border-slate-200/40"
                  layoutId="activeTabIndicator"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  style={{
                     width: "calc(50% - 4px)",
                     left: isLogin ? "4px" : "calc(50%)",
                  }}
               />
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
               <AnimatePresence mode="wait">
                  {!isLogin && (
                     <motion.div 
                        initial={{ opacity: 0, height: 0, y: -10 }} 
                        animate={{ opacity: 1, height: "auto", y: 0 }} 
                        exit={{ opacity: 0, height: 0, y: -10 }} 
                        transition={{ duration: 0.2 }}
                        className="space-y-2 overflow-hidden"
                     >
                        <Label className="text-xs font-bold text-slate-500 tracking-wider uppercase">Full Name</Label>
                        <div className="relative group">
                           <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                           <Input required value={displayName} onChange={e => setDisplayName(e.target.value)} className="h-12 rounded-xl bg-slate-50/50 border border-slate-200/80 pl-11 font-medium text-sm text-slate-900 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all duration-200" placeholder="Jane Doe" />
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
               
               <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 tracking-wider uppercase">Email Address</Label>
                  <div className="relative group">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                     <Input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-12 rounded-xl bg-slate-50/50 border border-slate-200/80 pl-11 font-medium text-sm text-slate-900 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all duration-200" placeholder="you@example.com" />
                  </div>
               </div>
               
               <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 tracking-wider uppercase">Password</Label>
                  <div className="relative group">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                     <Input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-12 rounded-xl bg-slate-50/50 border border-slate-200/80 pl-11 font-medium text-sm text-slate-900 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all duration-200" placeholder="••••••••" />
                  </div>
               </div>
               
               <Button disabled={loading} className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all gap-2 mt-4 duration-200">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {isLogin ? "Sign In to Workspace" : "Create Account"}
               </Button>
            </form>

            <div className="relative py-2">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
               <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider text-slate-400"><span className="bg-white px-4">Or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <Button variant="outline" onClick={() => handleSocialLogin("google")} className="h-12 rounded-xl border border-slate-200 font-bold text-xs gap-2 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all hover:scale-[1.01] duration-150">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
               </Button>
               
               <Button variant="outline" onClick={() => handleSocialLogin("apple")} className="h-12 rounded-xl border border-slate-200 font-bold text-xs gap-2 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all hover:scale-[1.01] duration-150">
                  <svg viewBox="0 0 384 512" className="w-4 h-4 text-slate-800 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                  </svg>
                  Apple
               </Button>
            </div>
         </Card>
      </div>
    </div>
  );
}
