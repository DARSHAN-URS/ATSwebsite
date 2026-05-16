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
  Palmtree, Palette, LayoutGrid, Share2, History, RotateCcw, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import ExperienceEditor from "@/components/resume/ExperienceEditor";
import EducationEditor from "@/components/resume/EducationEditor";
import ColorPanel from "@/components/editor/ColorPanel";
import ResumeCompletionScore from "@/components/resume/ResumeCompletionScore";
import ATSScannerDialog from "@/components/resume/ATSScannerDialog";
import ResumeExportDialog from "@/components/resume/ResumeExportDialog";

// New Layout Components
import SectionNavigator from "@/components/builder/SectionNavigator";
import ATSAnalyticsRow from "@/components/builder/ATSAnalyticsRow";
import AIAssistantSidebar from "@/components/builder/AIAssistantSidebar";
import ModernOnboarding from "@/components/builder/ModernOnboarding";
import StudioTopBar from "@/components/builder/StudioTopBar";
import StudioSidebar from "@/components/builder/StudioSidebar";
import StudioEditor from "@/components/builder/StudioEditor";
import StudioPreview from "@/components/builder/StudioPreview";
import AICopilot from "@/components/builder/AICopilot";

export default function Builder() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { colors, activePresetId, applyPreset, setColor, reset: resetColors } = useResumeColors();

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [zoom, setZoom] = useState(85);
  const [isAiThinking, setIsAiThinking] = useState(false);

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

  const completionData = {
    personal: !!resumeData.personalInfo?.fullName,
    summary: !!resumeData.summary && resumeData.summary.length > 50,
    experience: (resumeData.experience || []).length > 0,
    education: (resumeData.education || []).length > 0,
    skills: (resumeData.skills || []).length >= 5,
    languages: (resumeData.languages || []).length > 0,
    custom: (resumeData.customSections || []).length > 0,
  };

  const dynamicScore = useMemo(() => {
    const checks = [
      !!title && title !== "Untitled Resume",
      !!resumeData.personalInfo?.fullName,
      !!(resumeData.personalInfo?.email && resumeData.personalInfo?.phone),
      !!resumeData.summary && resumeData.summary.length > 50,
      (resumeData.skills || []).length >= 5,
      (resumeData.experience || []).length > 0,
      (resumeData.experience || []).some(e => e.bullets && e.bullets.length >= 2),
      (resumeData.education || []).length > 0,
      !!(resumeData.personalInfo?.linkedin || resumeData.personalInfo?.portfolio),
    ];
    const doneCount = checks.filter(Boolean).length;
    return Math.round((doneCount / checks.length) * 100);
  }, [resumeData, title]);

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
    <div className="h-screen flex flex-col items-center justify-center bg-[#F5F7FB] space-y-6">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full" />
      <p className="text-slate-900 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Initializing Workspace</p>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden font-sans text-left selection:bg-blue-600/10">
      <ModernOnboarding />
      
      {/* Top Floating Glass Header */}
      <StudioTopBar 
        title={title}
        onTitleChange={setTitle}
        saving={saving}
        score={dynamicScore}
        onAiImprove={() => toast({ title: "AI Optimizing...", description: "Refining your professional identity." })}
        onExport={() => saveResume(true)}
      />

      <ATSAnalyticsRow 
        score={dynamicScore}
        keywordMatch={(resumeData.skills || []).length}
        readability={dynamicScore > 70 ? "High Fidelity" : "Draft Mode"}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Section Navigation */}
        <StudioSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          completionData={completionData}
        />

        {/* Center: Editing Workspace */}
        <StudioEditor 
          activeSection={activeSection}
          onSave={() => saveResume(true)}
          saving={saving}
        >
          {activeSection === "personal" && (
            <div className="space-y-12">
               <div className="space-y-4">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Personal Information</h2>
                  <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                     Your identity is the core of your professional blueprint. Ensure all communication links are active.
                  </p>
               </div>
               <PersonalInfoSection 
                 personalInfo={resumeData.personalInfo || {}} 
                 onChange={info => setResumeData(prev => ({ ...prev, personalInfo: info }))} 
                 userId={user?.id || ""} 
               />
            </div>
          )}

          {activeSection === "summary" && (
            <div className="space-y-12">
               <div className="flex items-end justify-between">
                  <div className="space-y-4">
                     <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Professional Summary</h2>
                     <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                        Summarize your career mission in 2-3 powerful sentences.
                     </p>
                  </div>
                  <Button onClick={generateSummary} disabled={aiLoading === "summary"} className="rounded-full bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] px-8 h-12 shadow-xl hover:scale-105 active:scale-95 transition-all gap-2 group">
                     {aiLoading === "summary" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} AI Optimize
                  </Button>
               </div>
               <Card className="rounded-[3rem] border-none bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-12 group focus-within:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-700">
                  <Textarea 
                     value={resumeData.summary} 
                     onChange={e => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                     placeholder="Craft your career mission..." 
                     className="min-h-[350px] border-none p-0 focus-visible:ring-0 text-xl leading-relaxed resize-none font-medium text-slate-700 placeholder:text-slate-200"
                  />
                  <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Content Analysis Active</span>
                     </div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{resumeData.summary?.length || 0} / 500 characters</span>
                  </div>
               </Card>
            </div>
          )}

          {activeSection === "experience" && (
            <div className="space-y-12">
               <div className="space-y-4">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Work Experience</h2>
                  <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                     Your career timeline is a sequence of successful mission deployments.
                  </p>
               </div>
               <ExperienceEditor 
                 experience={resumeData.experience || []} 
                 onChange={exp => setResumeData(prev => ({ ...prev, experience: exp }))} 
               />
            </div>
          )}

          {activeSection === "education" && (
            <div className="space-y-12">
               <div className="space-y-4">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Education</h2>
                  <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                     Where did you acquire your foundational technical knowledge?
                  </p>
               </div>
               <EducationEditor 
                 education={resumeData.education || []} 
                 onChange={edu => setResumeData(prev => ({ ...prev, education: edu }))} 
               />
            </div>
          )}

          {activeSection === "skills" && (
            <div className="space-y-12">
               <div className="space-y-4">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Core Skills</h2>
                  <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                     Identify your primary technical vectors and professional capabilities.
                  </p>
               </div>
               <Card className="rounded-[3rem] border-none bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-12 space-y-10">
                  <div className="flex flex-wrap gap-3">
                    {(resumeData.skills || []).map((skill, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-black text-slate-700 flex items-center gap-3 group hover:border-blue-600 hover:bg-blue-50 transition-all cursor-default uppercase tracking-widest"
                      >
                        {skill}
                        <button 
                          onClick={() => setResumeData(prev => ({ ...prev, skills: prev.skills?.filter((_, idx) => idx !== i) }))}
                          className="text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                  <div className="relative">
                    <Input 
                      placeholder="Add a core skill (e.g. React, Python)..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = e.currentTarget.value.trim();
                          if (val) {
                            setResumeData(prev => ({ ...prev, skills: [...(prev.skills || []), val] }));
                            e.currentTarget.value = "";
                          }
                        }
                      }}
                      className="h-20 rounded-[1.5rem] bg-slate-50 border-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all text-lg font-bold px-8 placeholder:text-slate-300"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pointer-events-none">
                       <RotateCcw className="w-3 h-3" /> Press Enter
                    </div>
                  </div>
               </Card>
            </div>
          )}

          {activeSection === "languages" && (
            <div className="space-y-12">
               <div className="space-y-4">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Languages</h2>
                  <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                     What communication protocols do you support for global collaboration?
                  </p>
               </div>
               <LanguagesEditor languages={resumeData.languages || []} onChange={langs => setResumeData(prev => ({ ...prev, languages: langs }))} />
            </div>
          )}

          {activeSection === "design" && (
            <div className="space-y-12">
               <div className="space-y-4">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Aesthetic Engine</h2>
                  <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                     Personalize the visual identity of your professional blueprints.
                  </p>
               </div>
               <ColorPanel colors={colors} activePresetId={activePresetId} onPresetSelect={applyPreset} onColorChange={setColor} onReset={resetColors} />
            </div>
          )}

          {activeSection === "templates" && (
            <div className="space-y-12">
               <div className="space-y-4">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Templates</h2>
                  <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                     Select a structural architecture that aligns with your industry mission.
                  </p>
               </div>
               <TemplateSelector selectedId={selectedTemplate} onSelect={setSelectedTemplate} />
            </div>
          )}
        </StudioEditor>

        {/* Right: Live Preview Canvas */}
        <StudioPreview 
          resumeData={resumeData}
          title={title}
          selectedTemplate={selectedTemplate}
          colors={colors}
          zoom={zoom}
          onZoomChange={setZoom}
        />
      </div>

      {/* Floating AI Assistant */}
      <AICopilot />
    </div>
  );
}

