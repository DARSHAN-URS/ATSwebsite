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
  Search,
  Building2,
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
      title: "AI Resume Architect",
      description: "Engineer high-impact, ATS-optimized resumes with our intelligent real-time optimization engine.",
      icon: <Sparkles className="w-8 h-8 text-blue-600" />,
    },
    {
      title: "Global Job Discovery",
      description: "Search and filter through millions of live job postings from world-class organizations.",
      icon: <Search className="w-8 h-8 text-blue-600" />,
    },
    {
      title: "Company Intelligence",
      description: "Access deep insights into company hiring patterns, culture, and industry ranking.",
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
    },
    {
      title: "AI Auto-Apply Engine",
      description: "Automate your applications. Our AI finds and applies to the best-matching roles for you.",
      icon: <Zap className="w-8 h-8 text-blue-600" />,
    },
    {
      title: "Strategic Outreach",
      description: "High-conversion email outreach to recruiters, ensuring your profile lands in the right inbox.",
      icon: <Mail className="w-8 h-8 text-blue-600" />,
    },
    {
      title: "Interview Mastery",
      description: "Train with AI-driven mock sessions and HR experts tailored to your specific industry.",
      icon: <CheckCircle2 className="w-8 h-8 text-blue-600" />,
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
        title="ResumePro — The Premium Career Growth Ecosystem"
        description="Build ATS-optimized resumes, automate job applications, and master interviews with professional HR experts."
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
                  className="text-[4rem] md:text-[7rem] lg:text-[9rem] font-black text-slate-900 leading-[0.85] tracking-tighter"
                >
                  CRAFT YOUR <br />
                  <span className="text-blue-600">LEGACY.</span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl leading-relaxed"
                >
                  The premier AI resume engine for elite professionals. 
                  Architected for impact, engineered for the modern workforce.
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center gap-8 pt-6 w-full max-w-xl"
                >
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Button asChild className="flex-[2] h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-95 group">
                      <Link to="/auth" className="flex items-center justify-center gap-2">
                        Build My Resume
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="flex-1 h-16 rounded-2xl border-slate-200 text-slate-900 font-black uppercase tracking-widest text-xs hover:bg-slate-50">
                      <Link to="/resume-examples">View Samples</Link>
                    </Button>
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
            <div className="text-center mb-24 space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">The Complete Career Loop</h2>
              <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">Beyond Resume Building.</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <Link to="/auth" key={i}>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="p-10 bg-white rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-blue-600/5 transition-all group h-full"
                  >
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                      {f.icon}
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">{f.title}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.description}</p>
                  </motion.div>
                </Link>
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
                    More than <br /> <span className="text-blue-600 italic underline decoration-blue-100 underline-offset-8">Resumes.</span>
                  </h2>
                  <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                    We've architected a full-cycle career engine. From AI Auto-Apply to HR Mock Interviews and Recruiter Outreach, 
                    we provide the high-performance tools you need to secure your next legacy role.
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
                { title: "Platform", links: [
                  { name: "AI Editor", path: "/auth" },
                  { name: "Auto-Apply", path: "/auth" },
                  { name: "Mock Interviews", path: "/interview-preparation" },
                  { name: "Email Outreach", path: "/auth" }
                ]},
                { title: "Company", links: [
                  { name: "Our Ethos", path: "/about" },
                  { name: "Manifesto", path: "/about" },
                  { name: "Careers", path: "/about" },
                  { name: "Contact", path: "/contact" }
                ]},
                { title: "Resources", links: [
                  { name: "Knowledge", path: "/blog" },
                  { name: "Resume Lab", path: "/resume-templates" },
                  { name: "Salary Guide", path: "/blog" },
                  { name: "Prep", path: "/interview-preparation" }
                ]},
                { title: "Legal", links: [
                  { name: "Privacy", path: "/privacy" },
                  { name: "Terms", path: "/terms" },
                  { name: "Guidelines", path: "/terms" },
                  { name: "Cookies", path: "/privacy" }
                ]}
              ].map((group, i) => (
                <div key={i}>
                  <h4 className="font-black text-slate-900 mb-8 uppercase text-[10px] tracking-[0.3em]">{group.title}</h4>
                  <ul className="space-y-4 text-slate-400 text-xs font-black uppercase tracking-widest">
                    {group.links.map(l => (
                      <li key={l.name}>
                        <Link to={l.path} className="hover:text-blue-600 transition-colors">{l.name}</Link>
                      </li>
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
                <a 
                  key={s} 
                  href={`https://${s.toLowerCase()}.com`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;