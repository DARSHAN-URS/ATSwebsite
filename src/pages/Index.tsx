import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { motion, useScroll, useTransform } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { RESUME_TEMPLATES } from "@/components/resume/pdfTemplates";
import TemplateThumbnail from "@/components/resume/TemplateThumbnail";
import { cn } from "@/lib/utils";
import { 
  Search, Building2, CheckCircle2, Sparkles, Zap, ShieldCheck, 
  ArrowRight, Star, Cpu, Award, TrendingUp, Mail, Lock, ChevronRight,
  Target, BarChart3, Users, Rocket, HelpCircle, Globe, AlertTriangle, X, Info
} from "lucide-react";
import Logo from "@/components/Logo";
import { Card } from "@/components/ui/card";
import { Footer } from "@/components/landing/Footer";
import { useLanguage } from "../i18n/LanguageContext";

const reviews = [
  {
    text: "After using ATS Pro's resume grader, I got 5 interviews in 2 weeks — including one at Google.",
    name: "Sarah M.",
    role: "Software Engineer",
    company: "Google"
  },
  {
    text: "The one-click tailoring feature is a game-changer. I paste the job description and get a perfectly optimized version in seconds.",
    name: "James R.",
    role: "Marketing Manager",
    company: "HubSpot"
  },
  {
    text: "ATS Pro helped me restructure everything and I landed my first consulting role within a month.",
    name: "Priya K.",
    role: "Recent Graduate",
    company: "Deloitte"
  },
  {
    text: "My resume score went from 45 to 92, and suddenly I was getting recruiter messages on LinkedIn every week.",
    name: "David L.",
    role: "Data Analyst",
    company: "Amazon"
  },
  {
    text: "Clean templates that actually pass ATS scans. Combined with the cover letter generator — the only tool I recommend.",
    name: "Emily T.",
    role: "Product Designer",
    company: "Figma"
  },
  {
    text: "The AI rewrote my bullet points to highlight transferable skills. Within 6 weeks, I had three offers on the table.",
    name: "Carlos V.",
    role: "Career Changer",
    company: "Salesforce"
  },
  {
    text: "Saved me hours of tweaking bullet points. Got a callback from Netflix on my first application using the optimized template.",
    name: "Marcus G.",
    role: "DevOps Engineer",
    company: "Netflix"
  },
  {
    text: "As an HR specialist, I can confirm these resumes are formatted exactly how recruiters want to see them.",
    name: "Chloe D.",
    role: "HR Specialist",
    company: "Workday"
  },
  {
    text: "Excellent metrics tracking. Helped me quantify my achievements which made a massive difference in my interviews.",
    name: "Rohan A.",
    role: "Financial Analyst",
    company: "Goldman Sachs"
  },
  {
    text: "The cover letter match was spot on. Seamlessly integrated my research background into Spotify's values.",
    name: "Sofia B.",
    role: "UX Researcher",
    company: "Spotify"
  },
  {
    text: "The outreach templates are gold. Got a 60% response rate from cold emails using the recruiter mailer.",
    name: "Liam W.",
    role: "Sales Executive",
    company: "Stripe"
  },
  {
    text: "From generic summaries to high-impact elevator pitches. The AI writer knows exactly what phrases stand out.",
    name: "Jessica H.",
    role: "Content Writer",
    company: "Adobe"
  },
  {
    text: "Helped me clean up dense paragraphs into high-impact action bullets. Landing the Nintendo interview was a dream come true.",
    name: "Kenji T.",
    role: "Product Manager",
    company: "Nintendo"
  },
  {
    text: "I was skeptical about AI writers, but the resume grader pointed out real gaps in my operational experience.",
    name: "Elena P.",
    role: "Operations Manager",
    company: "Uber"
  },
  {
    text: "Passed multiple rigorous ATS checks. Highly recommend for technical professionals looking to highlight complex architectures.",
    name: "Daniel K.",
    role: "Solutions Architect",
    company: "AWS"
  }
];

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
      <SEOHead title={`ResumePro — ${t.landing.archHeroTitle}`} description={t.landing.archHeroDesc} />
      
      <Navbar />

      <section className="relative pt-24 pb-16 md:pt-40 md:pb-20 overflow-hidden bg-white">
          <div className="absolute top-0 right-0 w-[80%] h-full bg-blue-50/50 rounded-bl-[5rem] md:rounded-bl-[10rem] -z-10 translate-x-1/4" />
          
          <div className="container mx-auto px-4 md:px-8 relative z-10">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-20 items-center">
                <div className="lg:col-span-7 space-y-8 md:space-y-12">

                   <div className="space-y-6 md:space-y-8">
                      <motion.h1 
                        initial={{ opacity: 0, y: 30 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.1 }} 
                        className="text-4xl md:text-6xl lg:text-[5.5rem] font-black text-slate-900 tracking-tighter leading-[0.9] md:leading-[1.1]"
                      >
                         {t.landing.archHeroTitle.split(" ").slice(0, 2).join(" ")} <br /> <span className="text-blue-600">{t.landing.archHeroTitle.split(" ").slice(2).join(" ")}</span>
                      </motion.h1>
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.2 }} 
                        className="text-lg md:text-2xl text-slate-700 font-medium max-w-xl leading-relaxed"
                      >
                         {t.landing.archHeroDesc}
                      </motion.p>
                   </div>

                   <motion.div 
                     initial={{ opacity: 0, y: 20 }} 
                     animate={{ opacity: 1, y: 0 }} 
                     transition={{ delay: 0.3 }} 
                     className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 pt-6"
                   >
                      <Button asChild size="lg" className="w-full sm:w-auto h-16 sm:h-20 px-8 sm:px-12 rounded-2xl sm:rounded-[2rem] bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] sm:text-xs gap-4 shadow-2xl shadow-blue-600/30 hover:scale-105 transition-all">
                         <Link to="/auth">{t.landing.startBuilding} <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" /></Link>
                      </Button>
                      <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto h-16 sm:h-20 px-8 sm:px-12 rounded-2xl sm:rounded-[2rem] border border-slate-100 text-slate-900 font-black uppercase tracking-widest text-[10px] sm:text-xs gap-4 hover:bg-slate-50 transition-all">
                         <Link to="/resume-templates">{t.landing.seeTemplates}</Link>
                      </Button>
                   </motion.div>

                   <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 pt-10 md:pt-16 border-t border-slate-100">
                      {stats.map((s, i) => (
                        <div key={i} className="space-y-1 md:space-y-2">
                           <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{s.value}</p>
                           <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-500">{s.label}</p>
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
                           src="/images/hero_editor_mockup_v2.webp" 
                           alt="Resume Intelligence Editor" 
                           className="w-full h-auto grayscale-0 group-hover:scale-105 transition-transform duration-1000" 
                         />
                      </div>
                      
                      {/* Floating Metric Card */}
                      <motion.div 
                        animate={{ y: [0, -20, 0] }} 
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute left-0 -bottom-4 md:-left-12 md:bottom-20 p-4 md:p-8 bg-white rounded-2xl md:rounded-[2.5rem] shadow-3xl border border-slate-50 z-20 space-y-2 md:space-y-4 scale-75 md:scale-100 origin-bottom-left"
                      >
                         <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-50 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-600">
                            <Sparkles className="w-4 h-4 md:w-6 md:h-6" />
                         </div>
                         <div>
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">ATS Rating</p>
                            <p className="text-lg md:text-2xl font-black text-slate-900">98.2%</p>
                         </div>
                      </motion.div>
                   </motion.div>
                </div>
             </div>
          </div>
      </section>

      {/* Mission Partners */}
      <section className="py-4 md:py-8 bg-white relative overflow-hidden">
         <div className="container mx-auto px-4 md:px-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 border-y border-slate-100 py-10 px-6 md:py-20 md:px-12 rounded-3xl md:rounded-[4rem] bg-slate-50/50">
               <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">{tl.trustedInfrastructure}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{tl.eliteProfessionals}</p>
               </div>
               <div className="flex flex-wrap justify-center items-center gap-6 md:gap-16 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                  <span className="text-lg md:text-2xl font-black tracking-tighter text-slate-900 uppercase">Google</span>
                  <span className="text-lg md:text-2xl font-black tracking-tighter text-slate-900 uppercase">Microsoft</span>
                  <span className="text-lg md:text-2xl font-black tracking-tighter text-slate-900 uppercase">Meta</span>
                  <span className="text-lg md:text-2xl font-black tracking-tighter text-slate-900 uppercase">Amazon</span>
                  <span className="text-lg md:text-2xl font-black tracking-tighter text-slate-900 uppercase">Netflix</span>
               </div>
            </div>
         </div>
      </section>

      {/* Problem section */}
      <section className="py-16 md:py-24 bg-slate-50 relative overflow-hidden text-left border-y border-slate-100">
         <div className="container mx-auto px-4 md:px-8 max-w-5xl relative z-10">
            <div className="space-y-3">
               <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest bg-blue-50 border border-blue-100/50 px-3.5 py-1.5 rounded-full inline-block">
                  The Problem
               </span>
               <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase max-w-3xl">
                  Why 75% of Resumes Never Get Seen by a Recruiter
               </h2>
            </div>
            
            <div className="space-y-8 mt-12 max-w-2xl">
               <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 text-orange-500 flex items-center justify-center flex-shrink-0">
                     <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-lg font-bold text-slate-900 leading-none">Generic Keywords</h4>
                     <p className="text-slate-500 font-medium text-sm leading-relaxed">
                        Most resumes lack tailored ATS-friendly keywords, leading to instant rejection.
                     </p>
                  </div>
               </div>
               
               <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center flex-shrink-0">
                     <X className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-lg font-bold text-slate-900 leading-none">Missing Keywords</h4>
                     <p className="text-slate-500 font-medium text-sm leading-relaxed">
                        If your resume doesn't match the specific keywords in a job description, it's filtered out.
                     </p>
                  </div>
               </div>
               
               <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 text-red-500 flex items-center justify-center flex-shrink-0">
                     <Info className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-lg font-bold text-slate-900 leading-none">Poor Readability</h4>
                     <p className="text-slate-500 font-medium text-sm leading-relaxed">
                        Dense formatting and generic language block your resume from making it past filters.
                     </p>
                  </div>
               </div>
            </div>
            
            <Button asChild size="lg" className="h-14 sm:h-16 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] gap-2.5 shadow-lg shadow-blue-600/20 hover:scale-105 transition-all mt-12 w-fit">
               <Link to="/auth">
                  Fix My Resume Now <ArrowRight className="w-4 h-4" />
               </Link>
            </Button>
         </div>
      </section>

      {/* How It Works - Visual Steps */}
      <section className="py-10 md:py-16 bg-white relative">
         <div className="container mx-auto px-4 md:px-8 space-y-16 md:space-y-32">
            <div className="text-center space-y-4 md:space-y-6 max-w-3xl mx-auto mb-10 md:mb-20">
               <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">{tl.builtForScale}</h2>
               <p className="text-lg md:text-xl text-slate-600 font-medium">{tl.scaleDesc}</p>
            </div>

            {/* Step 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
               <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="order-2 lg:order-1 rounded-3xl md:rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden bg-slate-50">
                  <img src="/images/custom_mockup_1_v2.webp" alt="Choose a Template" loading="lazy" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
               </motion.div>
               <div className="order-1 lg:order-2 space-y-4 md:space-y-6 lg:pl-10">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl md:text-3xl">1</div>
                  <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">{tle.atsResumeBuilder}</h3>
                  <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">{tl.aiResumeTemplatesDesc}</p>
               </div>
            </div>

            {/* Step 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
               <div className="space-y-4 md:space-y-6 lg:pr-10">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl md:text-3xl">2</div>
                  <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">{tl.operationalExcellence}</h3>
                  <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">{tl.smartJobSearch}</p>
               </div>
               <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 rounded-3xl md:rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden bg-slate-50">
                  <img src="/images/custom_mockup_2_v2.webp" alt="Add Experience" loading="lazy" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
               </motion.div>
            </div>

            {/* Step 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
               <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="order-2 lg:order-1 rounded-3xl md:rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden bg-slate-50">
                  <img src="/images/interview_prep_mockup_v3.webp" alt="Interview Preparation" loading="lazy" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
               </motion.div>
               <div className="order-1 lg:order-2 space-y-4 md:space-y-6 lg:pl-10">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xl md:text-3xl">3</div>
                  <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">{tle.interviewPreparation}</h3>
                  <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">{tl.interviewPrepDesc}</p>
               </div>
            </div>
            
            {/* Template Gallery */}
            <div className="pt-10 md:pt-20 text-center space-y-8 md:space-y-12 overflow-hidden">
               <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase">{t.landing.seeTemplates}</h3>
               
               <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-8 px-4 md:px-8 -mx-4 md:-mx-8 scrollbar-hide">
                  {RESUME_TEMPLATES.map((tpl, i) => (
                     <div key={i} className="w-[200px] sm:w-[260px] md:w-[320px] lg:w-[380px] snap-center shrink-0 rounded-2xl md:rounded-[2rem] bg-slate-100 aspect-[595/842] shadow-sm border border-slate-200 overflow-hidden group cursor-pointer relative">
                        <div className="w-full h-full grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 hover:scale-105 origin-top">
                           <TemplateThumbnail templateId={tpl.id} />
                        </div>
                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-300"></div>
                     </div>
                  ))}
               </div>
               
               <Button asChild size="lg" className="h-14 px-8 md:h-16 md:px-10 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] md:text-[11px] transition-all">
                  <Link to="/resume-templates">Explore All Templates</Link>
               </Button>
            </div>
         </div>
      </section>

      {/* Enterprise Deployment CTA */}
      <section className="py-8 md:py-16 bg-white relative">
         <div className="container mx-auto px-4 md:px-8 relative">
            <div className="relative rounded-3xl md:rounded-[4.5rem] bg-slate-900 p-8 md:p-32 overflow-hidden shadow-3xl text-center md:text-left">
               <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/30 to-transparent pointer-events-none" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]" />
               
               <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                  <div className="space-y-6 md:space-y-10">
                     <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/10 rounded-full border border-white/10 text-blue-400 backdrop-blur-md">
                        <Zap className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tl.globalReady}</span>
                     </div>
                     <h2 className="text-4xl md:text-5xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] md:leading-[0.85] uppercase">
                        {tl.growFaster.split(" ").slice(0, -1).join(" ")} <br /> <span className="text-blue-500">{tl.growFaster.split(" ").slice(-1)}</span>
                     </h2>
                     <p className="text-lg md:text-xl text-slate-400 font-medium max-w-lg leading-relaxed mx-auto md:mx-0">
                        {tl.startBuildingFuture}
                     </p>
                     <Button asChild size="lg" className="w-full sm:w-auto h-16 sm:h-20 px-8 sm:px-12 rounded-2xl sm:rounded-[2rem] bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] sm:text-[11px] gap-4 shadow-3xl shadow-blue-600/30 group">
                        <Link to="/auth">{tl.startBuilding} <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" /></Link>
                     </Button>
                  </div>
                  
                  <div className="hidden lg:block relative group">
                     <div className="absolute inset-0 bg-blue-600/20 blur-[100px] scale-150" />
                     <Card className="rounded-3xl lg:rounded-[4rem] border-none bg-white/5 backdrop-blur-xl p-6 lg:p-12 shadow-2xl relative overflow-hidden border border-white/10">
                        <div className="space-y-10">
                           <div className="flex items-center justify-between">
                              <Logo variant="light" className="h-10 opacity-50" />
                              <div className="flex -space-x-4">
                                 {["Alex", "Sarah", "Mike", "Emma"].map((name, i) => (
                                    <img 
                                       key={i} 
                                       src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                                       className="w-10 h-10 rounded-full border-4 border-slate-900 bg-slate-800 object-cover" 
                                       alt={name}
                                    />
                                 ))}
                              </div>
                           </div>
                           <div className="space-y-4">
                              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                 <div>
                                    <p className="text-white font-bold text-sm md:text-base">Senior Engineer Resume</p>
                                    <p className="text-slate-400 text-xs md:text-sm">Last updated 2 mins ago</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-emerald-400 font-black text-sm md:text-base">+24%</p>
                                    <p className="text-slate-400 text-xs md:text-sm">ATS Score</p>
                                 </div>
                              </div>
                              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                 <div>
                                    <p className="text-white font-bold text-sm md:text-base">Product Manager Profile</p>
                                    <p className="text-slate-400 text-xs md:text-sm">Matched with 12 open roles</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-blue-400 font-black text-sm md:text-base">98/100</p>
                                    <p className="text-slate-400 text-xs md:text-sm">Keyword Match</p>
                                 </div>
                              </div>
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

      {/* 5. User Reviews Section (Side Scrolling) */}
      <section className="py-16 md:py-24 bg-white relative overflow-hidden text-left border-t border-slate-100">
         <div className="container mx-auto px-4 md:px-8 space-y-12">
            <div className="space-y-4 max-w-3xl">
               <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest bg-blue-50 border border-blue-100/50 px-3.5 py-1.5 rounded-full inline-block">
                  Success Stories
               </span>
               <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-none uppercase">
                  Trusted by Thousands of Job Seekers
               </h2>
               <p className="text-slate-500 font-medium text-sm md:text-base">
                  See how job seekers restructured their career paths and landed roles at top-tier organizations.
               </p>
            </div>

            <div className="flex overflow-x-auto gap-6 pb-8 px-4 md:px-8 -mx-4 md:-mx-8 scrollbar-hide snap-x snap-mandatory">
               {reviews.map((rev, idx) => (
                  <Card key={idx} className="w-[300px] md:w-[355px] shrink-0 snap-center rounded-3xl border border-slate-100 bg-white p-8 shadow-sm flex flex-col justify-between hover:shadow-xl hover:border-blue-100/50 transition-all duration-300">
                     <div className="space-y-4">
                        <div className="flex text-amber-400 gap-0.5">
                           {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" />
                           ))}
                        </div>
                        <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium">
                           "{rev.text}"
                        </p>
                     </div>
                     
                     <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-50">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                           {rev.name.charAt(0)}
                        </div>
                        <div>
                           <p className="text-slate-900 font-bold text-xs">{rev.name}</p>
                           <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                              {rev.role} &rarr; {rev.company}
                           </p>
                        </div>
                     </div>
                  </Card>
               ))}
            </div>
         </div>
      </section>

      {/* FAQ Infrastructure */}
      <section className="py-12 md:py-20 bg-slate-50/50 relative">
         <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20">
               <div className="space-y-6 md:space-y-10">
                  <div className="inline-flex items-center gap-3 px-5 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-600">
                     <HelpCircle className="w-4 h-4" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tl.operationalSupport}</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase">{tl.commonQuestions.split(" ").slice(0, -1).join(" ")} <br /> <span className="text-blue-600">{tl.commonQuestions.split(" ").slice(-1)}</span></h2>
                  <p className="text-lg md:text-xl text-slate-600 font-medium max-w-md leading-relaxed">{tl.supportDesc}</p>
               </div>
               
               <div className="space-y-4 md:space-y-6">
                  {[
                    { q: tle.archFaq1Q, a: tle.archFaq1A },
                    { q: tle.archFaq2Q, a: tle.archFaq2A },
                    { q: tle.archFaq3Q, a: tle.archFaq3A },
                    { q: tle.archFaq4Q, a: tle.archFaq4A }
                  ].map((faq, i) => (
                     <div key={i} className="p-6 md:p-10 rounded-3xl md:rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all space-y-2 md:space-y-4">
                        <h4 className="text-base md:text-lg font-black text-slate-900 tracking-tight uppercase">{faq.q}</h4>
                        <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">{faq.a}</p>
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
