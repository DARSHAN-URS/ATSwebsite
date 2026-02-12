import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Trash2, Edit, Sparkles, Loader2, X, Download, Target, ClipboardCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Tables } from "@/integrations/supabase/types";
import type { ResumeData, PersonalInfo, CustomSection } from "@/components/resume/types";
import { generateResumePDF, type TemplateId } from "@/components/resume/pdfTemplates";
import PersonalInfoSection from "@/components/resume/PersonalInfoSection";
import CustomSectionsEditor from "@/components/resume/CustomSectionsEditor";
import TemplateSelector from "@/components/resume/TemplateSelector";
import ResumePreview from "@/components/resume/ResumePreview";

type Resume = Tables<"resumes">;

export default function Resumes() {
  const { user } = useAuth();
  const { toast } = useToast();
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
  const fetchResumes = async () => {
    const { data } = await supabase.from("resumes").select("*").order("created_at", { ascending: false });
    setResumes(data ?? []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchResumes(); }, [user]);

  const resetForm = () => {
    setTitle("");
    setResumeData({ personalInfo: {}, summary: "", skills: [], experience: [], education: [], customSections: [] });
    setSkillInput("");
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("resumes").update({
      title,
      resume_data: resumeData as any,
    }).eq("id", editingId);
    if (error) {
      toast({ title: "Error saving", variant: "destructive" });
    } else {
      toast({ title: "Resume saved!" });
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
        toast({ title: "AI Error", description: data.error, variant: "destructive" });
        return null;
      }
      return data;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
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
      toast({ title: "Summary generated!" });
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
      toast({ title: "Bullet points generated!" });
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
      toast({ title: "Skills suggested!" });
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
      experience: [...(prev.experience || []), { title: "", company: "", description: "", bullets: [] }],
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
      education: [...(prev.education || []), { degree: "", school: "", year: "" }],
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

  const handleExportPDF = () => {
    generateResumePDF(resumeData, title, selectedTemplate);
    toast({ title: "PDF downloaded!" });
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
        toast({ title: "AI Error", description: data.error, variant: "destructive" });
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
      toast({ title: "Resume tailored to job description!" });
      setTailorOpen(false);
      setTailorJD("");
    } catch (e: any) {
      toast({ title: "Tailoring failed", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
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
        toast({ title: "AI Error", description: data.error, variant: "destructive" });
        return;
      }
      setGradeResult(data);
    } catch (e: any) {
      toast({ title: "Grading failed", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
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

  if (loading) return <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>;

  // Editor view
  if (editingId) {
    return (
      <div className="h-[calc(100vh-4rem)] md:h-screen flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0 gap-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); resetForm(); }}>← Back</Button>
            <h1 className="text-lg sm:text-xl font-bold">Edit Resume</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Dialog open={tailorOpen} onOpenChange={setTailorOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Target className="h-4 w-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">Tailor to Job</span><span className="sm:hidden">Tailor</span></Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tailor Resume to Job Description</DialogTitle>
                  <DialogDescription>Paste a job description and AI will rewrite your summary, skills, and bullet points to match.</DialogDescription>
                </DialogHeader>
                <Textarea
                  rows={8}
                  value={tailorJD}
                  onChange={(e) => setTailorJD(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="min-h-[200px]"
                />
                <Button onClick={handleTailor} disabled={tailoring || !tailorJD.trim()} className="w-full">
                  {tailoring ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Tailoring...</> : <><Sparkles className="h-4 w-4 mr-2" />Tailor My Resume</>}
                </Button>
              </DialogContent>
            </Dialog>
            <Dialog open={gradeOpen} onOpenChange={(open) => { setGradeOpen(open); if (!open) { setGradeResult(null); setGradeJD(""); } }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><ClipboardCheck className="h-4 w-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">Grade Resume</span><span className="sm:hidden">Grade</span></Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Resume Grader</DialogTitle>
                  <DialogDescription>Get an AI-powered grade on ATS compatibility, job fit, and writing quality.</DialogDescription>
                </DialogHeader>
                {!gradeResult ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Job Description (optional — for job-specific fit scoring)</Label>
                      <Textarea
                        rows={6}
                        value={gradeJD}
                        onChange={(e) => setGradeJD(e.target.value)}
                        placeholder="Paste a job description for targeted grading, or leave blank for general assessment..."
                        className="min-h-[150px]"
                      />
                    </div>
                    <Button onClick={handleGrade} disabled={grading} className="w-full">
                      {grading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Grading...</> : <><ClipboardCheck className="h-4 w-4 mr-2" />Grade My Resume</>}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Overall Score */}
                    <div className="text-center p-6 rounded-lg border bg-muted/30">
                      <div className={`text-5xl font-bold ${scoreColor(gradeResult.overallScore)}`}>{gradeResult.overallScore}</div>
                      <div className="text-sm text-muted-foreground mt-1">Overall Score</div>
                      <Progress value={gradeResult.overallScore} className={`mt-3 h-3 ${progressColor(gradeResult.overallScore)}`} />
                      <p className="text-sm mt-4 text-left">{gradeResult.overallAssessment}</p>
                    </div>

                    {/* Category Scores */}
                    {[
                      { key: "ats", label: "ATS Compatibility", data: gradeResult.ats },
                      { key: "fit", label: gradeResult.fit?.label || "Job Fit", data: gradeResult.fit },
                      { key: "writing", label: "Writing Quality", data: gradeResult.writing },
                    ].map(({ key, label, data }) => (
                      <div key={key} className="p-4 rounded-lg border space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{label}</h3>
                          <span className={`text-2xl font-bold ${scoreColor(data.score)}`}>{data.score}</span>
                        </div>
                        <Progress value={data.score} className={`h-2 ${progressColor(data.score)}`} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Strengths</h4>
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
                            <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Improvements</h4>
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
                      Grade Again
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handleExportPDF}><Download className="h-4 w-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">Export PDF</span><span className="sm:hidden">PDF</span></Button>
            <Button size="sm" onClick={handleSaveEdit}>Save</Button>
          </div>
        </div>

        {/* Side-by-side layout (stacked on mobile) */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row">
          {/* Editor panel */}
          <div className="md:w-1/2 overflow-y-auto p-4 sm:p-6 space-y-5 border-b md:border-b-0 md:border-r">
            <div className="space-y-2">
              <Label>Resume Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            {/* Template Selection */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">PDF Template</CardTitle>
                <CardDescription>Choose a visual style for your exported PDF</CardDescription>
              </CardHeader>
              <CardContent>
                <TemplateSelector selected={selectedTemplate} onChange={setSelectedTemplate} />
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
                  <CardTitle className="text-base">Professional Summary</CardTitle>
                  <Button size="sm" variant="outline" onClick={generateSummary} disabled={aiLoading === "summary"}>
                    {aiLoading === "summary" ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                    AI Generate
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea rows={3} value={resumeData.summary || ""} onChange={(e) => setResumeData((prev) => ({ ...prev, summary: e.target.value }))} placeholder="Write a professional summary..." />
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Skills</CardTitle>
                  <Button size="sm" variant="outline" onClick={suggestSkills} disabled={aiLoading === "skills"}>
                    {aiLoading === "skills" ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                    AI Suggest
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add a skill..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} />
                  <Button variant="outline" onClick={addSkill}>Add</Button>
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
                  <CardTitle className="text-base">Experience</CardTitle>
                  <Button size="sm" variant="outline" onClick={addExperience}><Plus className="h-3 w-3 mr-1" />Add</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {(resumeData.experience || []).map((exp, i) => (
                  <div key={i} className="space-y-3 p-4 rounded-lg border bg-muted/30">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                        <div>
                          <Label className="text-xs">Job Title</Label>
                          <Input value={exp.title} onChange={(e) => updateExperience(i, "title", e.target.value)} placeholder="Senior Developer" />
                        </div>
                        <div>
                          <Label className="text-xs">Company</Label>
                          <Input value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} placeholder="Acme Inc." />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0 ml-2" onClick={() => removeExperience(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                    <div>
                      <Label className="text-xs">Brief Description (for AI context)</Label>
                      <Input value={exp.description} onChange={(e) => updateExperience(i, "description", e.target.value)} placeholder="What did you do in this role?" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Bullet Points</Label>
                      <Button size="sm" variant="outline" onClick={() => generateBullets(i)} disabled={aiLoading === "bullets"}>
                        {aiLoading === "bullets" ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                        AI Generate Bullets
                      </Button>
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
                      <p className="text-xs text-muted-foreground">No bullet points yet. Use AI to generate them.</p>
                    )}
                  </div>
                ))}
                {(resumeData.experience || []).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No experience added yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Education</CardTitle>
                  <Button size="sm" variant="outline" onClick={addEducation}><Plus className="h-3 w-3 mr-1" />Add</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {(resumeData.education || []).map((edu, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                      <Input value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} placeholder="Degree" />
                      <Input value={edu.school} onChange={(e) => updateEducation(i, "school", e.target.value)} placeholder="School" />
                      <Input value={edu.year || ""} onChange={(e) => updateEducation(i, "year", e.target.value)} placeholder="Year" />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeEducation(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Custom Sections */}
            <div>
              <h2 className="text-base font-semibold mb-3">Custom Sections</h2>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resumes</h1>
          <p className="text-muted-foreground mt-1">Build and manage your resumes with AI assistance.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Resume</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Resume</DialogTitle>
              <DialogDescription>Give your resume a title to get started. You can add details in the editor.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Resume Title</Label>
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
                  toast({ title: "Error", description: error.message, variant: "destructive" });
                } else {
                  toast({ title: "Resume created" });
                  setCreateOpen(false);
                  setTitle("");
                  fetchResumes();
                  if (data) openEditor(data);
                }
              }} className="w-full">Create & Open Editor</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {resumes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No resumes yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first resume with AI-powered writing assistance.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => {
            const data = resume.resume_data as any as ResumeData;
            return (
              <Card key={resume.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-base">{resume.title}</CardTitle>
                    <CardDescription>{new Date(resume.created_at).toLocaleDateString()}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(resume.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {data?.skills && data.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {data.skills.slice(0, 5).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs">{skill}</span>
                      ))}
                      {data.skills.length > 5 && (
                        <span className="px-2 py-0.5 text-muted-foreground text-xs">+{data.skills.length - 5}</span>
                      )}
                    </div>
                  )}
                  <Button size="sm" variant="outline" onClick={() => openEditor(resume)}><Edit className="h-3 w-3 mr-1" />Edit</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
