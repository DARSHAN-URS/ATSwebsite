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

  // Completion Tracking for Navigator
  const completionData = {
    personal: !!resumeData.personalInfo?.fullName,
    summary: !!resumeData.summary && resumeData.summary.length > 50,
    experience: (resumeData.experience || []).length > 0,
    education: (resumeData.education || []).length > 0,
    skills: (resumeData.skills || []).length >= 5,
    languages: (resumeData.languages || []).length > 0,
    custom: (resumeData.customSections || []).length > 0,
  };

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
    <div className="h-screen flex flex-col bg-[#F5F7FB] mesh-gradient-light overflow-hidden font-sans text-left">
      <ModernOnboarding />
      {/* Top Navigation - Premium Glass */}
      <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-6">
          <Link to="/resumes">
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-slate-100">
              <ChevronLeft className="w-5 h-5 text-slate-500" />
            </Button>
          </Link>
          <div className="h-6 w-px bg-slate-100" />
          <div className="flex flex-col">
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="text-sm font-bold text-slate-900 bg-transparent border-none p-0 focus:ring-0 w-48"
              placeholder="Resume Title"
            />
            <div className="flex items-center gap-1.5">
              <div className={cn("w-1.5 h-1.5 rounded-full", saving ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{saving ? "Saving..." : "All changes saved"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <div className="h-6 w-px bg-slate-100 mx-2" />
          <ATSScannerDialog resumeData={resumeData} />
          <ResumeExportDialog resumeData={resumeData} title={title} templateId={selectedTemplate} colors={colors} />
        </div>
      </header>

      {/* ATS Analytics Row */}
      <ATSAnalyticsRow score={82} keywordMatch={14} readability="Advanced" />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigator */}
        <SectionNavigator 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          completionData={completionData}
        />

        {/* Center Editor */}
        <main className="flex-1 bg-[#F5F7FB] flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-8 pb-32 max-w-2xl mx-auto w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  {activeSection === "personal" && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">Personal Information</h2>
                        <p className="text-sm text-slate-500 font-medium">How should recruiters contact you?</p>
                      </div>
                      <PersonalInfoSection personalInfo={resumeData.personalInfo || {}} onChange={info => setResumeData(prev => ({ ...prev, personalInfo: info }))} userId={user?.id || ""} />
                    </div>
                  )}

                  {activeSection === "summary" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h2 className="text-2xl font-black tracking-tight text-slate-900">Professional Summary</h2>
                          <p className="text-sm text-slate-500 font-medium">Introduce yourself in 2-3 powerful sentences.</p>
                        </div>
                        <Button onClick={generateSummary} disabled={aiLoading === "summary"} variant="outline" className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 border-blue-100 text-blue-600 hover:bg-blue-50">
                           {aiLoading === "summary" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} AI Generate
                        </Button>
                      </div>
                      <Card className="p-6 border-slate-100 shadow-sm rounded-2xl">
                        <Textarea 
                           value={resumeData.summary} 
                           onChange={e => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                           placeholder="Craft a powerful professional mission statement..." 
                           className="min-h-[300px] border-none p-0 focus-visible:ring-0 text-base leading-relaxed resize-none font-medium"
                        />
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>{resumeData.summary?.length || 0} characters</span>
                          <span className="flex items-center gap-1.5 text-blue-600"><Wand2 className="w-3 h-3" /> AI Writing Assistant Active</span>
                        </div>
                      </Card>
                    </div>
                  )}

                  {activeSection === "custom" && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">Custom Sections</h2>
                        <p className="text-sm text-slate-500 font-medium">Add projects, certifications, or custom categories.</p>
                      </div>
                      <CustomSectionsEditor sections={resumeData.customSections || []} onChange={sections => setResumeData(prev => ({ ...prev, customSections: sections }))} />
                    </div>
                  )}

                  {activeSection === "experience" && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">Work Experience</h2>
                        <p className="text-sm text-slate-500 font-medium">List your recent roles and achievements.</p>
                      </div>
                      <ExperienceEditor 
                        experience={resumeData.experience || []} 
                        onChange={exp => setResumeData(prev => ({ ...prev, experience: exp }))} 
                      />
                    </div>
                  )}

                  {activeSection === "education" && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">Education</h2>
                        <p className="text-sm text-slate-500 font-medium">Where did you study?</p>
                      </div>
                      <EducationEditor 
                        education={resumeData.education || []} 
                        onChange={edu => setResumeData(prev => ({ ...prev, education: edu }))} 
                      />
                    </div>
                  )}

                  {activeSection === "skills" && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">Skills</h2>
                        <p className="text-sm text-slate-500 font-medium">What are your technical and soft skills?</p>
                      </div>
                      <Card className="p-8 border-slate-100 shadow-sm rounded-2xl space-y-6 bg-white">
                        <div className="flex flex-wrap gap-2">
                          {(resumeData.skills || []).map((skill, i) => (
                            <motion.div 
                              key={i} 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 flex items-center gap-2 group hover:border-blue-200 transition-all"
                            >
                              {skill}
                              <button 
                                onClick={() => setResumeData(prev => ({ ...prev, skills: prev.skills?.filter((_, idx) => idx !== i) }))}
                                className="text-slate-300 hover:text-rose-500 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Add a skill (e.g. React, Python, Leadership)..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const val = e.currentTarget.value.trim();
                                if (val) {
                                  setResumeData(prev => ({ ...prev, skills: [...(prev.skills || []), val] }));
                                  e.currentTarget.value = "";
                                }
                              }
                            }}
                            className="h-12 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all text-sm font-medium"
                          />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Press Enter to add skill</p>
                      </Card>
                    </div>
                  )}

                  {activeSection === "languages" && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">Languages</h2>
                        <p className="text-sm text-slate-500 font-medium">What languages do you speak?</p>
                      </div>
                      <LanguagesEditor languages={resumeData.languages || []} onChange={langs => setResumeData(prev => ({ ...prev, languages: langs }))} />
                    </div>
                  )}

                  {activeSection === "design" && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">Theme & Colors</h2>
                        <p className="text-sm text-slate-500 font-medium">Personalize your resume aesthetic.</p>
                      </div>
                      <ColorPanel colors={colors} activePresetId={activePresetId} onPresetSelect={applyPreset} onColorChange={setColor} onReset={resetColors} />
                    </div>
                  )}

                  {activeSection === "templates" && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">Templates</h2>
                        <p className="text-sm text-slate-500 font-medium">Choose a layout that fits your industry.</p>
                      </div>
                      <TemplateSelector selectedId={selectedTemplate} onSelect={setSelectedTemplate} />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-12">
                    <Button variant="ghost" className="text-xs font-bold text-slate-400 hover:text-slate-600">
                      <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset Changes
                    </Button>
                    <Button onClick={() => saveResume(true)} className="h-12 px-8 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                      <Save className="w-4 h-4" /> Save Resume
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </ScrollArea>
        </main>

        {/* Right Preview */}
        <section className="flex-1 bg-slate-200/40 flex flex-col items-center p-8 overflow-hidden relative border-l border-slate-100 group">
          <div className="absolute top-8 right-8 z-30 flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
             <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(50, z - 10))} className="w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors"><ZoomOut className="w-4 h-4" /></Button>
             <div className="w-px h-4 bg-slate-200 mx-1" />
             <span className="text-[10px] font-black text-slate-400 w-10 text-center">{zoom}%</span>
             <div className="w-px h-4 bg-slate-200 mx-1" />
             <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(150, z + 10))} className="w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors"><ZoomIn className="w-4 h-4" /></Button>
          </div>
          
          <div className="h-full w-full flex items-start justify-center overflow-auto custom-scrollbar pt-8 pb-32 perspective-2000">
            <motion.div 
               style={{ 
                  scale: zoom / 100,
                  transformOrigin: "top center",
               }}
               className="shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] rounded-sm bg-white ring-1 ring-slate-200/50 hover:shadow-[0_70px_120px_-20px_rgba(0,0,0,0.2)] transition-shadow duration-700"
            >
              <ResumePreview resumeData={resumeData} title={title} templateId={selectedTemplate} colors={colors} />
            </motion.div>
          </div>
        </section>

        {/* AI Assistant Sidebar */}
        <AIAssistantSidebar />
      </div>
    </div>
  );
}

