import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Layout, 
  ArrowRight,
  Star,
  ChevronRight,
  Cpu,
  Linkedin,
  Apple,
  Globe,
  Award,
  TrendingUp,
  Mail,
  Lock,
  ArrowUpRight
} from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSocialLogin = async (provider: "google" | "apple") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    }
  };

  const features = [
    {
      title: "AI-Powered Optimization",
      description: "Our smart engine analyzes your resume and suggests improvements in real-time.",
      icon: <Sparkles className="w-8 h-8 text-blue-600" />,
    },
    {
      title: "ATS-Friendly Templates",
      description: "Every template is rigorously tested to ensure it passes through all major ATS systems.",
      icon: <ShieldCheck className="w-8 h-8 text-blue-600" />,
    },
    {
      title: "Instant Live Preview",
      description: "See your changes as you type with our lightning-fast live rendering engine.",
      icon: <Zap className="w-8 h-8 text-blue-600" />,
    },
    {
      title: "Modern Design Layouts",
      description: "Handcrafted by elite designers to make you stand out from the competition.",
      icon: <Layout className="w-8 h-8 text-blue-600" />,
    },
  ];

  const stats = [
    { label: "Active Users", value: "50k+" },
    { label: "Success Rate", value: "94%" },
    { label: "Time Saved", value: "12h+" },
    { label: "Countries", value: "45+" },
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 overflow-x-hidden font-sans">
      <SEOHead
        title="ResumePro — The Premium Resume Builder for Professionals"
        description="Build a high-end, ATS-optimized resume in minutes. Trusted by ambitious professionals worldwide."
      />
      
      <Navbar />
      
      <main>
        {/* Hero Section - High-End Minimalist */}
        <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden">
           {/* Sophisticated Architectural Background */}
           <div className="absolute inset-0 z-0">
             <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 skew-x-12 translate-x-1/4" />
             <div className="absolute top-20 left-20 w-96 h-96 bg-blue-50 rounded-full blur-[100px] opacity-60" />
             <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px]" />
             
             {/* Grid pattern for texture */}
             <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#2563eb 1px, transparent 0)", backgroundSize: "40px 40px" }} />
           </div>
           
           <div className="container mx-auto px-8 relative z-10">
              <div className="max-w-6xl mx-auto flex flex-col items-center text-center space-y-10">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-5 py-2 rounded-full bg-blue-50 border border-blue-100 flex items-center gap-3"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">The Gold Standard of Resumes</span>
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[4rem] md:text-[8rem] lg:text-[10rem] font-black text-slate-900 leading-[0.9] tracking-tighter"
                >
                  ENGINEER <br />
                  <span className="text-blue-600">VICTORY.</span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-lg md:text-2xl text-slate-500 font-medium max-w-3xl leading-relaxed"
                >
                  The world's most sophisticated AI resume engine. 
                  Architected for design excellence, optimized for high-frequency hiring.
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center gap-8 pt-6 w-full max-w-xl"
                >
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Button asChild className="flex-[2] h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95">
                      <Link to="/auth">Build My Resume</Link>
                    </Button>
                    <Button variant="outline" className="flex-1 h-16 rounded-2xl border-slate-200 text-slate-900 font-black uppercase tracking-widest text-xs hover:bg-slate-50">
                      View Samples
                    </Button>
                  </div>

                  <div className="w-full flex flex-col gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-100" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-black text-slate-300">
                        <span className="bg-white px-6">Instant Access</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <Button 
                        variant="outline" 
                        onClick={() => handleSocialLogin("google")}
                        className="h-14 rounded-2xl border-slate-200 gap-3 font-bold text-slate-600 hover:bg-blue-50 transition-all"
                       >
                         <svg className="w-5 h-5" viewBox="0 0 24 24">
                           <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                           <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                           <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                           <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                         </svg>
                         Sign in with Google
                       </Button>
                       <Button 
                        variant="outline" 
                        onClick={() => handleSocialLogin("apple")}
                        className="h-14 rounded-2xl border-slate-200 gap-3 font-bold text-slate-600 hover:bg-blue-50 transition-all"
                       >
                         <Apple className="w-5 h-5 fill-slate-900" />
                         Sign in with Apple
                       </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Social Proof */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-12 w-full max-w-4xl"
                >
                  {stats.map((s, i) => (
                    <div key={i} className="text-center space-y-1">
                      <div className="text-4xl font-black text-slate-900">{s.value}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</div>
                    </div>
                  ))}
                </motion.div>
              </div>
           </div>
        </section>

        {/* Feature Grid - Geometric Clarity */}
        <section className="py-40 bg-slate-50 relative overflow-hidden">
          <div className="container mx-auto px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-12 bg-white rounded-[3rem] border border-slate-100 hover:shadow-2xl hover:shadow-blue-600/5 transition-all group"
                >
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                    {f.icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">{f.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{f.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Showcase - The Wow Factor */}
        <section className="py-40 bg-white overflow-hidden">
          <div className="container mx-auto px-8">
            <div className="flex flex-col lg:flex-row items-center gap-20">
               <div className="flex-1 space-y-10">
                  <div className="w-16 h-1 bg-blue-600" />
                  <h2 className="text-5xl md:text-8xl font-black text-slate-900 leading-none tracking-tighter">
                    Built for <br /> <span className="text-blue-600 italic underline decoration-blue-100 underline-offset-8">Distinction.</span>
                  </h2>
                  <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                    Every resume generated on ResumePro is a masterwork of typography, hierarchy, and semantic engineering. 
                    We don't just build lists; we build narratives that convert.
                  </p>
                  <div className="pt-6">
                    <Button asChild className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-colors">
                       <Link to="/auth" className="flex items-center gap-3">Start Building <ArrowUpRight className="w-4 h-4" /></Link>
                    </Button>
                  </div>
               </div>
               <div className="flex-1 relative">
                  <motion.div 
                    initial={{ x: 100, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative z-10 rounded-[3rem] shadow-2xl border-8 border-slate-50 overflow-hidden"
                  >
                    <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" alt="Editor Preview" className="w-full grayscale hover:grayscale-0 transition-all duration-1000" />
                    <div className="absolute inset-0 bg-blue-600/5 mix-blend-overlay" />
                  </motion.div>
                  <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-10" />
               </div>
            </div>
          </div>
        </section>

        {/* Dynamic CTA */}
        <section className="py-60 bg-blue-600 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
           
           <div className="container mx-auto px-8 relative z-10 text-center space-y-12">
              <h2 className="text-5xl md:text-[9rem] font-black text-white leading-[0.85] tracking-tighter">
                DON'T <br /> COMPETE. <br /> <span className="text-blue-100 italic">DOMINATE.</span>
              </h2>
              <div className="flex flex-col items-center gap-8">
                <Button asChild className="h-24 px-16 rounded-[2.5rem] bg-white text-blue-600 font-black uppercase tracking-[0.2em] text-sm hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-blue-900/40">
                   <Link to="/auth">Claim Your Future</Link>
                </Button>
                <p className="text-blue-100 font-bold uppercase tracking-widest text-[10px] opacity-70">Joined by 10,000+ professionals this month</p>
              </div>
           </div>
        </section>
      </main>

      <footer className="py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-20 mb-20">
            <div className="max-w-xs space-y-8">
               <Link to="/" className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20 group-hover:rotate-12 transition-transform duration-500">
                  <Sparkles className="text-white w-6 h-6" />
                </div>
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  RESUME<span className="text-blue-600">PRO</span>
                </span>
              </Link>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                The most advanced resume engineering platform ever created. 
                Built for the high-performance workforce.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-16 md:gap-32">
              {[
                { title: "Platform", links: ["Editor", "AI Engine", "Templates", "ATS Sync"] },
                { title: "Company", links: ["Our Ethos", "Manifesto", "Careers", "Contact"] },
                { title: "Resources", links: ["Knowledge", "Resume Lab", "Salary Guide", "Prep"] },
                { title: "Legal", links: ["Privacy", "Terms", "Guidelines", "Cookies"] }
              ].map((group, i) => (
                <div key={i}>
                  <h4 className="font-black text-slate-900 mb-8 uppercase text-[10px] tracking-[0.3em]">{group.title}</h4>
                  <ul className="space-y-4 text-slate-400 text-xs font-black uppercase tracking-widest">
                    {group.links.map(l => (
                      <li key={l} className="hover:text-blue-600 cursor-pointer transition-colors">{l}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              © 2026 ResumePro. Engineered by Antigravity.
            </p>
            <div className="flex gap-10">
              {["Twitter", "LinkedIn", "Dribbble"].map(s => (
                <span key={s} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 cursor-pointer transition-colors">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;