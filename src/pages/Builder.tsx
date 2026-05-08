import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Sparkles, Save, Eye, Layout, Type, Grid, Settings, 
  Loader2, Zap, ZoomIn, ZoomOut, ShieldCheck, Download, Wand2, FileText,
  Palmtree, Palette, LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ResumeData } from "@/components/resume/types";
import { type TemplateId } from "@/components/resume/pdfTemplates";
import { useResumeColors } from "@/hooks/useResumeColors";

import PersonalInfoSection from "@/components/resume/PersonalInfoSection";
import CustomSectionsEditor from "@/components/resume/CustomSectionsEditor";
import TemplateSelector from "@/components/resume/TemplateSelector";
import ResumePreview from "@/components/resume/ResumePreview";
import LanguagesEditor from "@/components/resume/LanguagesEditor";
import ColorPanel from "@/components/editor/ColorPanel";
import ResumeCompletionScore from "@/components/resume/ResumeCompletionScore";
import ATSScannerDialog from "@/components/resume/ATSScannerDialog";
import ResumeExportDialog from "@/components/resume/ResumeExportDialog";

export default function Builder() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { colors, activePresetId, applyPreset, setColor, reset: resetColors } = useResumeColors();

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [zoom, setZoom] = useState(90);

  const [title, setTitle] = useState("Untitled Resume");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("classic");
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {},
    summary: "",
    skills: [],
    experience: [],
    education: [],
    customSections: [],
    languages: [],
  });

  const [aiLoading, setAiLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      const { data, error } = await supabase.from("resumes").select("*").eq("id", id).single();
      if (error || !data) {
        toast({ title: "Error loading resume", variant: "destructive" });
        navigate("/resumes");
        return;
      }
      setTitle(data.title);
      const rd = data.resume_data as any as ResumeData;
      setResumeData(rd);
      setSelectedTemplate((rd.templateId as TemplateId) || "classic");
      setLoading(false);
    })();
  }, [id, user]);

  const saveResume = useCallback(async (manual = false) => {
    if (!user) return;
    const dataToSave = { ...resumeData, templateId: selectedTemplate };
    if (manual) setSaving(true);
    try {
      if (id) {
        await supabase.from("resumes").update({ title, resume_data: dataToSave as any }).eq("id", id);
      } else {
        const { data } = await supabase.from("resumes").insert({
          user_id: user.id, title, resume_data: dataToSave as any,
        }).select().single();
        if (data) navigate(`/builder/${data.id}`, { replace: true });
      }
      if (manual) toast({ title: "Resume Saved" });
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      if (manual) setSaving(false);
    }
  }, [id, user, title, resumeData, selectedTemplate]);

  const generateSummary = async () => {
    setAiLoading("summary");
    try {
      const { data, error } = await invokeFunction("resume-assist", { body: { type: "summary", context: { jobTitle: title, skills: resumeData.skills, experience: resumeData.experience } } });
      if (error) throw error;
      if (data?.summary) {
        setResumeData(prev => ({ ...prev, summary: data.summary }));
        toast({ title: "Summary Created" });
      }
    } catch (e: any) {
      toast({ title: "AI Error", description: e.message, variant: "destructive" });
    } finally {
      setAiLoading(null);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0a0f1d] space-y-6">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full shadow-2xl shadow-blue-600/20" />
      <p className="text-white font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Initializing Workspace</p>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] dark:bg-[#020617] overflow-hidden font-sans text-left selection:bg-blue-600/10 selection:text-blue-600">
      {/* Top Navigation - FlowCV Style */}
      <header className="h-20 bg-white dark:bg-[#0a0f1d] border-b border-slate-100 dark:border-white/5 px-8 flex items-center justify-between z-40 shrink-0 premium-shadow">
        <div className="flex items-center gap-8">
          <Link to="/resumes">
            <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-blue-600 hover:text-white transition-all duration-500">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="h-8 w-px bg-slate-100 dark:bg-white/5" />
          <div className="flex flex-col">
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="text-lg font-black text-slate-900 dark:text-white tracking-tight bg-transparent border-none p-0 focus:ring-0 w-64 uppercase"
              placeholder="Resume Title"
            />
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]", saving ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{saving ? "Synchronizing" : "Saved"}</span>
            </div>
          </div>
        </div>

        {/* Mode Toggles */}
        <div className="flex items-center bg-slate-50 dark:bg-white/5 p-1.5 rounded-2.5xl border border-slate-100 dark:border-white/5 shadow-inner">
           {[
             { id: "content", label: "Content", icon: FileText },
             { id: "design", label: "Customize", icon: Palette },
             { id: "templates", label: "Layout", icon: LayoutGrid },
             { id: "ai", label: "AI Tools", icon: Wand2 },
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={cn(
                 "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                 activeTab === tab.id 
                  ? "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xl" 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
               )}
             >
               <tab.icon className="w-4 h-4" />
               <span className="hidden md:inline">{tab.label}</span>
             </button>
           ))}
        </div>

        <div className="flex items-center gap-4">
          <ATSScannerDialog resumeData={resumeData} />
          <ResumeExportDialog resumeData={resumeData} title={title} templateId={selectedTemplate} colors={colors} />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor Side - Modular Card System */}
        <main className="w-full lg:w-[600px] xl:w-[700px] bg-slate-50/50 dark:bg-[#020617] border-r border-slate-100 dark:border-white/5 flex flex-col shrink-0 z-10">
          <ScrollArea className="flex-1">
            <div className="p-12 space-y-12 max-w-3xl mx-auto">
              <ResumeCompletionScore resumeData={resumeData} title={title} />

              <AnimatePresence mode="wait">
                {activeTab === "content" && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-12 pb-20">
                    <PersonalInfoSection personalInfo={resumeData.personalInfo || {}} onChange={info => setResumeData(prev => ({ ...prev, personalInfo: info }))} userId={user?.id || ""} />

                    <Card className="rounded-[3rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0a0f1d] p-10 premium-shadow space-y-8">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-600/30"><Sparkles className="w-6 h-6" /></div>
                             <div className="space-y-1 text-left">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Professional Summary</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Introduction narrative</p>
                             </div>
                          </div>
                          <Button onClick={generateSummary} disabled={aiLoading === "summary"} variant="ghost" className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-600/10 gap-2">
                             {aiLoading === "summary" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} AI Generate
                          </Button>
                       </div>
                       <Textarea 
                          value={resumeData.summary} 
                          onChange={e => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                          placeholder="Craft a powerful professional mission statement..." 
                          className="min-h-[250px] rounded-[2rem] bg-slate-50 dark:bg-[#020617] border-none p-8 font-medium focus:ring-2 focus:ring-blue-600/20 text-lg leading-relaxed text-left"
                       />
                    </Card>

                    <CustomSectionsEditor sections={resumeData.customSections || []} onChange={sections => setResumeData(prev => ({ ...prev, customSections: sections }))} />
                    
                    <Card className="rounded-[3rem] border border-slate-100 dark:border-white/5 bg-white dark:bg-[#0a0f1d] p-10 premium-shadow space-y-8">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-900 dark:bg-white/5 rounded-2xl flex items-center justify-center text-white"><Settings className="w-6 h-6 text-blue-600" /></div>
                          <div className="space-y-1 text-left">
                             <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Languages</h3>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global communication</p>
                          </div>
                       </div>
                       <LanguagesEditor languages={resumeData.languages || []} onChange={langs => setResumeData(prev => ({ ...prev, languages: langs }))} />
                    </Card>

                    <div className="flex justify-center pt-8">
                       <Button onClick={() => saveResume(true)} className="h-16 px-10 rounded-full bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] gap-4 shadow-2xl shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all">
                          <Save className="w-5 h-5" /> Save Changes
                       </Button>
                    </div>
                  </motion.div>
                )}

                {activeTab === "design" && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-12">
                    <ColorPanel colors={colors} activePresetId={activePresetId} onPresetSelect={applyPreset} onColorChange={setColor} onReset={resetColors} />
                  </motion.div>
                )}

                {activeTab === "templates" && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-12">
                    <TemplateSelector selectedId={selectedTemplate} onSelect={setSelectedTemplate} />
                  </motion.div>
                )}
                
                {activeTab === "ai" && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                     <Card className="p-10 rounded-[3rem] bg-blue-600 text-white space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-20"><Zap className="w-24 h-24" /></div>
                        <h4 className="text-2xl font-black tracking-tight">AI Enhancement Suite</h4>
                        <p className="text-sm font-medium text-blue-100/70 leading-relaxed">Optimize your resume content using our advanced neural engine. Scan for ATS compatibility, translate into multiple languages, or refine your professional narrative.</p>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                           <Button className="h-14 rounded-2xl bg-white text-blue-600 font-black uppercase tracking-widest text-[9px] hover:bg-slate-100 shadow-xl shadow-blue-900/20">Scan Compatibility</Button>
                           <Button className="h-14 rounded-2xl bg-blue-500 text-white font-black uppercase tracking-widest text-[9px] border border-white/20 hover:bg-blue-400">Translate Module</Button>
                        </div>
                     </Card>
                     
                     <div className="p-10 bg-white dark:bg-[#0a0f1d] rounded-[3rem] border border-slate-100 dark:border-white/5 space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Workspace Management</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Export settings and data backup protocols are managed through your centralized dashboard.</p>
                        <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 dark:border-white/10 font-black uppercase tracking-widest text-[9px] dark:text-slate-400" onClick={() => navigate("/resumes")}>Manage All Resumes</Button>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </main>

        {/* Live Preview Side - Document Centered */}
        <section className="flex-1 bg-slate-100/50 dark:bg-[#020617]/50 p-12 overflow-hidden relative group">
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-2 rounded-2.5xl shadow-2xl border border-white/20 dark:border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-700">
             <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(50, z - 10))} className="w-12 h-12 rounded-2xl text-slate-600 hover:bg-blue-600 hover:text-white transition-all"><ZoomOut className="w-5 h-5" /></Button>
             <div className="w-px h-6 bg-slate-100 dark:bg-white/5" />
             <span className="text-[10px] font-black text-slate-400 w-12 text-center">{zoom}%</span>
             <div className="w-px h-6 bg-slate-100 dark:bg-white/5" />
             <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(150, z + 10))} className="w-12 h-12 rounded-2xl text-slate-600 hover:bg-blue-600 hover:text-white transition-all"><ZoomIn className="w-5 h-5" /></Button>
          </div>
          
          <div className="h-full flex items-start justify-center overflow-auto custom-scrollbar perspective-1000">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               transition={{ duration: 0.8, ease: "circOut" }}
               style={{ 
                  transform: `scale(${zoom / 100})`, 
                  transformOrigin: "top center",
                  transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
               }}
               className="shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]"
            >
              <ResumePreview resumeData={resumeData} title={title} templateId={selectedTemplate} colors={colors} />
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
