import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { 
  Mail, Phone, MapPin, Linkedin, ExternalLink, Sparkles, ShieldCheck, Globe, Briefcase, GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ResumePreview from "@/components/resume/ResumePreview";
import type { ResumeData } from "@/components/resume/types";
import { DEFAULT_COLORS } from "@/hooks/useResumeColors";
import SEOHead from "@/components/SEOHead";
import Logo from "@/components/Logo";

export default function PublicProfile() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!slug) return;
      const { data, error } = await supabase.from("resumes").select("*, profiles!inner(full_name)").eq("id", slug).single();
      if (error || !data) setError(true);
      else setResume(data);
      setLoading(false);
    }
    loadProfile();
  }, [slug]);

  if (loading) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
      <p className="text-white font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing Matrix</p>
    </div>
  );

  if (error || !resume) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
      <h1 className="text-white text-2xl md:text-4xl font-black">404: Identity Not Found</h1>
      <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px]">
        <Link to="/">Return to Base</Link>
      </Button>
    </div>
  );

  const data = resume.resume_data as ResumeData;
  const pi = data.personalInfo || {};

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-blue-600 selection:text-white overflow-x-hidden font-sans">
      <SEOHead title={`${pi.fullName || "Professional"} — ResumePro`} description="High-fidelity professional identity matrix." />
      
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-2xl">
        <div className="container mx-auto px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo variant="auto" className="h-10" />
          </Link>
          <div className="flex items-center gap-4">
             <Button className="bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] h-10 px-8 rounded-xl hover:scale-105 transition-all shadow-lg shadow-blue-600/20">
                Connect
             </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-8 pt-40 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                     <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Verified Identity Matrix</span>
               </motion.div>
               <h1 className="text-7xl md:text-9xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.8] mb-10">
                  {pi.fullName || "Professional"}
               </h1>
               <p className="text-2xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                  {data.summary || "A high-performance professional focused on delivering world-class results through innovative strategies and technical excellence."}
               </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {pi.email && <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Communication</Label><p className="font-bold text-slate-900 dark:text-white truncate">{pi.email}</p></div>}
               {pi.location && <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Geospatial</Label><p className="font-bold text-slate-900 dark:text-white">{pi.location}</p></div>}
            </div>

            <div className="space-y-6 pt-10 border-t border-slate-100 dark:border-slate-800">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Core Modules</h3>
               <div className="flex flex-wrap gap-3">
                  {(data.skills || []).slice(0, 15).map(skill => (
                     <span key={skill} className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{skill}</span>
                  ))}
               </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="sticky top-40">
               <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200" />
                  <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden aspect-[1/1.4] transform group-hover:scale-[1.01] transition-all duration-500">
                     <ResumePreview data={data} colors={DEFAULT_COLORS} scale={0.7} />
                  </div>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl p-3 rounded-2xl border border-white/20 shadow-2xl">
                     <Button size="icon" className="w-12 h-12 bg-blue-600 text-white rounded-xl shadow-xl shadow-blue-600/20"><ExternalLink className="w-5 h-5" /></Button>
                     <div className="px-4 pr-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Active Architecture</p>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
