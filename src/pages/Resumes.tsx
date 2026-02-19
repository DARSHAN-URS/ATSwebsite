import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Trash2, Edit, Sparkles, Loader2, X, Download, Target, ClipboardCheck, CheckCircle2, AlertTriangle, Upload, Linkedin, Mail, Zap } from "lucide-react";
import ATSScannerDialog from "@/components/resume/ATSScannerDialog";
import { Progress } from "@/components/ui/progress";
import type { Tables } from "@/integrations/supabase/types";
import type { ResumeData, PersonalInfo, CustomSection, LanguageItem } from "@/components/resume/types";
import { type TemplateId } from "@/components/resume/pdfTemplates";
import ResumeExportDialog from "@/components/resume/ResumeExportDialog";
import PersonalInfoSection from "@/components/resume/PersonalInfoSection";
import CustomSectionsEditor from "@/components/resume/CustomSectionsEditor";
import TemplateSelector from "@/components/resume/TemplateSelector";
import TemplateThumbnail from "@/components/resume/TemplateThumbnail";
import ResumePreview from "@/components/resume/ResumePreview";
import LanguagesEditor from "@/components/resume/LanguagesEditor";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSubscription } from "@/hooks/useSubscription";
import ProFeatureGate from "@/components/ProFeatureGate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CoverLetters from "@/pages/CoverLetters";

type Resume = Tables<"resumes">;

