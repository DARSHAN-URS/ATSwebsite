import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion, useScroll, useTransform } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { 
  Search, Building2, CheckCircle2, Sparkles, Zap, ShieldCheck, 
  ArrowRight, Star, Cpu, Award, TrendingUp, Mail, Lock, ChevronRight,
  Target, BarChart3, Users, Rocket
} from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 500], [0, 100]);
  const opacityHero = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const features = [
    { title: "AI Optimization", desc: "Craft high-impact resumes with advanced neural keyword optimization.", icon: Sparkles, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Job Intelligence", desc: "Access global opportunities across millions of verified companies.", icon: Search, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Direct Outreach", desc: "Automate personalized emails directly to hiring managers.", icon: Mail, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Interview Lab", desc: "Master behavioral and technical interviews with AI coaching.", icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Success Metrics", desc: "Track your application velocity and conversion rate in real-time.", icon: BarChart3, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Elite Privacy", desc: "Your professional data is protected with enterprise-grade security.", icon: ShieldCheck, color: "text-rose-600", bg: "bg-rose-50" }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden font-sans selection:bg-blue-600/10 selection:text-blue-600 mesh-gradient-light">
      <SEOHead title="ResumePro — World-Class AI Career Infrastructure" description="The modern standard for building resumes, automating job searches, and mastering interviews." />
      
      <Navbar />

      {/* Modern SaaS Hero */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden border-b border-slate-100">
         <motion.div style={{ y: yHero, opacity: opacityHero }} className="container mx-auto px-6 relative z-10 text-center space-y-10">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100 text-blue-600">
               <Rocket className="w-4 h-4" />
               <span className="text-[11px] font-black uppercase tracking-widest">v2.0 Career OS Now Live</span>
            </motion.div>
            
            <div className="space-y-6">
               <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-8xl font-display font-black text-slate-900 tracking-tight leading-[0.9] max-w-5xl mx-auto">
                  Build your career <br /> <span className="text-blue-600">automatically.</span>
               </motion.h1>
               <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                  The modern standard for high-performance job seeking. Professional resumes, automated outreach, and AI interview prep.
               </motion.p>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
               <Button asChild size="lg" className="h-16 px-10 rounded-full shadow-xl shadow-blue-600/20 text-xs gap-3">
                  <Link to="/auth">Get Started Free <ArrowRight className="w-4 h-4" /></Link>
               </Button>
               <Button variant="outline" size="lg" className="h-16 px-10 rounded-full border-slate-200 text-xs text-slate-600 hover:bg-slate-50 gap-3">
                  View Demo
               </Button>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className="pt-20 max-w-6xl mx-auto relative group">
               <div className="absolute inset-0 bg-blue-600/10 blur-[120px] rounded-full scale-90 group-hover:scale-100 transition-transform duration-1000" />
               <div className="relative rounded-[2rem] border border-slate-200 bg-white/50 backdrop-blur-xl p-4 shadow-2xl overflow-hidden">
                  <div className="rounded-xl overflow-hidden border border-slate-100 shadow-inner">
                    <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" alt="Dashboard Preview" className="w-full h-auto" />
                  </div>
               </div>
            </motion.div>
         </motion.div>
      </section>

      {/* Trusted By / Social Proof */}
      <section className="py-16 border-b border-slate-50 bg-slate-50/30">
         <div className="container mx-auto px-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-10">Fueling careers at the world's best companies</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale group hover:grayscale-0 transition-all duration-700">
               <span className="text-2xl font-black tracking-tighter text-slate-900">STRIPE</span>
               <span className="text-2xl font-black tracking-tighter text-slate-900">LINEAR</span>
               <span className="text-2xl font-black tracking-tighter text-slate-900">VERCEL</span>
               <span className="text-2xl font-black tracking-tighter text-slate-900">FRAMER</span>
               <span className="text-2xl font-black tracking-tighter text-slate-900">FIGMA</span>
            </div>
         </div>
      </section>

      {/* Feature Matrix */}
      <section className="py-32 relative bg-white">
         <div className="container mx-auto px-6 space-y-24">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
               <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">Core Infrastructure</span>
               <h2 className="text-4xl md:text-6xl font-display font-black text-slate-900 tracking-tight leading-tight">Everything you need to <br /> land the role.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {features.map((f, i) => (
                  <motion.div 
                     key={i} 
                     initial={{ opacity: 0, y: 20 }} 
                     whileInView={{ opacity: 1, y: 0 }} 
                     viewport={{ once: true }} 
                     transition={{ delay: i * 0.1 }}
                     className="p-10 rounded-[2.5rem] bg-white border border-slate-100 hover:border-blue-200 transition-all group hover:shadow-xl hover:shadow-blue-600/5"
                  >
                     <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform", f.bg, f.color)}>
                        <f.icon className="w-6 h-6" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">{f.title}</h3>
                     <p className="text-slate-500 font-medium leading-relaxed text-sm">{f.desc}</p>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Premium CTA */}
      <section className="py-32 bg-slate-950 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-purple-600/20" />
         <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto rounded-[3rem] bg-white/5 backdrop-blur-xl border border-white/10 p-12 md:p-20 text-center space-y-10">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/20 rounded-full border border-blue-600/30 text-blue-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Premium Intelligence</span>
               </div>
               <h2 className="text-4xl md:text-7xl font-display font-black text-white tracking-tight leading-tight">Scale your professional identity.</h2>
               <p className="text-lg text-slate-400 font-medium max-w-xl mx-auto">Access the full suite of AI-powered career tools including automated outreach and interview labs.</p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                  <Button asChild size="lg" className="h-16 px-10 rounded-full bg-blue-600 text-white font-black uppercase tracking-widest text-xs gap-4 shadow-2xl shadow-blue-600/40">
                     <Link to="/pricing">Unlock Pro Features <Zap className="w-4 h-4" /></Link>
                  </Button>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 bg-white">
         <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white"><ShieldCheck className="w-4 h-4" /></div>
               <span className="text-lg font-display font-black tracking-tight text-slate-900">ResumePro</span>
            </div>
            <div className="flex gap-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
               <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
               <Link to="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
               <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 ResumePro Infrastructure</p>
         </div>
      </footer>
    </div>
  );
};

export default Index;