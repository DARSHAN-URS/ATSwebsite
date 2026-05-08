import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion, useScroll, useTransform } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { 
  Search, Building2, CheckCircle2, Sparkles, Zap, ShieldCheck, 
  ArrowRight, Star, Cpu, Award, TrendingUp, Mail, Lock, ChevronRight
} from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityHero = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const features = [
    { title: "AI Resume Builder", desc: "Craft high-impact resumes with advanced AI optimization.", icon: Sparkles },
    { title: "Job Discovery", desc: "Access millions of opportunities across the globe in real-time.", icon: Search },
    { title: "Recruiter Outreach", desc: "Automate personalized emails to hiring managers.", icon: Mail },
    { title: "Interview Practice", desc: "Master your interviews with our AI-powered simulator.", icon: CheckCircle2 },
    { title: "Application Tracking", desc: "Monitor your entire job search journey from one place.", icon: TrendingUp },
    { title: "Data Security", desc: "Your professional data is protected with elite encryption.", icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 overflow-x-hidden font-sans selection:bg-blue-600 selection:text-white mesh-gradient">
      <SEOHead title="ResumePro — Professional Career Infrastructure" description="Build professional resumes, automate your job search, and master interviews with AI-driven tools." />
      
      <Navbar />

      {/* Hero Sector */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden">
         <motion.div style={{ y: yHero, opacity: opacityHero }} className="container mx-auto px-8 relative z-10 text-center space-y-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 px-6 py-2.5 bg-blue-600/10 backdrop-blur-md rounded-full border border-blue-600/20 text-blue-600">
               <Cpu className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI-Powered Career Platform</span>
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-7xl md:text-[10rem] font-black text-slate-900 dark:text-white tracking-tighter leading-[0.8] max-w-6xl mx-auto">
               Career <br /> <span className="text-blue-600">Infrastructure.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed">
               Build professional resumes, automate your job search, and master your interviews with the world's most advanced career platform.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
               <Button asChild className="h-20 px-12 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-full shadow-2xl shadow-blue-600/30 gap-4 hover:scale-105 transition-all">
                  <Link to="/auth">
                     Get Started Free <ArrowRight className="w-5 h-5" />
                  </Link>
               </Button>
               <Button variant="outline" className="h-20 px-12 rounded-full border-slate-200 dark:border-slate-800 font-black uppercase tracking-widest text-xs gap-4 hover:bg-slate-50 dark:hover:bg-slate-900">
                  How it Works
               </Button>
            </motion.div>
         </motion.div>

         {/* Decorative Matrix Elements */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1)_0%,transparent_50%)]" />
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
         </div>
      </section>

      {/* Feature Protocol Matrix */}
      <section className="py-40 bg-white dark:bg-slate-900 relative">
         <div className="container mx-auto px-8 space-y-32">
            <div className="flex flex-col md:flex-row items-end justify-between gap-12 text-left">
               <div className="space-y-4">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Core Features</span>
                  <h2 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                     Professional <br /> Performance.
                  </h2>
               </div>
               <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-md leading-relaxed">
                  Our platform uses advanced AI to synchronize your professional background with what recruiters are looking for.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {features.map((f, i) => (
                  <motion.div 
                     key={i} 
                     initial={{ opacity: 0, y: 20 }} 
                     whileInView={{ opacity: 1, y: 0 }} 
                     viewport={{ once: true }} 
                     transition={{ delay: i * 0.1 }}
                     className="p-12 rounded-[3.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all group premium-shadow"
                  >
                     <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform">
                        <f.icon className="w-8 h-8" />
                     </div>
                     <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{f.title}</h3>
                     <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{f.desc}</p>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Trust Vector Section */}
      <section className="py-40 border-t border-slate-100 dark:border-slate-800 overflow-hidden">
         <div className="container mx-auto px-8 text-center space-y-20">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Trusted by top professionals</h3>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all">
               {["Google", "Microsoft", "Meta", "Apple", "Netflix", "Amazon"].map(brand => (
                  <span key={brand} className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{brand}</span>
               ))}
            </div>
         </div>
      </section>

      {/* Conversion Sector */}
      <section className="py-40">
         <div className="container mx-auto px-8">
            <div className="relative rounded-[5rem] bg-slate-900 dark:bg-blue-600 overflow-hidden p-16 md:p-32 text-center text-white space-y-12">
               <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 dark:bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
               <div className="relative z-10 space-y-8">
                  <h2 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.8] max-w-4xl mx-auto">Ready to Scale Your Career?</h2>
                  <p className="text-xl md:text-2xl text-blue-100/70 font-medium max-w-2xl mx-auto">Join thousands of professionals who have accelerated their career with ResumePro.</p>
                  <Button asChild className="h-24 px-16 bg-white text-blue-600 hover:bg-slate-100 font-black uppercase tracking-widest text-xs rounded-full shadow-2xl gap-4">
                     <Link to="/auth">Start Building Now <ChevronRight className="w-6 h-6" /></Link>
                  </Button>
               </div>
            </div>
         </div>
      </section>

      {/* Global Footer */}
      <footer className="py-20 border-t border-slate-100 dark:border-slate-800">
         <div className="container mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck className="w-6 h-6" />
               </div>
               <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">RESUME<span className="text-blue-600">PRO</span></span>
            </div>
            <div className="flex items-center gap-12 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <Link to="/pricing" className="hover:text-blue-600">Pricing</Link>
               <Link to="/blog" className="hover:text-blue-600">Resources</Link>
               <Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link>
               <Link to="/terms" className="hover:text-blue-600">Terms of Service</Link>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2026 ResumePro. All Rights Reserved.</p>
         </div>
      </footer>
    </div>
  );
};

export default Index;