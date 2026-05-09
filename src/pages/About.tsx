import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Sparkles, BarChart3, Upload, Mail, Search, Briefcase, Building2, Users, Kanban, Star, Globe, Shield, Zap, Target, CheckCircle, TrendingUp, Clock, Award, Heart, Layers, MonitorSmartphone, Lock, Languages, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { aboutTranslations } from "@/i18n/aboutTranslations";
import { motion } from "framer-motion";

export default function About() {
  const { locale } = useLanguage();
  const ta = aboutTranslations[locale];

  const stats = [
    { value: "12", label: ta.statsTemplates },
    { value: "6", label: ta.statsLanguages },
    { value: "5", label: ta.statsPipeline },
    { value: "100%", label: ta.statsFree },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      <SEOHead title="About — ResumePro" description="Learn about the future of career growth." />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto flex h-20 items-center justify-between px-8">
          <Link to="/"><Logo className="h-10" /></Link>
          <Button asChild variant="ghost" className="rounded-xl font-bold text-slate-500 hover:text-primary">
             <Link to="/" className="flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Home</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-32">
         <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
         <div className="container mx-auto px-8 relative z-10 text-center space-y-10">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-3 px-5 py-2 bg-primary/10 rounded-2xl">
               <Zap className="w-4 h-4 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-widest text-primary">The Vision</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-6xl md:text-9xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
               Career <span className="text-primary">Evolution.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
               ResumePro is more than a builder. It's a high-performance ecosystem designed to bridge the gap between talent and opportunity.
            </motion.p>
         </div>
      </section>

      {/* Stats Grid */}
      <section className="container mx-auto px-8 pb-32">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
               <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center space-y-2">
                  <p className="text-5xl font-black text-primary">{s.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
               </motion.div>
            ))}
         </div>
      </section>

      {/* Mission */}
      <section className="bg-slate-900 py-32 relative overflow-hidden">
         <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4" />
         <div className="container mx-auto px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div className="space-y-10">
                  <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 rounded-2xl border border-white/10">
                     <Target className="w-4 h-4 text-primary" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-primary">Our Mission</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight">
                     Empowering the <span className="text-primary">next</span> generation of leaders.
                  </h2>
                  <p className="text-xl text-slate-400 font-medium leading-relaxed">
                     We believe that your potential shouldn't be limited by a template. We combine world-class design with cutting-edge AI to give you the competitive edge in any market.
                  </p>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  {[
                    { icon: Shield, title: "Secure", desc: "Enterprise-grade protection" },
                    { icon: Globe, title: "Global", desc: "Built for every market" },
                    { icon: Zap, title: "Fast", desc: "Instant AI generation" },
                    { icon: Heart, title: "User-First", desc: "Handcrafted experience" }
                  ].map((item, i) => (
                    <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-4">
                       <item.icon className="w-8 h-8 text-primary" />
                       <h4 className="text-lg font-black text-white">{item.title}</h4>
                       <p className="text-slate-500 text-sm font-bold">{item.desc}</p>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Footer CTA */}
      <section className="py-40 container mx-auto px-8 text-center space-y-12">
         <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">Join the elite <span className="text-primary">1%.</span></h2>
         <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            Ready to stop applying and start getting hired? Build your professional legacy with ResumePro today.
         </p>
         <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button asChild className="bg-primary text-white font-black uppercase tracking-widest text-xs h-16 px-12 rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all group">
               <Link to="/" className="flex items-center gap-3">Start Building <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-200 dark:border-slate-800 font-black uppercase tracking-widest text-xs h-16 px-12 rounded-2xl">
               <Link to="/pricing">View Plans</Link>
            </Button>
         </div>
      </section>

      <footer className="border-t border-slate-100 dark:border-slate-800 py-12 container mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
         <p className="text-sm font-bold text-slate-400">© {new Date().getFullYear()} ResumePro. All rights reserved.</p>
         <div className="flex gap-10">
            <Link to="/privacy" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">Privacy</Link>
            <Link to="/terms" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">Terms</Link>
         </div>
      </footer>
    </div>
  );
}
