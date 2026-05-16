import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { motion, useScroll, useTransform } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Search, Building2, CheckCircle2, Sparkles, Zap, ShieldCheck, 
  ArrowRight, Star, Cpu, Award, TrendingUp, Mail, Lock, ChevronRight,
  Target, BarChart3, Users, Rocket, HelpCircle, Globe
} from "lucide-react";
import Logo from "@/components/Logo";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/landing/Footer";
import { useLanguage } from "@/i18n/LanguageContext";

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const { t } = useLanguage();
  const tl = t.landing;
  const tle = t.landingExtra;
  const yHero = useTransform(scrollY, [0, 800], [0, 150]);
  const opacityHero = useTransform(scrollY, [0, 1600], [1, 0]);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const stats = [
    { label: t.landing.activeUsers, value: "2.4M+", icon: Users },
    { label: t.landing.moreInterviews, value: "98.2%", icon: Zap },
    { label: t.landing.globalReady, value: "140+", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden font-sans selection:bg-blue-600/10 selection:text-blue-600">
      <SEOHead title={`ResumePro — ${t.landing.heroTitle}`} description={t.landing.heroDesc} />
      
      <Navbar />

      <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden bg-white">
          <div className="absolute top-0 right-0 w-[80%] h-full bg-blue-50/50 rounded-bl-[10rem] -z-10 translate-x-1/4" />
          
          <div className="container mx-auto px-8 relative z-10">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
                <div className="lg:col-span-7 space-y-12">
                   <motion.button 
                     initial={{ opacity: 0, x: -20 }} 
                     animate={{ opacity: 1, x: 0 }} 
                     onClick={() => toast({ title: "System Ready", description: t.landing.newVersion })}
                     className="inline-flex items-center gap-3 px-5 py-2 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-600/20 hover:scale-105 transition-transform"
                   >
                      <Rocket className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.landing.newVersion}</span>
                   </motion.button>
                   
                   <div className="space-y-8">
                      <motion.h1 
                        initial={{ opacity: 0, y: 30 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.1 }} 
                        className="text-6xl md:text-[7.5rem] font-black text-slate-900 tracking-tighter leading-[0.85]"
                      >
                         {t.landing.heroTitle.split(" ").slice(0, 2).join(" ")} <br /> <span className="text-blue-600">{t.landing.heroTitle.split(" ").slice(2).join(" ")}</span>
                      </motion.h1>
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.2 }} 
                        className="text-xl md:text-2xl text-slate-700 font-medium max-w-xl leading-relaxed"
                      >
                         {t.landing.heroDesc}
                      </motion.p>
                   </div>

                   <motion.div 
                     initial={{ opacity: 0, y: 20 }} 
                     animate={{ opacity: 1, y: 0 }} 
                     transition={{ delay: 0.3 }} 
                     className="flex flex-col sm:flex-row items-center gap-6 pt-6"
                   >
                      <Button asChild size="lg" className="h-20 px-12 rounded-[2rem] bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs gap-4 shadow-2xl shadow-blue-600/30 hover:scale-105 transition-all">
                         <Link to="/auth">{t.landing.startBuilding} <ArrowRight className="w-5 h-5" /></Link>
                      </Button>
                      <Button asChild variant="ghost" size="lg" className="h-20 px-12 rounded-[2rem] border border-slate-100 text-slate-900 font-black uppercase tracking-widest text-xs gap-4 hover:bg-slate-50 transition-all">
                         <Link to="/resume-templates">{t.landing.seeTemplates}</Link>
                      </Button>
                   </motion.div>

                   <div className="grid grid-cols-3 gap-12 pt-16 border-t border-slate-100">
                      {stats.map((s, i) => (
                        <div key={i} className="space-y-2">
                           <p className="text-3xl font-black text-slate-900 tracking-tight">{s.value}</p>
                           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">{s.label}</p>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="lg:col-span-5 relative lg:h-[700px] flex items-center">
                   <motion.div 
                     style={{ y: yHero }} 
                     initial={{ opacity: 0, scale: 0.8 }} 
                     animate={{ opacity: 1, scale: 1 }} 
                     transition={{ delay: 0.4, duration: 1 }}
                     className="relative z-10 w-full"
                   >
                      <div className="absolute inset-0 bg-blue-600/20 blur-[150px] rounded-full scale-150" />
                      <div className="relative rounded-[4rem] border-8 border-white bg-white shadow-[0_50px_100px_rgba(0,0,0,0.12)] overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent pointer-events-none" />
                         <img 
                           src="/images/resume-editor-hero.png" 
                           alt="Resume Intelligence Editor" 
                           className="w-full h-auto grayscale-0 group-hover:scale-105 transition-transform duration-1000" 
                         />
                      </div>
                      
                      {/* Floating Metric Card */}
                      <motion.div 
                        animate={{ y: [0, -20, 0] }} 
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -left-12 bottom-20 p-8 bg-white rounded-[2.5rem] shadow-3xl border border-slate-50 z-20 space-y-4"
                      >
                         <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <Sparkles className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">ATS Rating</p>
                            <p className="text-2xl font-black text-slate-900">98.2%</p>
                         </div>
                      </motion.div>
                   </motion.div>
                </div>
             </div>
          </div>
      </section>

      {/* Mission Partners */}
      <section className="py-12 bg-white relative overflow-hidden">
         <div className="container mx-auto px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-16 border-y border-slate-100 py-20 px-12 rounded-[4rem] bg-slate-50/50">
               <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{tl.trustedInfrastructure}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{tl.eliteProfessionals}</p>
               </div>
               <div className="flex flex-wrap justify-center items-center gap-16 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                  <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Google</span>
                  <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Microsoft</span>
                  <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Meta</span>
                  <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Amazon</span>
                  <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Netflix</span>
               </div>
            </div>
         </div>
      </section>

      {/* Value Matrix */}
      <section className="pt-10 pb-40 bg-white relative">
         <div className="container mx-auto px-8 space-y-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-end">
               <div className="space-y-10">
                  <div className="inline-flex items-center gap-3 px-5 py-2 bg-blue-50 rounded-full border border-blue-100 text-blue-600">
                     <Sparkles className="w-4 h-4" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tl.operationalExcellence}</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase">{tl.builtForScale.split(" ").slice(0, -1).join(" ")} <br /> {tl.builtForScale.split(" ").slice(-1)} <span className="text-blue-600">.</span></h2>
               </div>
               <p className="text-xl text-slate-600 font-medium max-w-xl leading-relaxed">
                  {tl.scaleDesc}
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {[
                 { title: tle.atsResumeBuilder, desc: tl.aiResumeTemplatesDesc, icon: Sparkles, color: "text-blue-600", bg: "bg-blue-50" },
                 { title: tle.jobSearch, desc: tl.smartJobSearch, icon: Search, color: "text-indigo-600", bg: "bg-indigo-50" },
                 { title: tle.emailAssistant, desc: tl.emailOutreachDesc, icon: Mail, color: "text-purple-600", bg: "bg-purple-50" },
                 { title: tle.interviewPreparation, desc: tl.interviewPrepDesc, icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
                 { title: tle.trackProgress, desc: tl.jobTrackingDesc, icon: BarChart3, color: "text-amber-600", bg: "bg-amber-50" },
                 { title: tle.safeSecure, desc: tl.privacyPolicy, icon: ShieldCheck, color: "text-rose-600", bg: "bg-rose-50" }
               ].map((f, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 30 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true }} 
                    transition={{ delay: i * 0.1 }}
                    className="group p-12 rounded-[4rem] bg-white border border-slate-100 hover:border-blue-600/20 transition-all duration-500 hover:shadow-3xl relative overflow-hidden"
                  >
                     <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 group-hover:rotate-3", f.bg, f.color)}>
                        <f.icon className="w-8 h-8" />
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight uppercase leading-none">{f.title}</h3>
                     <p className="text-slate-600 font-medium leading-relaxed text-lg">{f.desc}</p>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Enterprise Deployment CTA */}
      <section className="py-20 bg-white relative">
         <div className="container mx-auto px-8 relative">
            <div className="relative rounded-[4.5rem] bg-slate-900 p-16 md:p-32 overflow-hidden shadow-3xl text-center md:text-left">
               <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/30 to-transparent pointer-events-none" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]" />
               
               <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="space-y-10">
                     <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/10 rounded-full border border-white/10 text-blue-400 backdrop-blur-md">
                        <Zap className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tl.globalReady}</span>
                     </div>
                     <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase">
                        {tl.growFaster.split(" ").slice(0, -1).join(" ")} <br /> <span className="text-blue-500">{tl.growFaster.split(" ").slice(-1)}</span>
                     </h2>
                     <p className="text-xl text-slate-400 font-medium max-w-lg leading-relaxed">
                        {tl.startBuildingFuture}
                     </p>
                     <Button asChild size="lg" className="h-20 px-12 rounded-[2rem] bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[11px] gap-4 shadow-3xl shadow-blue-600/30 group">
                        <Link to="/auth">{tl.startBuilding} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></Link>
                     </Button>
                  </div>
                  
                  <div className="hidden lg:block relative group">
                     <div className="absolute inset-0 bg-blue-600/20 blur-[100px] scale-150" />
                     <Card className="rounded-[4rem] border-none bg-white/5 backdrop-blur-xl p-12 shadow-2xl relative overflow-hidden border border-white/10">
                        <div className="space-y-10">
                           <div className="flex items-center justify-between">
                              <Logo variant="light" className="h-10 opacity-50" />
                              <div className="flex -space-x-4">
                                 {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-900 bg-slate-800" />)}
                              </div>
                           </div>
                           <div className="space-y-6">
                              <div className="h-3 w-3/4 bg-white/10 rounded-full" />
                              <div className="h-3 w-1/2 bg-white/10 rounded-full" />
                              <div className="h-3 w-2/3 bg-white/10 rounded-full" />
                           </div>
                           <div className="flex items-center justify-between pt-6 border-t border-white/10">
                              <div className="flex items-center gap-3">
                                 <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                                 <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active Network</span>
                              </div>
                              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Sync Active</span>
                           </div>
                        </div>
                     </Card>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* FAQ Infrastructure */}
      <section className="py-40 bg-slate-50/50 relative">
         <div className="container mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
               <div className="space-y-10">
                  <div className="inline-flex items-center gap-3 px-5 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-600">
                     <HelpCircle className="w-4 h-4" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tl.operationalSupport}</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase">{tl.commonQuestions.split(" ").slice(0, -1).join(" ")} <br /> <span className="text-blue-600">{tl.commonQuestions.split(" ").slice(-1)}</span></h2>
                  <p className="text-xl text-slate-600 font-medium max-w-md leading-relaxed">{tl.supportDesc}</p>
               </div>
               
               <div className="space-y-6">
                  {[
                    { q: tle.archFaq1Q, a: tle.archFaq1A },
                    { q: tle.archFaq2Q, a: tle.archFaq2A },
                    { q: tle.archFaq3Q, a: tle.archFaq3A },
                    { q: tle.archFaq4Q, a: tle.archFaq4A }
                  ].map((faq, i) => (
                     <div key={i} className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all space-y-4">
                        <h4 className="text-lg font-black text-slate-900 tracking-tight uppercase">{faq.q}</h4>
                        <p className="text-slate-600 font-medium leading-relaxed">{faq.a}</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
