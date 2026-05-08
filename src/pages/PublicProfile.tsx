import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { 
  Mail, Phone, MapPin, Linkedin, Globe, Briefcase, 
  GraduationCap, Award, ExternalLink, Download, Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ResumePreview from "@/components/resume/ResumePreview";
import type { ResumeData } from "@/components/resume/types";
import { DEFAULT_COLORS } from "@/hooks/useResumeColors";

export default function PublicProfile() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!slug) return;
      const { data, error } = await supabase
        .from("resumes")
        .select("*, profiles!inner(full_name)")
        .eq("id", slug) // For now use ID as slug
        .single();

      if (error || !data) {
        setError(true);
      } else {
        setResume(data);
      }
      setLoading(false);
    }
    loadProfile();
  }, [slug]);

  if (loading) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-white font-black uppercase tracking-[0.3em] text-[10px]">Loading Professional Identity</p>
    </div>
  );

  if (error || !resume) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
      <h1 className="text-white text-4xl font-black">404: Profile Not Found</h1>
      <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5">
        <Link to="/">Go Back Home</Link>
      </Button>
    </div>
  );

  const data = resume.resume_data as ResumeData;
  const pi = data.personalInfo || {};

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-primary selection:text-white overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-2xl">
        <div className="container mx-auto px-8 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-black tracking-tighter">
            RESUME<span className="text-primary">PRO</span>
          </Link>
          <div className="flex items-center gap-6">
             <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white">Portfolio</Button>
             <Button className="bg-white text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl hover:bg-slate-200 transition-all">
                Hire Me
             </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-8 pt-40 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column: Info */}
          <div className="lg:col-span-5 space-y-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                 <Sparkles className="w-3.5 h-3.5 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-primary">Available for Opportunities</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                {pi.fullName || "Professional"}
              </h1>
              <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                {data.summary || "A high-performance professional focused on delivering world-class results through innovative strategies and technical excellence."}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-4">
               {pi.email && <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors"><Mail className="w-4 h-4 text-primary" /><span className="text-sm font-bold">{pi.email}</span></div>}
               {pi.location && <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors"><MapPin className="w-4 h-4 text-primary" /><span className="text-sm font-bold">{pi.location}</span></div>}
               {pi.linkedin && <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors"><Linkedin className="w-4 h-4 text-primary" /><span className="text-sm font-bold">LinkedIn</span></div>}
            </motion.div>

            <div className="space-y-10 pt-10">
               <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                     {data.skills?.map((skill, i) => (
                       <span key={i} className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-sm font-bold text-slate-300">
                         {skill}
                       </span>
                     ))}
                  </div>
               </div>

               <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Professional Path</h3>
                  <div className="space-y-6">
                     {data.experience?.map((exp, i) => (
                       <div key={i} className="flex gap-4 group">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20"><Briefcase className="w-4 h-4 text-primary" /></div>
                          <div>
                             <h4 className="font-black text-lg text-white group-hover:text-primary transition-colors">{exp.title}</h4>
                             <p className="text-slate-400 font-bold text-sm">{exp.company}</p>
                             <p className="text-slate-500 text-xs font-medium mt-1">{exp.startDate} - {exp.endDate || "Present"}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: Visual Preview */}
          <div className="lg:col-span-7 relative">
            <motion.div 
              initial={{ opacity: 0, x: 50 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8 }}
              className="sticky top-40 bg-white p-2 rounded-[2rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden group"
            >
               <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm">
                  <h4 className="text-white text-2xl font-black mb-6">Full Resume View</h4>
                  <div className="flex gap-4">
                     <Button className="bg-primary text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl shadow-2xl shadow-primary/30">
                        <Download className="w-4 h-4 mr-2" /> Download PDF
                     </Button>
                     <Button variant="outline" className="border-white/20 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl hover:bg-white/10">
                        <ExternalLink className="w-4 h-4 mr-2" /> Contact Me
                     </Button>
                  </div>
               </div>
               <div className="scale-[0.8] origin-top">
                 <ResumePreview 
                    resumeData={data} 
                    templateId={(data as any).templateId || "classic"} 
                    colors={DEFAULT_COLORS} 
                 />
               </div>
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12">
         <div className="container mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-slate-500 text-sm font-bold">© {new Date().getFullYear()} {pi.fullName}. Powered by ResumePro.</p>
            <Link to="/auth" className="text-primary font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
               Create Your Own Identity <ArrowRight className="w-4 h-4" />
            </Link>
         </div>
      </footer>
    </div>
  );
}

// Missing Lucide ArrowRight import? No, added above.
const ArrowRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
