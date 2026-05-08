import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, FileText, Trash2, Edit, Download, MoreVertical, Sparkles, Layout, Share2, Copy, Check, ExternalLink 
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import type { Tables } from "@/integrations/supabase/types";
import type { ResumeData } from "@/components/resume/types";
import SEOHead from "@/components/SEOHead";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Resume = Tables<"resumes">;

export default function Resumes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const url = `${window.location.origin}/p/${shareId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied to clipboard!" });
  };

  const fetchResumes = async () => {
    const { data } = await supabase.from("resumes").select("*").order("updated_at", { ascending: false });
    setResumes(data ?? []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchResumes(); }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("resumes").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Resume deleted" });
      fetchResumes();
    }
  };

  const computeResumeScore = (data: ResumeData) => {
    let score = 20; 
    if (data?.personalInfo?.fullName) score += 10;
    if (data?.personalInfo?.email) score += 5;
    if (data?.summary) score += 15;
    if (data?.skills && data.skills.length > 5) score += 15;
    if (data?.experience && data.experience.length > 0) score += 20;
    if (data?.education && data.education.length > 0) score += 15;
    return Math.min(score, 100);
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Resumes...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 min-h-screen">
      <SEOHead title="My Resumes — ResumePro" description="Manage and edit your professional resumes." />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Professional <span className="text-primary">Portfolio</span></h1>
          <p className="text-slate-500 mt-2 font-medium">Create and manage multiple tailored resumes for different industries.</p>
        </div>
        <Button onClick={() => navigate("/builder")} className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs h-14 px-8 rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 gap-3">
          <Plus className="w-5 h-5" /> Create New Resume
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {resumes.length === 0 ? (
          <Card className="col-span-full py-32 border-2 border-dashed border-slate-100 bg-slate-50/50 rounded-[3rem] text-center space-y-6">
             <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <FileText className="w-10 h-10 text-slate-200" />
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">Your portfolio is empty</h3>
                <p className="text-slate-400 font-medium max-w-sm mx-auto">Start by building your first high-impact resume with our AI architect.</p>
             </div>
             <Button onClick={() => navigate("/builder")} className="bg-primary text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl shadow-xl shadow-primary/20 transition-all">Get Started</Button>
          </Card>
        ) : (
          resumes.map((resume) => {
            const data = resume.resume_data as unknown as ResumeData;
            const score = computeResumeScore(data);
            return (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="group relative rounded-[2.5rem] border-slate-100 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden flex items-center justify-center p-8 group-hover:p-6 transition-all duration-500">
                     <div className="w-full h-full bg-white shadow-2xl rounded-sm border border-slate-100 overflow-hidden transform rotate-2 group-hover:rotate-0 transition-transform duration-500 origin-bottom-right">
                        <div className="h-1.5 w-full bg-primary/20" />
                        <div className="p-4 space-y-2">
                           <div className="w-1/3 h-2 bg-slate-100 rounded" />
                           <div className="w-1/2 h-1 bg-slate-50 rounded" />
                           <div className="pt-4 space-y-1">
                              <div className="w-full h-1 bg-slate-50 rounded" />
                              <div className="w-full h-1 bg-slate-50 rounded" />
                              <div className="w-3/4 h-1 bg-slate-50 rounded" />
                           </div>
                        </div>
                     </div>
                     <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button onClick={() => navigate(`/builder/${resume.id}`)} className="bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-xl hover:bg-primary hover:text-white transition-all">
                           <Edit className="w-4 h-4 mr-2" /> Open Editor
                        </Button>
                     </div>
                  </div>

                  <CardHeader className="p-8 pb-4">
                    <div className="flex items-center justify-between">
                       <CardTitle className="text-xl font-black text-slate-900 truncate pr-4">{resume.title}</CardTitle>
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100"><MoreVertical className="w-4 h-4 text-slate-400" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl p-2 shadow-2xl border-slate-100">
                             <DropdownMenuItem onClick={() => navigate(`/builder/${resume.id}`)} className="rounded-lg font-bold text-xs uppercase tracking-widest p-3 gap-3">
                                <Edit className="w-4 h-4" /> Edit
                             </DropdownMenuItem>
                             <DropdownMenuItem className="rounded-lg font-bold text-xs uppercase tracking-widest p-3 gap-3">
                                <Download className="w-4 h-4" /> Download PDF
                             </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => { setShareOpen(true); setShareId(resume.id); }} className="rounded-lg font-bold text-xs uppercase tracking-widest p-3 gap-3 text-primary focus:text-primary focus:bg-primary/5">
                                <Share2 className="w-4 h-4" /> Share Profile
                             </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleDelete(resume.id)} className="rounded-lg font-bold text-xs uppercase tracking-widest p-3 gap-3 text-red-500 focus:text-red-500 focus:bg-red-50">
                                <Trash2 className="w-4 h-4" /> Delete
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                       </DropdownMenu>
                    </div>
                    <CardDescription className="font-medium text-slate-400">
                       Last modified {new Date(resume.updated_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-8 pt-0 space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className="text-slate-400">ATS Strength</span>
                       <span className={score >= 80 ? "text-green-500" : score >= 50 ? "text-amber-500" : "text-red-500"}>{score}%</span>
                    </div>
                    <Progress value={score} className="h-2 bg-slate-50" />
                    
                    <div className="pt-4 flex items-center justify-between">
                       <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-blue-600">AI</div>
                          <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[10px] font-black text-white">ATS</div>
                       </div>
                       <Button variant="ghost" onClick={() => navigate(`/builder/${resume.id}`)} className="text-primary font-black uppercase tracking-widest text-[10px] gap-2 p-0 h-auto hover:bg-transparent hover:text-primary/80">
                          Configure <Sparkles className="w-3 h-3" />
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Advanced Features Spotlight */}
      <section className="pt-20">
         <div className="p-12 rounded-[3rem] bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-6 max-w-xl">
               <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-6 h-6 text-primary" />
               </div>
               <h2 className="text-3xl font-black text-slate-900">AI-Powered Coverage</h2>
               <p className="text-slate-500 font-medium leading-relaxed">
                  Generate professional cover letters tailored to your resumes and specific job descriptions. 
                  Land more interviews with persuasive narratives.
               </p>
               <Button onClick={() => navigate("/cover-letters")} className="bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-8">Create Cover Letter</Button>
            </div>
            <div className="w-full md:w-96 aspect-square bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 space-y-4">
               <div className="h-4 w-1/3 bg-slate-100 rounded" />
               <div className="space-y-2">
                  <div className="h-2 w-full bg-slate-50 rounded" />
                  <div className="h-2 w-full bg-slate-50 rounded" />
                  <div className="h-2 w-3/4 bg-slate-50 rounded" />
               </div>
               <div className="pt-8 h-32 w-full bg-blue-50/30 rounded-2xl border border-blue-100 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary opacity-20" />
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}assName="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{t.resumes.professionalSummary}</CardTitle>
                  <Button size="sm" variant="outline" onClick={generateSummary} disabled={aiLoading === "summary"}>
                      {aiLoading === "summary" ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                      {t.resumes.aiGenerate}
                    </Button>
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
                  <Button size="sm" variant="outline" onClick={suggestSkills} disabled={aiLoading === "skills"}>
                      {aiLoading === "skills" ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                      {t.resumes.aiSuggest}
                    </Button>
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
                <IndustryKeywords
                  jobTitle={resumeData.experience?.[0]?.title || title}
                  currentSkills={resumeData.skills || []}
                  onAdd={(skill) => {
                    if (!(resumeData.skills || []).includes(skill)) {
                      setResumeData((prev) => ({ ...prev, skills: [...(prev.skills || []), skill] }));
                    }
                  }}
                />
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
                      <Button size="sm" variant="outline" onClick={() => generateBullets(i)} disabled={aiLoading === "bullets"}>
                          {aiLoading === "bullets" ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                          {t.resumes.aiGenerateBullets}
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
                      <p className="text-xs text-muted-foreground">{t.resumes.noBullets}</p>
                    )}
                    {(exp.bullets?.length ?? 0) > 0 && <PowerWordsHint bullets={exp.bullets} />}
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
            <ResumePreview resumeData={resumeData} title={title} templateId={selectedTemplate} colors={resumeColors} />
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <SEOHead title="Resumes — ResumePro" description="Create and manage ATS-optimized resumes." noindex />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">My <span className="text-primary">Resumes</span></h1>
          <p className="text-slate-500 mt-2 font-medium">Manage and optimize your professional documents with AI.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
          {isPro ? (
            <Button variant="outline" onClick={() => setLinkedinOpen(true)} disabled={linkedinLoading} className="font-bold px-6 py-6 rounded-2xl h-auto border-slate-200">
              <Linkedin className="h-4 w-4 mr-2 text-[#0077B5]" /> Import LinkedIn
            </Button>
          ) : (
            <ProFeatureGate inline message="LinkedIn Import"><span /></ProFeatureGate>
          )}
          <Button variant="outline" onClick={() => pdfInputRef.current?.click()} disabled={uploadingPdf} className="font-bold px-6 py-6 rounded-2xl h-auto border-slate-200">
            {uploadingPdf ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Parsing...</> : <><Upload className="h-4 w-4 mr-2" /> Upload PDF</>}
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 rounded-2xl shadow-xl shadow-primary/20 gap-2 h-auto">
            <Plus className="w-5 h-5" /> New Resume
          </Button>
        </div>
      </div>

      <Tabs value={searchParams.get("tab") || "resumes"} onValueChange={(v) => setSearchParams(v === "resumes" ? {} : { tab: v }, { replace: true })} className="space-y-8">
        <TabsList className="p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <TabsTrigger value="resumes" className="rounded-xl px-6 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            <FileText className="h-4 w-4 mr-2" /> Resumes
          </TabsTrigger>
          <TabsTrigger value="cover-letters" className="rounded-xl px-6 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            <Mail className="h-4 w-4 mr-2" /> Cover Letters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumes" className="space-y-8 mt-0">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse" />
              ))}
            </div>
          ) : resumes.length === 0 ? (
            <Card className="rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
                  <FileText className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">No resumes yet</h3>
                <p className="text-slate-500 font-medium mt-2 max-w-sm">Create your first professional resume with our AI-powered builder.</p>
                <Button onClick={() => setCreateOpen(true)} className="mt-8 bg-primary text-white font-bold px-8 py-4 rounded-xl">
                   Get Started
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resumes.map((resume, index) => {
                const score = computeResumeScore(resume.resume_data as unknown as ResumeData, resume.title);
                return (
                  <motion.div
                    key={resume.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl transition-all group overflow-hidden border-b-4 border-b-transparent hover:border-b-primary">
                      <CardHeader className="p-8 pb-4">
                         <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-primary border border-slate-100 dark:border-slate-700">
                               <FileText className="w-6 h-6" />
                            </div>
                            <div className="flex gap-1">
                               <Button variant="ghost" size="icon" onClick={() => handleEdit(resume)} className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary">
                                  <Edit className="h-4 w-4" />
                               </Button>
                               <Button variant="ghost" size="icon" onClick={() => handleDelete(resume.id)} className="h-9 w-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
                                  <Trash2 className="h-4 w-4" />
                               </Button>
                            </div>
                         </div>
                         <h3 className="text-xl font-black text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{resume.title}</h3>
                         <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                           Updated {new Date(resume.updated_at).toLocaleDateString()}
                         </p>
                      </CardHeader>
                      <CardContent className="p-8 pt-4">
                         <div className="space-y-4">
                            <div className="flex items-center justify-between">
                               <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Strength</span>
                               <span className="text-xs font-black text-primary">{score}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-50 dark:bg-slate-800 overflow-hidden">
                               <div className="h-full bg-primary rounded-full" style={{ width: `${score}%` }} />
                            </div>
                            <div className="pt-4 grid grid-cols-2 gap-3">
                               <Button 
                                 onClick={() => { setAiApplyPendingResume(resume); setAiApplySetupOpen(true); }}
                                 className="bg-slate-900 dark:bg-slate-800 hover:bg-primary text-white font-bold h-11 rounded-xl transition-all"
                               >
                                 <Zap className="w-3.5 h-3.5 mr-2" /> AI Apply
                               </Button>
                               <Button 
                                 variant="outline"
                                 onClick={() => handleEdit(resume)}
                                 className="font-bold h-11 rounded-xl border-slate-200"
                               >
                                 Edit Details
                               </Button>
                            </div>
                         </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cover-letters" className="mt-0">
          <CoverLetters />
        </TabsContent>
      </Tabs>

      {/* New Resume Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-md">
           <div className="bg-slate-900 p-8 text-white relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-6">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <DialogTitle className="text-2xl font-black tracking-tight">{t.resumes.createResume}</DialogTitle>
                <p className="text-slate-400 text-sm font-medium mt-2">{t.resumes.createResumeDesc}</p>
             </div>
          </div>
          <div className="p-8 space-y-6 bg-white dark:bg-slate-950">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.resumes.resumeTitle}</Label>
              <Input
                placeholder="e.g. Senior Product Designer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl h-11 border-slate-200"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button variant="ghost" onClick={() => setCreateOpen(false)} className="flex-1 font-bold h-12 rounded-xl">Cancel</Button>
              <Button onClick={handleCreate} disabled={!title.trim()} className="flex-[2] bg-primary text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/20">
                Start Building
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Apply Setup Dialog */}
      <Dialog open={aiApplySetupOpen} onOpenChange={(open) => { if (!open) setAiApplySetupOpen(false); }}>
        <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-lg">
           <div className="bg-slate-900 p-8 text-white relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <DialogTitle className="text-2xl font-black tracking-tight">AI Apply Campaign</DialogTitle>
                <p className="text-slate-400 text-sm font-medium mt-2">Configure your campaign — AI will search 50+ jobs and apply.</p>
             </div>
          </div>
          <div className="p-8 space-y-6 bg-white dark:bg-slate-950">
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preferred Location</Label>
                <Input
                  placeholder="e.g. New York, Remote, London"
                  value={aiApplyLocation}
                  onChange={(e) => setAiApplyLocation(e.target.value)}
                  className="rounded-xl h-11 border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Job Type</Label>
                <div className="flex gap-2 flex-wrap">
                  {["Any", "Remote", "On-site", "Hybrid"].map((type) => {
                    const val = type === "Any" ? "" : type.toLowerCase();
                    return (
                      <button
                        key={type}
                        onClick={() => setAiApplyJobType(val)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${aiApplyJobType === val ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "border-slate-100 text-slate-400 hover:border-primary/50"}`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Min Match Score</Label>
                  <span className="text-xs font-black text-primary">{aiApplyMinScore}%</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={85}
                  step={5}
                  value={aiApplyMinScore}
                  onChange={(e) => setAiApplyMinScore(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 space-y-2 leading-relaxed">
                <p className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary" /> Searching <span className="text-slate-900 dark:text-white">50+ live jobs</span> across multiple platforms</p>
                <p className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary" /> AI scoring in <span className="text-slate-900 dark:text-white">batches of 10</span> for precision</p>
                <p className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary" /> Tailored resume + cover letter <span className="text-slate-900 dark:text-white">per application</span></p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="ghost" onClick={() => setAiApplySetupOpen(false)} className="flex-1 font-bold h-12 rounded-xl">Cancel</Button>
                <Button 
                  className="flex-[2] bg-primary text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/20"
                  onClick={() => { if (aiApplyPendingResume) handleAIApply(aiApplyPendingResume); }}
                >
                  <Sparkles className="h-4 w-4 mr-2" /> Launch Campaign
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Apply Progress Dialog */}
      <Dialog open={!!aiApplyingId} onOpenChange={() => {}}>
        <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-md [&>button]:hidden">
           <div className="bg-slate-900 p-10 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <DialogTitle className="text-2xl font-black text-white tracking-tight">Campaign Running</DialogTitle>
                <p className="text-slate-400 text-sm font-medium mt-2">Searching 50+ jobs and preparing applications.</p>
             </div>
          </div>
          <div className="p-8 space-y-6 bg-white dark:bg-slate-950">
            <Progress
              value={aiApplyStep >= AI_APPLY_STEPS.length
                ? 100
                : Math.round((aiApplyStep / AI_APPLY_STEPS.length) * 100)}
              className="h-2 bg-slate-100 dark:bg-slate-900"
            />

            <div className="space-y-2">
              {AI_APPLY_STEPS.map((step, i) => {
                const isDone = aiApplyStep > i;
                const isActive = aiApplyStep === i;
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 ${isActive ? "bg-primary/5 border border-primary/20" : "border border-transparent"}`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : isActive ? (
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-slate-200" />
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-black uppercase tracking-widest ${isDone ? "text-slate-300 line-through" : isActive ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {aiApplyCampaignResult && (
              <div className="space-y-4 pt-4">
                <div className="p-6 rounded-[2rem] bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900 text-center">
                  <p className="font-black text-green-700 dark:text-green-400 text-lg">Campaign Complete! 🚀</p>
                  <p className="text-slate-500 text-xs font-bold mt-2 leading-relaxed">
                    Found {aiApplyCampaignResult.total_found} jobs · Scored {aiApplyCampaignResult.total_scored} · Queued {aiApplyCampaignResult.queued} tailored applications
                  </p>
                </div>
                <Button 
                  className="w-full h-12 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold" 
                  onClick={() => { setAiApplyingId(null); setAiApplyCampaignResult(null); }}
                >
                  Dismiss & View Applications
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* LinkedIn Import Dialog */}
      <Dialog open={linkedinOpen} onOpenChange={setLinkedinOpen}>
        <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-md">
           <div className="bg-[#0077B5] p-8 text-white relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <Linkedin className="h-6 w-6 text-white" />
                </div>
                <DialogTitle className="text-2xl font-black tracking-tight">{t.resumes.importFromLinkedin}</DialogTitle>
                <p className="text-white/80 text-sm font-medium mt-2">{t.resumes.importLinkedinDesc}</p>
             </div>
          </div>
          <div className="p-8 space-y-6 bg-white dark:bg-slate-950">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.resumes.linkedinUrl}</Label>
              <Input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/your-profile"
                className="rounded-xl h-11 border-slate-200"
              />
            </div>
            <Button onClick={handleLinkedInImport} disabled={linkedinLoading || !linkedinUrl.trim()} className="w-full h-12 rounded-xl bg-[#0077B5] hover:bg-[#0077B5]/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-[#0077B5]/20">
              {linkedinLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t.resumes.importing}</> : <>{t.resumes.importProfile}</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Share Profile Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-md">
           <div className="bg-slate-900 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                 <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
                    <Share2 className="h-6 w-6 text-white" />
                 </div>
                 <DialogTitle className="text-2xl font-black tracking-tight">Share Identity</DialogTitle>
                 <p className="text-slate-400 text-sm font-medium mt-2">Generate a public link to your professional profile.</p>
              </div>
           </div>
           <div className="p-8 space-y-6 bg-white">
              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Public Profile URL</Label>
                 <div className="flex gap-2">
                    <div className="flex-1 h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 flex items-center text-xs font-bold text-slate-500 overflow-hidden truncate">
                       {window.location.origin}/p/{shareId?.substring(0, 8)}...
                    </div>
                    <Button onClick={copyToClipboard} className="h-12 w-12 rounded-xl bg-slate-900 text-white shrink-0">
                       {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                 </div>
              </div>
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4">
                 <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0"><Sparkles className="w-5 h-5" /></div>
                 <p className="text-[10px] font-bold text-slate-600 leading-relaxed">
                    This link includes your resume preview, skills, and contact info in a high-performance visual format.
                 </p>
              </div>
              <Button asChild className="w-full h-12 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
                 <Link to={`/p/${shareId}`} target="_blank" className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Preview Live Site
                 </Link>
              </Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

