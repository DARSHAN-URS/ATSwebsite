import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Sparkles, Save, Download, Eye, Layout, Type, Grid, Settings, 
  Plus, Trash2, Loader2, Target, ClipboardCheck, Zap, User, Briefcase, 
  GraduationCap, Award, Globe, Share2, MoreVertical, ZoomIn, ZoomOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

import type { ResumeData, PersonalInfo } from "@/components/resume/types";
import { type TemplateId } from "@/components/resume/pdfTemplates";
import { useResumeColors } from "@/hooks/useResumeColors";

// Existing modular components
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
  const [zoom, setZoom] = useState(100);

  // Resume State
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

  // Load Resume
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

  // Auto-save logic
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");

  const saveResume = useCallback(async (manual = false) => {
    if (!user) return;
    const dataToSave = { ...resumeData, templateId: selectedTemplate };
    const serialized = JSON.stringify({ title, data: dataToSave });
    
    if (!manual && serialized === lastSavedRef.current) return;
    
    if (manual) setSaving(true);
    
    try {
      if (id) {
        await supabase.from("resumes").update({ title, resume_data: dataToSave as any }).eq("id", id);
      } else {
        const { data } = await supabase.from("resumes").insert({
          user_id: user.id,
          title,
          resume_data: dataToSave as any,
        }).select().single();
        if (data) navigate(`/builder/${data.id}`, { replace: true });
      }
      lastSavedRef.current = serialized;
      if (manual) toast({ title: "Resume Saved" });
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      if (manual) setSaving(false);
    }
  }, [id, user, title, resumeData, selectedTemplate]);

  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => saveResume(false), 3000);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [saveResume]);

  // AI Helpers
  const aiAssist = async (type: string, context: any) => {
    setAiLoading(type);
    try {
      const { data, error } = await invokeFunction("resume-assist", { body: { type, context } });
      if (error) throw error;
      return data;
    } catch (e: any) {
      toast({ title: "AI Error", description: e.message, variant: "destructive" });
      return null;
    } finally {
      setAiLoading(null);
    }
  };

  const generateSummary = async () => {
    const result = await aiAssist("summary", { jobTitle: title, skills: resumeData.skills, experience: resumeData.experience });
    if (result?.summary) {
      setResumeData(prev => ({ ...prev, summary: result.summary }));
      toast({ title: "Summary Generated" });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-black uppercase tracking-widest text-xs">Initializing Architect...</div>;

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Premium Workspace Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/resumes">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex flex-col">
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="text-sm font-black text-slate-900 tracking-tight bg-transparent border-none p-0 focus:ring-0 w-48"
              placeholder="Resume Title"
            />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
              {saving ? "Syncing..." : "Workspace Active"}
              {!saving && <div className="w-1 h-1 bg-green-500 rounded-full" />}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ATSScannerDialog resumeData={resumeData} />
          <Button onClick={() => saveResume(true)} variant="ghost" size="sm" className="font-bold text-slate-600 gap-2 h-10 px-4 rounded-xl">
             {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             Save
          </Button>
          <ResumeExportDialog resumeData={resumeData} title={title} templateId={selectedTemplate} colors={colors} />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Tool Navigation Sidebar */}
        <aside className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-8 gap-8 shrink-0">
          {[
            { id: "content", icon: <Layout className="w-6 h-6" />, label: "Builder" },
            { id: "appearance", icon: <Type className="w-6 h-6" />, label: "Styling" },
            { id: "templates", icon: <Grid className="w-6 h-6" />, label: "Layouts" },
            { id: "settings", icon: <Settings className="w-6 h-6" />, label: "Rules" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 group relative transition-all ${
                activeTab === item.id ? "text-primary" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                activeTab === item.id ? "bg-primary/10" : "bg-transparent group-hover:bg-slate-50"
              }`}>
                {item.icon}
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="activeSideTab" className="absolute -right-[1px] top-1/4 w-1 h-1/2 bg-primary rounded-l-full" />
              )}
            </button>
          ))}
        </aside>

        {/* Input Panel */}
        <main className="w-[480px] bg-white border-r border-slate-200 flex flex-col shrink-0">
          <ScrollArea className="flex-1">
            <div className="p-8 space-y-10">
              <ResumeCompletionScore resumeData={resumeData} title={title} />

              <AnimatePresence mode="wait">
                {activeTab === "content" && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-10">
                    <PersonalInfoSection 
                       personalInfo={resumeData.personalInfo || {}} 
                       onChange={info => setResumeData(prev => ({ ...prev, personalInfo: info }))} 
                       userId={user?.id || ""} 
                    />

                    {/* Summary Section with AI */}
                    <section className="space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white"><Sparkles className="w-4 h-4" /></div>
                             <h3 className="text-lg font-black text-slate-900 tracking-tight">Executive Summary</h3>
                          </div>
                          <Button variant="ghost" size="sm" onClick={generateSummary} disabled={aiLoading === "summary"} className="text-primary font-bold text-xs">
                             {aiLoading === "summary" ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Zap className="w-3 h-3 mr-1" />} AI Generate
                          </Button>
                       </div>
                       <Textarea 
                          value={resumeData.summary} 
                          onChange={e => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                          placeholder="Your professional mission statement..." 
                          className="rounded-2xl border-slate-100 min-h-[140px] p-4 text-sm font-medium focus:ring-primary/10"
                       />
                    </section>

                    <LanguagesEditor 
                       languages={resumeData.languages || []} 
                       onChange={langs => setResumeData(prev => ({ ...prev, languages: langs }))} 
                    />

                    <CustomSectionsEditor 
                       sections={resumeData.customSections || []} 
                       onChange={sects => setResumeData(prev => ({ ...prev, customSections: sects }))} 
                       onAiAssist={aiAssist}
                       aiLoading={aiLoading}
                    />
                  </motion.div>
                )}

                {activeTab === "appearance" && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                     <ColorPanel 
                        colors={colors} 
                        activePresetId={activePresetId} 
                        onApplyPreset={applyPreset} 
                        onSetColor={setColor} 
                        onReset={resetColors} 
                     />
                     <div className="p-6 bg-slate-50 rounded-[2rem] space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Typography Controls</h4>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest flex justify-between">Font Size <span>14px</span></Label>
                          <Slider defaultValue={[14]} max={20} min={10} step={1} className="py-4" />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest flex justify-between">Line Height <span>1.5</span></Label>
                          <Slider defaultValue={[1.5]} max={2} min={1} step={0.1} className="py-4" />
                        </div>
                     </div>
                  </motion.div>
                )}

                {activeTab === "templates" && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">System Layouts</h3>
                    <TemplateSelector selected={selectedTemplate} onChange={setSelectedTemplate} jobTitle={title} />
                  </motion.div>
                )}

                {activeTab === "settings" && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="p-6 rounded-[2.5rem] bg-slate-900 text-white space-y-4">
                       <h4 className="text-sm font-black tracking-tight">ATS Compliance Mode</h4>
                       <p className="text-xs text-slate-400 font-medium leading-relaxed">Automatically adjusts spacing, font types, and metadata to ensure maximum readability by job board scanners.</p>
                       <Button className="w-full bg-primary text-white font-black uppercase tracking-widest text-[10px] h-10 rounded-xl">Enable Ruleset</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </main>

        {/* Live Preview Engine */}
        <section className="flex-1 bg-slate-100 flex flex-col relative overflow-hidden">
          {/* Zoom & Viewport Controls */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 glass px-6 py-2.5 rounded-full flex items-center gap-6 z-20 shadow-2xl border-slate-200/50">
            <div className="flex items-center gap-3">
              <button onClick={() => setZoom(prev => Math.max(prev - 10, 40))} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ZoomOut className="w-4 h-4 text-slate-600" /></button>
              <span className="text-[10px] font-black text-slate-900 w-10 text-center uppercase tracking-widest">{zoom}%</span>
              <button onClick={() => setZoom(prev => Math.min(prev + 10, 150))} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ZoomIn className="w-4 h-4 text-slate-600" /></button>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black px-3 rounded-lg uppercase tracking-widest gap-2">
              <Eye className="w-3.5 h-3.5" /> Full View
            </Button>
          </div>

          <ScrollArea className="flex-1 p-20">
            <div className="flex justify-center">
              <div 
                style={{ 
                  transform: `scale(${zoom / 100})`, 
                  transformOrigin: "top center",
                  transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              >
                <ResumePreview 
                   resumeData={resumeData} 
                   templateId={selectedTemplate} 
                   colors={colors} 
                   className="shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-sm"
                />
              </div>
            </div>
          </ScrollArea>
          
          {/* Status Bar */}
          <footer className="h-10 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Live Render Engine</span>
                <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-200" /> Layer: {selectedTemplate}</span>
             </div>
             <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                A4 (210mm x 297mm)
             </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
