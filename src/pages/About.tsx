import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Sparkles, BarChart3, Upload, Mail, Search, Briefcase, Building2, Users, Kanban, Star, Globe, Shield, Zap, Target, CheckCircle, TrendingUp, Clock, Award, Heart, Layers, MonitorSmartphone, Lock, Languages, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function About() {
  const { t } = useLanguage();
  const ta = t.about;

  const stats = [
    { value: "12", label: ta.statsTemplates },
    { value: "6", label: ta.statsLanguages },
    { value: "5", label: ta.statsPipeline },
    { value: "100%", label: ta.statsFree },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      <SEOHead title={`${ta.tagline} — ResumePro`} description={ta.heroDesc1} />

      <Navbar />

      {/* Hero */}
      <section className="relative pt-48 pb-32 overflow-hidden bg-white">
         <div className="absolute top-0 right-0 w-[80%] h-full bg-blue-50/50 rounded-bl-[10rem] -z-10 translate-x-1/4" />
         <div className="container mx-auto px-8 relative z-10 space-y-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-3 px-5 py-2 bg-blue-600 text-white rounded-full">
               <Zap className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">{ta.tagline}</span>
            </motion.div>
            <div className="space-y-8">
               <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-6xl md:text-[8rem] font-black text-slate-900 tracking-tighter leading-[0.85]">
                  {ta.heroTitle} <br /><span className="text-blue-600">{ta.heroHighlight}</span>
               </motion.h1>
               <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl md:text-3xl text-slate-500 font-medium max-w-3xl leading-relaxed">
                  {ta.heroDesc1} {ta.heroDesc2}
               </motion.p>
            </div>
         </div>
      </section>

      {/* Stats Grid */}
      <section className="container mx-auto px-8 pb-40">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
               <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-12 rounded-[3.5rem] bg-slate-50/50 border border-slate-100 text-center space-y-3 hover:bg-white hover:shadow-2xl transition-all">
                  <p className="text-6xl font-black text-blue-600 tracking-tighter">{s.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 leading-tight">{s.label}</p>
               </motion.div>
            ))}
         </div>
      </section>

      {/* Mission Infrastructure */}
      <section className="bg-slate-900 py-40 relative overflow-hidden rounded-[4rem] mx-8">
         <div className="absolute top-0 right-0 w-[50%] h-full bg-blue-600/10 rounded-full blur-[120px] translate-x-1/4" />
         <div className="container mx-auto px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
               <div className="space-y-12">
                  <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/10 rounded-full border border-white/10 text-blue-400">
                     <Target className="w-4 h-4" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em]">{ta.missionTagline}</span>
                  </div>
                  <h2 className="text-5xl md:text-[5.5rem] font-black text-white tracking-tighter leading-[0.9] uppercase">
                     {ta.missionTitle.split(" ").slice(0, 2).join(" ")} <br /> {ta.missionTitle.split(" ").slice(2, -1).join(" ")} <span className="text-blue-500">{ta.missionTitle.split(" ").slice(-1)}</span>
                  </h2>
                  <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                     {ta.missionP1} {ta.missionP2}
                  </p>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {[
                    { icon: Shield, title: ta.ph3Title, desc: ta.ph3Desc },
                    { icon: Globe, title: ta.ph1Title, desc: ta.ph1Desc },
                    { icon: Zap, title: ta.ph5Title, desc: ta.ph5Desc },
                    { icon: Heart, title: ta.ph6Title, desc: ta.ph6Desc }
                  ].map((item, i) => (
                    <div key={i} className="p-10 rounded-[3rem] bg-white/5 border border-white/10 space-y-6 group hover:bg-white/10 transition-all">
                       <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                          <item.icon className="w-8 h-8" />
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-xl font-black text-white tracking-tight uppercase">{item.title}</h4>
                          <p className="text-[10px] font-black text-slate-500 tracking-[0.2em]">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Footer CTA */}
      <section className="py-60 container mx-auto px-8 text-center space-y-16">
         <div className="space-y-6">
            <h2 className="text-6xl md:text-[7rem] font-black text-slate-900 tracking-tighter leading-none uppercase">{ta.ctaTitle.split(" ").slice(0, -1).join(" ")} <span className="text-blue-600">{ta.ctaTitle.split(" ").slice(-1)}</span></h2>
            <p className="text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed">
               {ta.ctaDesc}
            </p>
         </div>
         <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Button asChild className="h-20 px-16 bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-[2rem] shadow-3xl shadow-blue-600/30 hover:scale-105 transition-all group">
               <Link to="/auth" className="flex items-center gap-4">{ta.ctaBtn1} <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" /></Link>
            </Button>
            <Button asChild variant="outline" className="h-20 px-16 border-slate-200 text-slate-900 font-black uppercase tracking-[0.2em] text-[11px] rounded-[2rem] hover:bg-slate-50">
               <Link to="/pricing">{ta.ctaBtn2}</Link>
            </Button>
         </div>
      </section>

      <Footer />
    </div>
  );
}

