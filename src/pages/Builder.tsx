import { useEffect, useState, useRef, useCallback, useMemo } from "react";
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
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useIsMobile } from "@/hooks/use-mobile";

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
import AIAssistantSidebar from "@/components/builder/AIAssistantSidebar";
import ModernOnboarding from "@/components/builder/ModernOnboarding";
import StudioTopBar from "@/components/builder/StudioTopBar";
import StudioSidebar from "@/components/builder/StudioSidebar";
import StudioEditor from "@/components/builder/StudioEditor";
import StudioPreview from "@/components/builder/StudioPreview";
import AICopilot from "@/components/builder/AICopilot";

const COMMON_SKILLS = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "C++", "C#", "Go", "Rust",
  "HTML", "CSS", "Tailwind CSS", "Next.js", "Vue.js", "Angular", "Svelte",
  "SQL", "PostgreSQL", "MongoDB", "MySQL", "Redis", "GraphQL", "REST API",
  "AWS", "Google Cloud", "Azure", "Docker", "Kubernetes", "CI/CD",
  "Git", "GitHub", "Linux", "Figma", "UI/UX Design", "Project Management",
  "Agile", "Scrum", "Marketing", "SEO", "Sales", "Communication", "Leadership",
  "Machine Learning", "Data Analysis", "Tableau", "Excel", "Data Science", "Digital Marketing", "Content Creation"
];

