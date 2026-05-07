import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion, useScroll, useTransform } from "framer-motion";
import { Navbar } from "@/components/landing/Navbar";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Layout, 
  Clock, 
  ArrowRight,
  Star,
  ChevronRight,
  Globe,
  Award,
  TrendingUp,
  Cpu
} from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const features = [
    {
      title: "AI-Powered Optimization",
      description: "Our smart engine analyzes your resume and suggests improvements in real-time.",
      icon: <Sparkles className="w-6 h-6 text-primary" />,
      color: "blue"
    },
    {
      title: "ATS-Friendly Templates",
      description: "Every template is rigorously tested to ensure it passes through all major ATS systems.",
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      color: "purple"
    },
    {
      title: "Instant Live Preview",
      description: "See your changes as you type with our lightning-fast live rendering engine.",
      icon: <Zap className="w-6 h-6 text-primary" />,
      color: "pink"
    },
    {
      title: "Modern Design Layouts",
      description: "Handcrafted by elite designers to make you stand out from the competition.",
      icon: <Layout className="w-6 h-6 text-primary" />,
      color: "indigo"
    },
  ];

  const trustedCompanies = ["Google", "Stripe", "Linear", "Notion", "Framer", "Airbnb"];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 selection:bg-primary/20 overflow-x-hidden">
      <SEOHead
        title="ResumePro — The Premium Resume Builder for Professionals"
        description="Build a high-end, ATS-optimized resume in minutes. Trusted by ambitious professionals worldwide."
      />
      
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 md:pt-60 md:pb-40 overflow-hidden">
           {/* Background Elements */}
           <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
           <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4" />
           
           <div className="container mx-auto px-8 relative z-10 text-center space-y-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-3 px-6 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm"
              >
                 <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">The Future of Career Growth is here</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-7xl md:text-[10rem] font-black text-slate-900 dark:text-white leading-[0.85] tracking-tighter"
              >
                Build <br /> 
                <span className="text-primary italic">elite.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed"
              >
                High-performance resume engineering for ambitious professionals. 
                Optimized for ATS, handcrafted for design excellence.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
              >
                 <Button asChild className="bg-primary text-white font-black uppercase tracking-widest text-xs h-16 px-12 rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all group">
                    <Link to="/auth" className="flex items-center gap-3">
                       Get Started Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                 </Button>
                 <Button variant="ghost" className="font-black uppercase tracking-widest text-xs h-16 px-10 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900">
                    Explore Templates
                 </Button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-20"
              >
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-10">Trusted by talent from</p>
                 <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                    {trustedCompanies.map(c => (
                      <span key={c} className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{c}</span>
                    ))}
                 </div>
              </motion.div>
           </div>
        </section>

        {/* Product Preview */}
        <section className="container mx-auto px-8 pb-40">
           <motion.div 
             style={{ y: y1 }}
             className="relative rounded-[3rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden aspect-video"
           >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="absolute top-8 left-8 flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-400" />
                 <div className="w-3 h-3 rounded-full bg-amber-400" />
                 <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex items-center justify-center h-full">
                 <div className="p-12 space-y-8 text-center max-w-xl">
                    <Sparkles className="w-16 h-16 text-primary mx-auto" />
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">The most advanced editor ever built.</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">Experience a fluid, lightning-fast editing experience that feels like magic.</p>
                 </div>
              </div>
           </motion.div>
        </section>

        {/* Core Value Props */}
        <section className="py-40 bg-slate-900 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
           <div className="container mx-auto px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                 <div className="space-y-10">
                    <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 rounded-2xl border border-white/10">
                       <Cpu className="w-4 h-4 text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-primary">Intelligence First</span>
                    </div>
                    <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">
                       Your <br /> career <br /> <span className="text-primary italic">automated.</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-lg">
                       ResumePro isn't just a builder—it's a high-frequency job application engine that leverages AI to find, score, and apply to jobs for you.
                    </p>
                    <div className="space-y-6 pt-4">
                       {[
                         { icon: CheckCircle2, label: "94% Higher response rate" },
                         { icon: CheckCircle2, label: "ATS-Score optimization included" },
                         { icon: CheckCircle2, label: "Instant tailoring per application" }
                       ].map((item, i) => (
                         <div key={i} className="flex items-center gap-4">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                               <item.icon className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">{item.label}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    {features.map((f, i) => (
                       <motion.div 
                         key={i}
                         whileHover={{ y: -10 }}
                         className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6 backdrop-blur-sm"
                       >
                          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                             {f.icon}
                          </div>
                          <h4 className="text-xl font-black text-white leading-tight">{f.title}</h4>
                          <p className="text-slate-500 text-sm font-medium leading-relaxed">{f.description}</p>
                       </motion.div>
                    ))}
                 </div>
              </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="py-60 container mx-auto px-8 text-center space-y-12">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="space-y-12"
           >
              <h2 className="text-6xl md:text-9xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85]">
                 Join the <br /> <span className="text-primary italic">elite 1%.</span>
              </h2>
              <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                 Don't settle for average. Build a professional brand that demands attention and commands authority.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                 <Button asChild className="bg-primary text-white font-black uppercase tracking-widest text-xs h-20 px-16 rounded-[2rem] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all">
                    <Link to="/auth">Create My Resume</Link>
                 </Button>
                 <div className="flex items-center gap-4 text-left">
                    <div className="flex -space-x-4">
                       {[1, 2, 3, 4].map(i => (
                         <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200" />
                       ))}
                    </div>
                    <div>
                       <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Trusted by 50,000+ Pros</p>
                    </div>
                 </div>
              </div>
           </motion.div>
        </section>
      </main>

      <footer className="py-20 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-20 mb-20">
            <div className="max-w-xs space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Sparkles className="text-white w-6 h-6" />
                 </div>
                 <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                   RESUME<span className="text-primary">PRO</span>
                 </span>
              </div>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                The world's most advanced resume engineering platform. Built for professionals who refuse to be average.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-16 md:gap-32">
              {[
                { title: "Product", links: ["Templates", "AI Editor", "ATS Scoring", "Pricing"] },
                { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
                { title: "Resources", links: ["Help Center", "Resume Tips", "Interview Prep", "Jobs"] },
                { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] }
              ].map((group, i) => (
                <div key={i}>
                  <h4 className="font-black text-slate-900 dark:text-white mb-8 uppercase text-[10px] tracking-[0.2em]">{group.title}</h4>
                  <ul className="space-y-4 text-slate-400 text-xs font-black uppercase tracking-widest">
                    {group.links.map(l => (
                      <li key={l} className="hover:text-primary cursor-pointer transition-colors">{l}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              © 2026 ResumePro Inc. Handcrafted with obsession.
            </p>
            <div className="flex gap-8">
              {["Twitter", "LinkedIn", "Instagram"].map(s => (
                <span key={s} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary cursor-pointer transition-colors">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;