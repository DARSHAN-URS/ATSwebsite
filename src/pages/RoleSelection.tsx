import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Search, ArrowRight, ShieldCheck, Zap, Target, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { miscTranslations } from "@/i18n/miscTranslations";
import { motion } from "framer-motion";

export default function RoleSelection() {
  const { setUserRole } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const { locale } = useLanguage();
  const mt = miscTranslations[locale].role;

  const handleSelect = async (role: AppRole) => {
    setSubmitting(true);
    const error = await setUserRole(role);
    if (error) {
      toast({ title: mt.errorTitle, description: mt.errorDesc, variant: "destructive" });
      setSubmitting(false);
      return;
    }
    navigate(role === "recruiter" ? "/recruiter/jobs" : "/dashboard");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-8 font-sans overflow-hidden">
      <SEOHead title="Identity Selection — ResumePro" description="Choose your operational role." noindex />
      
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-4xl w-full space-y-16 relative z-10">
        <div className="text-center space-y-6">
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Security Clearance Required</span>
           </motion.div>
           <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">{mt.title}<span className="text-blue-600">.</span></h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl max-w-xl mx-auto">{mt.subtitle}</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {[
              { 
                 role: "job_seeker" as AppRole, 
                 title: mt.jobSeekerTitle, 
                 desc: mt.jobSeekerDesc, 
                 icon: Search, 
                 tag: "Discovery",
                 color: "blue"
              },
              { 
                 role: "recruiter" as AppRole, 
                 title: mt.recruiterTitle, 
                 desc: mt.recruiterDesc, 
                 icon: Users, 
                 tag: "Talent Acquisition",
                 color: "slate"
              }
           ].map((item, i) => (
              <motion.div 
                 key={item.role}
                 initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.1 }}
              >
                 <Card 
                    className="group relative rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_rgba(37,99,235,0.1)] transition-all duration-500 cursor-pointer overflow-hidden p-10 h-full flex flex-col justify-between"
                    onClick={() => !submitting && handleSelect(item.role)}
                 >
                    <div className="space-y-8">
                       <div className="flex items-center justify-between">
                          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                             <item.icon className="w-8 h-8" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-blue-600 transition-colors">{item.tag}</span>
                       </div>
                       
                       <div className="space-y-3">
                          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">{item.title}</h3>
                          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                       </div>
                    </div>

                    <div className="pt-10">
                       <Button 
                          disabled={submitting} 
                          className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] gap-3 group-hover:bg-blue-600 transition-all"
                       >
                          {mt.jobSeekerBtn} <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                       </Button>
                    </div>

                    {/* Decorative accent */}
                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                       <Zap className="w-20 h-20 text-blue-600" />
                    </div>
                 </Card>
              </motion.div>
           ))}
        </div>

        <div className="text-center pt-8">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Initialize identity module to continue</p>
        </div>
      </div>
    </div>
  );
}