export default function Builder() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { colors, activePresetId, applyPreset, setColor, reset: resetColors } = useResumeColors();
  const isMobile = useIsMobile();

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [zoom, setZoom] = useState(85);
  const [exportOpen, setExportOpen] = useState(false);
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
  const [skillInput, setSkillInput] = useState("");

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
  }, [id, user, navigate, toast]);

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
  }, [id, user, title, resumeData, selectedTemplate, navigate, toast]);

  const sections = ["personal", "summary", "experience", "education", "skills", "languages", "custom", "design", "templates"];
  
  const handleSaveAndContinue = async () => {
    await saveResume(true);
    const currentIndex = sections.indexOf(activeSection);
    if (currentIndex >= 0 && currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1]);
    }
  };

  const generateSummary = async () => {
    const currentExperience = resumeData.experience?.map(e => e.title + e.company).join('|');
    const currentSkills = resumeData.skills?.join('|');
    const cacheKey = `ai_sum_${title}_${currentSkills}_${currentExperience}`.toLowerCase();

    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setResumeData(prev => ({ ...prev, summary: JSON.parse(cached) }));
        toast({ title: "Summary Created", description: "Loaded instantly from cache." });
        return;
      }
    } catch (e) {}

    setAiLoading("summary");
    try {
      const { data, error } = await invokeFunction("resume-assist", { body: { type: "summary", context: { jobTitle: title, skills: resumeData.skills, experience: resumeData.experience } } });
      if (error) throw error;
      if (data?.summary) {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(data.summary));
        } catch (e) {}
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
        onExport={async () => {
          await saveResume(true);
          setExportOpen(true);
        }}
        resumeData={resumeData}
        onNavigateSection={setActiveSection}
      />


      <div className={cn("flex-1 overflow-hidden", isMobile && "overflow-y-auto pb-20")}>
        <PanelGroup direction={isMobile ? "vertical" : "horizontal"} className={cn(isMobile && "min-h-[1800px]")}>
          {/* Left: Section Navigation */}
          <Panel defaultSize={20} minSize={15} maxSize={30}>
            <StudioSidebar 
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              completionData={completionData}
            />
          </Panel>

          <PanelResizeHandle className={cn(
            "z-50 flex items-center justify-center transition-colors bg-slate-100 hover:bg-blue-400 active:bg-blue-600",
            isMobile ? "h-2 w-full cursor-row-resize" : "w-2 h-full cursor-col-resize"
          )}>
            <div className={cn("rounded-full bg-slate-300", isMobile ? "h-1 w-8" : "w-1 h-8")} />
          </PanelResizeHandle>

          {/* Center: Editing Workspace */}
          <Panel defaultSize={40} minSize={30}>
            <StudioEditor 
              activeSection={activeSection}
              onSave={handleSaveAndContinue}
              saving={saving}
            >
          {activeSection === "personal" && (
            <div className="space-y-12">
               <div className="space-y-4">
                  <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">Personal Information</h2>
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
                     <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">Professional Summary</h2>
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
                     className="min-h-[120px] md:min-h-[200px] md:min-h-[350px] bg-transparent border-none p-0 focus-visible:ring-0 text-xl leading-relaxed resize-none font-medium text-slate-700 placeholder:text-slate-200"
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
                  <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">Work Experience</h2>
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
                  <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">Education</h2>
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
                  <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">Core Skills</h2>
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
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a core skill (e.g. React, Python)..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = skillInput.trim();
                          if (val && !resumeData.skills?.includes(val)) {
                            setResumeData(prev => ({ ...prev, skills: [...(prev.skills || []), val] }));
                            setSkillInput("");
                          }
                        }
                      }}
                      className="h-20 rounded-[1.5rem] bg-slate-50 border-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all text-lg font-bold px-8 placeholder:text-slate-300"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pointer-events-none">
                       <RotateCcw className="w-3 h-3" /> Press Enter
                    </div>
                    {skillInput.trim().length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl rounded-2xl z-50 max-h-60 overflow-y-auto p-2">
                        {COMMON_SKILLS.filter(s => s.toLowerCase().includes(skillInput.trim().toLowerCase()) && !resumeData.skills?.includes(s)).length > 0 ? (
                          COMMON_SKILLS.filter(s => s.toLowerCase().includes(skillInput.trim().toLowerCase()) && !resumeData.skills?.includes(s)).map(skill => (
                            <div
                              key={skill}
                              onClick={() => {
                                setResumeData(prev => ({ ...prev, skills: [...(prev.skills || []), skill] }));
                                setSkillInput("");
                              }}
                              className="px-4 py-3 hover:bg-blue-50 hover:text-blue-600 text-sm font-bold text-slate-700 cursor-pointer rounded-xl transition-colors"
                            >
                              {skill}
                            </div>
                          ))
                        ) : (
                           <div className="px-4 py-3 text-sm font-medium text-slate-400 italic">Press enter to add custom skill</div>
                        )}
                      </div>
                    )}
                  </div>
               </Card>
            </div>
          )}

          {activeSection === "languages" && (
            <div className="space-y-12">
               <div className="space-y-4">
                  <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">Languages</h2>
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
                  <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">Aesthetic Engine</h2>
                  <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                     Personalize the visual identity of your professional blueprints.
                  </p>
               </div>
               <ColorPanel colors={colors} activePresetId={activePresetId} onApplyPreset={applyPreset} onSetColor={setColor} onReset={resetColors} />
            </div>
          )}

          {activeSection === "templates" && (
            <div className="space-y-12">
               <div className="space-y-4">
                  <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">Templates</h2>
                  <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                     Select a structural architecture that aligns with your industry mission.
                  </p>
               </div>
               <TemplateSelector selected={selectedTemplate} onChange={setSelectedTemplate} resumeData={resumeData} />
            </div>
          )}
            </StudioEditor>
          </Panel>

          <PanelResizeHandle className={cn(
            "z-50 flex items-center justify-center transition-colors bg-slate-100 hover:bg-blue-400 active:bg-blue-600",
            isMobile ? "h-2 w-full cursor-row-resize" : "w-2 h-full cursor-col-resize"
          )}>
            <div className={cn("rounded-full bg-slate-300", isMobile ? "h-1 w-8" : "w-1 h-8")} />
          </PanelResizeHandle>

          {/* Right: Live Preview Canvas */}
          <Panel defaultSize={40} minSize={30}>
            <StudioPreview 
              resumeData={resumeData}
              title={title}
              selectedTemplate={selectedTemplate}
              colors={colors}
              zoom={zoom}
              onZoomChange={setZoom}
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </Panel>
        </PanelGroup>
      </div>

      {/* Floating AI Assistant */}
      <AICopilot />

      <ResumeExportDialog 
        open={exportOpen}
        onOpenChange={setExportOpen}
        resumeData={resumeData}
        title={title}
        templateId={selectedTemplate}
        colors={colors}
        showTrigger={false}
      />
    </div>
  );
}

