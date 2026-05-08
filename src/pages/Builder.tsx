import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Sparkles, Save, Eye, Layout, Type, Grid, Settings, 
  Loader2, Zap, ZoomIn, ZoomOut, ShieldCheck
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
    <div className="h-screen flex flex-col items-center justify-center bg-slate-950 space-y-4">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
      <p className="text-white font-black uppercase tracking-[0.3em] text-[10px]">Loading Editor</p>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] dark:bg-slate-950 overflow-hidden font-sans text-left">
      <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-8 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-6">
          <Link to="/resumes">
            <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white transition-all">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="text-lg font-black text-slate-900 dark:text-white tracking-tight bg-transparent border-none p-0 focus:ring-0 w-64"
              placeholder="Resume Title"
            />
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", saving ? "bg-amber-500" : "bg-emerald-500")} />
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{saving ? "Saving..." : "Saved"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ATSScannerDialog resumeData={resumeData} />
          <Button onClick={() => saveResume(true)} variant="ghost" className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-slate-50 dark:hover:bg-slate-800">
             {saving ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <Save className="w-4 h-4 text-blue-600" />}
             Save Resume
          </Button>
          <ResumeExportDialog resumeData={resumeData} title={title} templateId={selectedTemplate} colors={colors} />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-24 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col items-center py-10 gap-10 shrink-0">
          {[
            { id: "content", icon: <Layout className="w-6 h-6" />, label: "Content" },
            { id: "appearance", icon: <Type className="w-6 h-6" />, label: "Colors" },
            { id: "templates", icon: <Grid className="w-6 h-6" />, label: "Template" },
            { id: "settings", icon: <Settings className="w-6 h-6" />, label: "Settings" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn("flex flex-col items-center gap-2 group relative transition-all", activeTab === item.id ? "text-blue-600" : "text-slate-400 hover:text-slate-600")}
            >
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500", 
                activeTab === item.id ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" : "bg-transparent group-hover:bg-slate-50 dark:group-hover:bg-slate-800")}>
                {item.icon}
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="activeSideTab" className="absolute -right-[24px] top-1/4 w-1.5 h-1/2 bg-blue-600 rounded-l-full" />
              )}
            </button>
          ))}
        </aside>

        <main className="w-[520px] bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col shrink-0">
          <ScrollArea className="flex-1">
            <div className="p-10 space-y-12">
              <ResumeCompletionScore resumeData={resumeData} title={title} />

              <AnimatePresence mode="wait">
                {activeTab === "content" && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-12">
                    <PersonalInfoSection personalInfo={resumeData.personalInfo || {}} onChange={info => setResumeData(prev => ({ ...prev, personalInfo: info }))} userId={user?.id || ""} />

                    <section className="space-y-6">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg"><Sparkles className="w-5 h-5 text-blue-400" /></div>
                             <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Professional Summary</h3>
                          </div>
                          <Button onClick={generateSummary} disabled={aiLoading === "summary"} variant="ghost" className="h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[9px] text-blue-600 hover:bg-blue-50">
                             {aiLoading === "summary" ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Zap className="w-3.5 h-3.5 mr-2" />} AI Generate
                          </Button>
                       </div>
                       <Textarea 
                          value={resumeData.summary} 
                          onChange={e => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                          placeholder="Enter your professional summary here..." 
                          className="min-h-[200px] rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border-none p-6 font-medium focus:ring-2 focus:ring-blue-600/20"
                       />
                    </section>

                    <CustomSectionsEditor sections={resumeData.customSections || []} onChange={sections => setResumeData(prev => ({ ...prev, customSections: sections }))} />
                    
                    <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                       <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg"><Settings className="w-5 h-5 text-blue-400" /></div>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Languages</h3>
                       </div>
                       <LanguagesEditor languages={resumeData.languages || []} onChange={langs => setResumeData(prev => ({ ...prev, languages: langs }))} />
                    </div>
                  </motion.div>
                )}

                {activeTab === "appearance" && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <ColorPanel colors={colors} activePresetId={activePresetId} onPresetSelect={applyPreset} onColorChange={setColor} onReset={resetColors} />
                  </motion.div>
                )}

                {activeTab === "templates" && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <TemplateSelector selectedId={selectedTemplate} onSelect={setSelectedTemplate} />
                  </motion.div>
                )}
                
                {activeTab === "settings" && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                     <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Advanced Protocol</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Export settings and data management protocols are managed through the primary dashboard.</p>
                        <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 font-black uppercase tracking-widest text-[9px]" onClick={() => navigate("/resumes")}>Manage Repository</Button>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </main>

        <section className="flex-1 bg-slate-100 dark:bg-slate-950 p-12 overflow-hidden relative group">
          <div className="absolute top-8 right-8 z-20 flex gap-3 opacity-0 group-hover:opacity-100 transition-all">
             <Button variant="secondary" size="icon" onClick={() => setZoom(z => Math.max(50, z - 10))} className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl"><ZoomOut className="w-5 h-5" /></Button>
             <Button variant="secondary" size="icon" onClick={() => setZoom(z => Math.min(150, z + 10))} className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl"><ZoomIn className="w-5 h-5" /></Button>
          </div>
          <div className="h-full flex items-start justify-center overflow-auto custom-scrollbar">
            <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center", transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}>
              <ResumePreview data={resumeData} templateId={selectedTemplate} colors={colors} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