export default function Resumes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { isPro } = useSubscription();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {},
    summary: "",
    skills: [],
    experience: [],
    education: [],
    customSections: [],
  });
  const [skillInput, setSkillInput] = useState("");
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("classic");
  const [tailorOpen, setTailorOpen] = useState(false);
  const [tailorJD, setTailorJD] = useState("");
  const [tailoring, setTailoring] = useState(false);
  const [gradeOpen, setGradeOpen] = useState(false);
  const [gradeJD, setGradeJD] = useState("");
  const [grading, setGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<any>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [linkedinOpen, setLinkedinOpen] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [aiApplyingId, setAiApplyingId] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const fetchResumes = async () => {
    const { data } = await supabase.from("resumes").select("*").order("updated_at", { ascending: false });
    setResumes(data ?? []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchResumes(); }, [user]);

  const handleAIApply = async (resume: Resume) => {
    if (!user) return;
    setAiApplyingId(resume.id);
    try {
      const { data, error } = await supabase.functions.invoke("ai-apply", {
        body: {
          resume_id: resume.id,
          resume_title: resume.title,
          resume_data: resume.resume_data,
        },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "AI Apply failed", description: data.error, variant: "destructive" });
        return;
      }
      toast({
        title: "AI Apply launched! 🚀",
        description: `${data.queued} tailored applications are ready on your dashboard.`,
      });
    } catch (err: any) {
      toast({ title: "AI Apply failed", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setAiApplyingId(null);
    }
  };


  const resetForm = () => {
    setTitle("");
    setResumeData({ personalInfo: {}, summary: "", skills: [], experience: [], education: [], customSections: [], languages: [] });
    setSkillInput("");
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (pdfInputRef.current) pdfInputRef.current.value = "";
    if (!file || !user) return;
    if (file.type !== "application/pdf") {
      toast({ title: t.resumes.selectPdf, variant: "destructive" });
      return;
    }
    setUploadingPdf(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item: any) => item.str).join(" ") + "\n";
      }

      if (fullText.trim().length < 20) {
        toast({ title: t.resumes.couldNotExtract, description: t.resumes.couldNotExtractDesc, variant: "destructive" });
        return;
      }

      const { data, error } = await supabase.functions.invoke("parse-resume", {
        body: { text: fullText },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: t.common.error, description: data.error, variant: "destructive" });
        return;
      }

      const resumeTitle = data.personalInfo?.fullName
        ? `${data.personalInfo.fullName}'s Resume`
        : file.name.replace(/\.pdf$/i, "");

      const parsedData: ResumeData = {
        personalInfo: data.personalInfo || {},
        summary: data.summary || "",
        skills: data.skills || [],
        experience: (data.experience || []).map((exp: any) => ({
          title: exp.title || "",
          company: exp.company || "",
          description: exp.description || "",
          bullets: exp.bullets || [],
        })),
        education: data.education || [],
        customSections: data.customSections || [],
      };

      const { data: created, error: createError } = await supabase.from("resumes").insert({
        user_id: user.id,
        title: resumeTitle,
        resume_data: parsedData as any,
      }).select().single();

      if (createError) throw createError;

      toast({ title: t.resumes.resumeImported, description: t.resumes.resumeImportedDesc });
      fetchResumes();
      if (created) openEditor(created);
    } catch (err: any) {
      console.error("PDF upload error:", err);
      toast({ title: t.resumes.uploadFailed, description: err.message || t.resumes.unexpectedError, variant: "destructive" });
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const dataToSave = { ...resumeData, templateId: selectedTemplate };
    const { error } = await supabase.from("resumes").update({
      title,
      resume_data: dataToSave as any,
    }).eq("id", editingId);
    if (error) {
      toast({ title: t.resumes.errorSaving, variant: "destructive" });
    } else {
      toast({ title: t.resumes.saved });
      fetchResumes();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("resumes").delete().eq("id", id);
    if (editingId === id) setEditingId(null);
    fetchResumes();
  };

  const openEditor = (resume: Resume) => {
    setEditingId(resume.id);
    setTitle(resume.title);
    const data = resume.resume_data as any as ResumeData;
    setSelectedTemplate((data?.templateId as TemplateId) || "classic");
    setResumeData({
      personalInfo: data?.personalInfo || {},
      summary: data?.summary || "",
      skills: data?.skills || [],
      experience: (data?.experience || []).map((e: any) => ({
        title: e.title || "",
        company: e.company || "",
        description: e.description || "",
        bullets: e.bullets || [],
      })),
      education: data?.education || [],
      customSections: data?.customSections || [],
      languages: data?.languages || [],
      templateId: data?.templateId,
    });
  };

  // AI helpers
  const aiAssist = async (type: string, context: any) => {
    setAiLoading(type);
    try {
      const { data, error } = await supabase.functions.invoke("resume-assist", {
        body: { type, context },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: t.common.error, description: data.error, variant: "destructive" });
        return null;
      }
      return data;
    } catch (e: any) {
      toast({ title: t.common.error, description: e.message, variant: "destructive" });
      return null;
    } finally {
      setAiLoading(null);
    }
  };

  const generateSummary = async () => {
    const result = await aiAssist("summary", {
      jobTitle: title,
      skills: resumeData.skills,
      experience: resumeData.experience,
    });
    if (result?.summary) {
      setResumeData((prev) => ({ ...prev, summary: result.summary }));
      toast({ title: t.resumes.summaryGenerated });
    }
  };

  const generateBullets = async (expIndex: number) => {
    const exp = resumeData.experience?.[expIndex];
    if (!exp) return;
    const result = await aiAssist("bullets", {
      title: exp.title,
      company: exp.company,
      description: exp.description,
      skills: resumeData.skills,
    });
    if (result?.bullets) {
      setResumeData((prev) => {
        const experience = [...(prev.experience || [])];
        experience[expIndex] = { ...experience[expIndex], bullets: result.bullets };
        return { ...prev, experience };
      });
      toast({ title: t.resumes.bulletsGenerated });
    }
  };

  const suggestSkills = async () => {
    const result = await aiAssist("skills", {
      jobTitle: title,
      experience: resumeData.experience,
      existingSkills: resumeData.skills,
    });
    if (result?.skills) {
      setResumeData((prev) => ({
        ...prev,
        skills: [...new Set([...(prev.skills || []), ...result.skills])],
      }));
      toast({ title: t.resumes.skillsSuggested });
    }
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    setResumeData((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), skillInput.trim()],
    }));
    setSkillInput("");
  };

  const removeSkill = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((_, i) => i !== index),
    }));
  };

  const addExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [...(prev.experience || []), { title: "", company: "", startDate: "", endDate: "", description: "", bullets: [] }],
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setResumeData((prev) => {
      const experience = [...(prev.experience || [])];
      experience[index] = { ...experience[index], [field]: value };
      return { ...prev, experience };
    });
  };

  const removeExperience = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      experience: (prev.experience || []).filter((_, i) => i !== index),
    }));
  };

  const addEducation = () => {
    setResumeData((prev) => ({
      ...prev,
      education: [...(prev.education || []), { degree: "", school: "", startDate: "", endDate: "", year: "" }],
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setResumeData((prev) => {
      const education = [...(prev.education || [])];
      education[index] = { ...education[index], [field]: value };
      return { ...prev, education };
    });
  };

  const removeEducation = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== index),
    }));
  };

  const handleExportPDF = async () => {
    const { generateResumePDF } = await import("@/components/resume/pdfTemplates");
    await generateResumePDF(resumeData, title, selectedTemplate);
    toast({ title: t.resumes.pdfDownloaded });
  };

  const handleLinkedInImport = async () => {
    if (!linkedinUrl.trim() || !user) return;
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]{3,100}\/?$/i;
    if (!linkedinRegex.test(linkedinUrl.trim())) {
      toast({ title: t.resumes.invalidLinkedinUrl, description: t.resumes.invalidLinkedinUrlDesc, variant: "destructive" });
      return;
    }
    setLinkedinLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-linkedin", {
        body: { linkedinUrl: linkedinUrl.trim() },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: t.resumes.importFailed, description: data.error, variant: "destructive" });
        return;
      }

      const resumeTitle = data.personalInfo?.fullName
        ? `${data.personalInfo.fullName}'s Resume`
        : "LinkedIn Resume";

      const { data: created, error: createError } = await supabase.from("resumes").insert({
        user_id: user.id,
        title: resumeTitle,
        resume_data: data as any,
      }).select().single();

      if (createError) throw createError;

      toast({ title: t.resumes.linkedinImported, description: t.resumes.linkedinImportedDesc });
      setLinkedinOpen(false);
      setLinkedinUrl("");
      fetchResumes();
      if (created) openEditor(created);
    } catch (err: any) {
      console.error("LinkedIn import error:", err);
      toast({ title: t.resumes.importFailed, description: err.message || t.resumes.unexpectedError, variant: "destructive" });
    } finally {
      setLinkedinLoading(false);
    }
  };

  const handleTailor = async () => {
    if (!tailorJD.trim()) return;
    setTailoring(true);
    try {
      const { data, error } = await supabase.functions.invoke("tailor-resume", {
        body: { resumeData, jobDescription: tailorJD },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: t.common.error, description: data.error, variant: "destructive" });
        return;
      }
      setResumeData((prev) => {
        const updated = { ...prev };
        if (data.summary) updated.summary = data.summary;
        if (data.skills) updated.skills = data.skills;
        if (data.experience && prev.experience) {
          updated.experience = prev.experience.map((exp, i) => ({
            ...exp,
            bullets: data.experience[i]?.bullets || exp.bullets,
          }));
        }
        return updated;
      });
      toast({ title: t.resumes.resumeTailored });
      setTailorOpen(false);
      setTailorJD("");
    } catch (e: any) {
      toast({ title: t.resumes.tailoringFailed, description: t.resumes.unexpectedError, variant: "destructive" });
    } finally {
      setTailoring(false);
    }
  };

  const handleGrade = async () => {
    setGrading(true);
    setGradeResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("grade-resume", {
        body: { resumeData, jobDescription: gradeJD },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: t.common.error, description: data.error, variant: "destructive" });
        return;
      }
      setGradeResult(data);
    } catch (e: any) {
      toast({ title: t.resumes.gradingFailed, description: t.resumes.unexpectedError, variant: "destructive" });
    } finally {
      setGrading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const progressColor = (score: number) => {
    if (score >= 80) return "[&>div]:bg-green-500";
    if (score >= 60) return "[&>div]:bg-yellow-500";
    return "[&>div]:bg-red-500";
  };

  if (loading) return <div className="flex items-center justify-center h-full text-muted-foreground">{t.common.loading}</div>;

  // Editor view
  if (editingId) {
    return (
      <div className="h-[calc(100vh-4rem)] md:h-screen flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0 gap-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); resetForm(); }}>{t.common.back}</Button>
            <h1 className="text-lg sm:text-xl font-bold">{t.resumes.editResume}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {isPro ? (
            <Dialog open={tailorOpen} onOpenChange={setTailorOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Target className="h-4 w-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">{t.resumes.tailorToJob}</span><span className="sm:hidden">{t.resumes.tailorToJob}</span></Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t.resumes.tailorTitle}</DialogTitle>
                  <DialogDescription>{t.resumes.tailorDesc}</DialogDescription>
                </DialogHeader>
                <Textarea
                  rows={8}
                  value={tailorJD}
                  onChange={(e) => setTailorJD(e.target.value)}
                  placeholder={t.resumes.tailorPlaceholder}
                  className="min-h-[200px]"
                />
                <Button onClick={handleTailor} disabled={tailoring || !tailorJD.trim()} className="w-full">
                  {tailoring ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t.resumes.tailoring}</> : <><Sparkles className="h-4 w-4 mr-2" />{t.resumes.tailorMyResume}</>}
                </Button>
              </DialogContent>
            </Dialog>
            ) : (
              <ProFeatureGate inline message="AI Tailor"><span /></ProFeatureGate>
            )}
            {isPro ? (
            <Dialog open={gradeOpen} onOpenChange={(open) => { setGradeOpen(open); if (!open) { setGradeResult(null); setGradeJD(""); } }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><ClipboardCheck className="h-4 w-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">{t.resumes.gradeResume}</span><span className="sm:hidden">{t.resumes.gradeResume}</span></Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t.resumes.gradeTitle}</DialogTitle>
                  <DialogDescription>{t.resumes.gradeDesc}</DialogDescription>
                </DialogHeader>
                {!gradeResult ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t.resumes.gradeJdLabel}</Label>
                      <Textarea
                        rows={6}
                        value={gradeJD}
                        onChange={(e) => setGradeJD(e.target.value)}
                        placeholder={t.resumes.gradeJdPlaceholder}
                        className="min-h-[150px]"
                      />
                    </div>
                    <Button onClick={handleGrade} disabled={grading} className="w-full">
                      {grading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t.resumes.grading}</> : <><ClipboardCheck className="h-4 w-4 mr-2" />{t.resumes.gradeMyResume}</>}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center p-6 rounded-lg border bg-muted/30">
                      <div className={`text-5xl font-bold ${scoreColor(gradeResult.overallScore)}`}>{gradeResult.overallScore}</div>
                      <div className="text-sm text-muted-foreground mt-1">{t.resumes.overallScore}</div>
                      <Progress value={gradeResult.overallScore} className={`mt-3 h-3 ${progressColor(gradeResult.overallScore)}`} />
                      <p className="text-sm mt-4 text-left">{gradeResult.overallAssessment}</p>
                    </div>

                    {[
                      { key: "ats", label: t.resumes.atsCompatibility, data: gradeResult.ats },
                      { key: "fit", label: gradeResult.fit?.label || t.resumes.jobFit, data: gradeResult.fit },
                      { key: "writing", label: t.resumes.writingQuality, data: gradeResult.writing },
                    ].map(({ key, label, data }) => (
                      <div key={key} className="p-4 rounded-lg border space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{label}</h3>
                          <span className={`text-2xl font-bold ${scoreColor(data.score)}`}>{data.score}</span>
                        </div>
                        <Progress value={data.score} className={`h-2 ${progressColor(data.score)}`} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">{t.resumes.strengths}</h4>
                            <ul className="space-y-1.5">
                              {data.strengths.map((s: string, i: number) => (
                                <li key={i} className="text-sm flex gap-2 items-start">
                                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">{t.resumes.improvements}</h4>
                            <ul className="space-y-1.5">
                              {data.improvements.map((s: string, i: number) => (
                                <li key={i} className="text-sm flex gap-2 items-start">
                                  <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button variant="outline" onClick={() => { setGradeResult(null); }} className="w-full">
                      {t.resumes.gradeAgain}
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            ) : (
              <ProFeatureGate inline message="AI Grade"><span /></ProFeatureGate>
            )}
            <ATSScannerDialog resumeData={resumeData} />
            <ResumeExportDialog resumeData={resumeData} title={title} templateId={selectedTemplate} />
            <Button size="sm" onClick={handleSaveEdit}>{t.common.save}</Button>
          </div>
        </div>

        {/* Side-by-side layout (stacked on mobile) */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row">
          {/* Editor panel */}
          <div className="md:w-1/2 overflow-y-auto p-4 sm:p-6 space-y-5 border-b md:border-b-0 md:border-r">
            <div className="space-y-2">
              <Label>{t.resumes.resumeTitle}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            {/* Template Selection */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t.resumes.pdfTemplate}</CardTitle>
                <CardDescription>{t.resumes.choosePdfStyle}</CardDescription>
              </CardHeader>
              <CardContent>
                <TemplateSelector selected={selectedTemplate} onChange={setSelectedTemplate} jobTitle={title} />
              </CardContent>
            </Card>

            {/* Personal Information */}
            {user && (
              <PersonalInfoSection
                personalInfo={resumeData.personalInfo || {}}
                onChange={(info) => setResumeData((prev) => ({ ...prev, personalInfo: info }))}
                userId={user.id}
              />
            )}

            {/* Summary */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{t.resumes.professionalSummary}</CardTitle>
                  {isPro ? (
                    <Button size="sm" variant="outline" onClick={generateSummary} disabled={aiLoading === "summary"}>
                      {aiLoading === "summary" ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                      {t.resumes.aiGenerate}
                    </Button>
                  ) : (
                    <ProFeatureGate inline message="AI Generate"><span /></ProFeatureGate>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Textarea rows={3} value={resumeData.summary || ""} onChange={(e) => setResumeData((prev) => ({ ...prev, summary: e.target.value }))} placeholder={t.resumes.writeSummaryPlaceholder} />
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{t.resumes.skills}</CardTitle>
                  {isPro ? (
                    <Button size="sm" variant="outline" onClick={suggestSkills} disabled={aiLoading === "skills"}>
                      {aiLoading === "skills" ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                      {t.resumes.aiSuggest}
                    </Button>
                  ) : (
                    <ProFeatureGate inline message="AI Suggest"><span /></ProFeatureGate>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder={t.resumes.addSkillPlaceholder} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} />
                  <Button variant="outline" onClick={addSkill}>{t.common.add}</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(resumeData.skills || []).map((skill, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">
                      {skill}
                      <button onClick={() => removeSkill(i)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{t.resumes.experience}</CardTitle>
                  <Button size="sm" variant="outline" onClick={addExperience}><Plus className="h-3 w-3 mr-1" />{t.common.add}</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {(resumeData.experience || []).map((exp, i) => (
                  <div key={i} className="space-y-3 p-4 rounded-lg border bg-muted/30">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                        <div>
                          <Label className="text-xs">{t.resumes.jobTitle}</Label>
                          <Input value={exp.title} onChange={(e) => updateExperience(i, "title", e.target.value)} placeholder="Senior Developer" />
                        </div>
                        <div>
                          <Label className="text-xs">{t.resumes.company}</Label>
                          <Input value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} placeholder="Acme Inc." />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0 ml-2" onClick={() => removeExperience(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t.resumes.startDate}</Label>
                        <Input value={exp.startDate || ""} onChange={(e) => updateExperience(i, "startDate", e.target.value)} placeholder="e.g. Jan 2020" />
                      </div>
                      <div>
                        <Label className="text-xs">{t.resumes.endDate}</Label>
                        <Input value={exp.endDate || ""} onChange={(e) => updateExperience(i, "endDate", e.target.value)} placeholder="e.g. Present" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">{t.resumes.briefDesc}</Label>
                      <Input value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} placeholder={t.resumes.whatDidYouDo} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">{t.resumes.bullets}</Label>
                      {isPro ? (
                        <Button size="sm" variant="outline" onClick={() => generateBullets(i)} disabled={aiLoading === "bullets"}>
                          {aiLoading === "bullets" ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                          {t.resumes.aiGenerateBullets}
                        </Button>
                      ) : (
                        <ProFeatureGate inline message="AI Bullets"><span /></ProFeatureGate>
                      )}
                    </div>
                    {exp.bullets && exp.bullets.length > 0 ? (
                      <ul className="space-y-1">
                        {exp.bullets.map((bullet, bi) => (
                          <li key={bi} className="flex gap-2 items-start">
                            <span className="text-muted-foreground mt-1">•</span>
                            <Input
                              value={bullet}
                              className="h-8 text-sm"
                              onChange={(e) => {
                                const experience = [...(resumeData.experience || [])];
                                const bullets = [...experience[i].bullets];
                                bullets[bi] = e.target.value;
                                experience[i] = { ...experience[i], bullets };
                                setResumeData((prev) => ({ ...prev, experience }));
                              }}
                            />
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => {
                              const experience = [...(resumeData.experience || [])];
                              experience[i] = { ...experience[i], bullets: experience[i].bullets.filter((_, j) => j !== bi) };
                              setResumeData((prev) => ({ ...prev, experience }));
                            }}><X className="h-3 w-3" /></Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">{t.resumes.noBullets}</p>
                    )}
                  </div>
                ))}
                {(resumeData.experience || []).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">{t.resumes.noExperience}</p>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{t.resumes.education}</CardTitle>
                  <Button size="sm" variant="outline" onClick={addEducation}><Plus className="h-3 w-3 mr-1" />{t.common.add}</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {(resumeData.education || []).map((edu, i) => (
                  <div key={i} className="space-y-2 p-3 rounded-lg border bg-muted/30">
                    <div className="flex gap-3 items-start">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                        <div>
                          <Label className="text-xs">{t.resumes.degree}</Label>
                          <Input value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} placeholder={t.resumes.degree} />
                        </div>
                        <div>
                          <Label className="text-xs">{t.resumes.school}</Label>
                          <Input value={edu.school} onChange={(e) => updateEducation(i, "school", e.target.value)} placeholder={t.resumes.school} />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0 mt-4" onClick={() => removeEducation(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">{t.resumes.startDate}</Label>
                        <Input value={edu.startDate || ""} onChange={(e) => updateEducation(i, "startDate", e.target.value)} placeholder="e.g. Sep 2016" />
                      </div>
                      <div>
                        <Label className="text-xs">{t.resumes.endDate}</Label>
                        <Input value={edu.endDate || ""} onChange={(e) => updateEducation(i, "endDate", e.target.value)} placeholder="e.g. Jun 2020" />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Languages */}
            <LanguagesEditor
              languages={resumeData.languages || []}
              onChange={(languages) => setResumeData((prev) => ({ ...prev, languages }))}
            />

            {/* Custom Sections */}
            <div>
              <h2 className="text-base font-semibold mb-3">{t.resumes.customSections}</h2>
              <CustomSectionsEditor
                sections={resumeData.customSections || []}
                onChange={(sections) => setResumeData((prev) => ({ ...prev, customSections: sections }))}
              />
            </div>
          </div>

          {/* Preview panel - hidden on mobile, shown on md+ */}
          <div className="hidden md:block md:w-1/2 p-4">
            <ResumePreview resumeData={resumeData} title={title} templateId={selectedTemplate} />
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      <SEOHead title="Resumes — ATS Pro Resume Builder" description="Create and manage ATS-optimized resumes." noindex />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.resumes.title}</h1>
        <p className="text-muted-foreground mt-1">{t.resumes.buildWithAI}</p>
      </div>

      <Tabs defaultValue="resumes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="resumes" className="gap-2"><FileText className="h-4 w-4" />Resumes</TabsTrigger>
          <TabsTrigger value="cover-letters" className="gap-2"><Mail className="h-4 w-4" />Cover Letters</TabsTrigger>
        </TabsList>

        <TabsContent value="resumes" className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-end shrink-0">
          <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
          {isPro ? (
            <Button variant="outline" size="sm" onClick={() => setLinkedinOpen(true)} disabled={linkedinLoading}>
              <Linkedin className="h-4 w-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">{t.resumes.importLinkedin}</span><span className="sm:hidden">LinkedIn</span>
            </Button>
          ) : (
            <ProFeatureGate inline message="LinkedIn Import"><span /></ProFeatureGate>
          )}
          <Button variant="outline" size="sm" onClick={() => pdfInputRef.current?.click()} disabled={uploadingPdf}>
            {uploadingPdf ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /><span className="hidden sm:inline">{t.resumes.parsing}</span></> : <><Upload className="h-4 w-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">{t.resumes.uploadResume}</span><span className="sm:hidden">Upload</span></>}
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" />{t.resumes.newResume}</Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.resumes.createResume}</DialogTitle>
              <DialogDescription>{t.resumes.createResumeDesc}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t.resumes.resumeTitle}</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Full Stack Developer Resume" />
              </div>
              <Button onClick={async () => {
                if (!user || !title) return;
                const { data, error } = await supabase.from("resumes").insert({
                  user_id: user.id,
                  title,
                  resume_data: { personalInfo: {}, summary: "", skills: [], experience: [], education: [], customSections: [] } as any,
                }).select().single();
                if (error) {
                  toast({ title: t.common.error, description: error.message, variant: "destructive" });
                } else {
                  toast({ title: t.resumes.resumeCreated });
                  setCreateOpen(false);
                  setTitle("");
                  fetchResumes();
                  if (data) openEditor(data);
                }
              }} className="w-full">{t.resumes.createAndOpen}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {resumes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">{t.resumes.noResumes}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t.resumes.noResumesDesc}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => {
            const data = resume.resume_data as any as ResumeData;
            const tplId = (data?.templateId as TemplateId) || "classic";
            return (
              <Card key={resume.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openEditor(resume)}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Mini template thumbnail */}
                    <div className="w-20 shrink-0">
                      <TemplateThumbnail templateId={tplId} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base truncate">{resume.title}</CardTitle>
                          <CardDescription>{new Date(resume.updated_at).toLocaleDateString()}</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0" onClick={(e) => { e.stopPropagation(); handleDelete(resume.id); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      {data?.skills && data.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {data.skills.slice(0, 4).map((skill, i) => (
                            <span key={i} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs">{skill}</span>
                          ))}
                          {data.skills.length > 4 && (
                            <span className="px-2 py-0.5 text-muted-foreground text-xs">+{data.skills.length - 4}</span>
                          )}
                        </div>
                      )}
                      {/* AI Apply button */}
                      <div className="mt-3 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
                          onClick={(e) => { e.stopPropagation(); handleAIApply(resume); }}
                          disabled={aiApplyingId === resume.id}
                        >
                          {aiApplyingId === resume.id ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Finding & tailoring jobs...</>
                          ) : (
                            <><Zap className="h-3.5 w-3.5" /> AI Apply</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* LinkedIn Import Dialog */}
      <Dialog open={linkedinOpen} onOpenChange={setLinkedinOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.resumes.importFromLinkedin}</DialogTitle>
            <DialogDescription>{t.resumes.importLinkedinDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.resumes.linkedinUrl}</Label>
              <Input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/your-profile"
              />
            </div>
            <Button onClick={handleLinkedInImport} disabled={linkedinLoading || !linkedinUrl.trim()} className="w-full">
              {linkedinLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t.resumes.importing}</> : <><Linkedin className="h-4 w-4 mr-2" />{t.resumes.importProfile}</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        </TabsContent>

        <TabsContent value="cover-letters">
          <CoverLetters />
        </TabsContent>
      </Tabs>
    </div>
  );
}
