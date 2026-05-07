import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Trash2, Edit, Download, Sparkles, Loader2, Mail, ArrowRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CoverLetterEditor from "@/components/cover-letter/CoverLetterEditor";

export interface CoverLetterData {
  applicant_name?: string;
  applicant_address?: string;
  applicant_phone?: string;
  applicant_email?: string;
  applicant_linkedin?: string;
  date?: string;
  recipient_name?: string;
  recipient_title?: string;
  company_name?: string;
  company_address?: string;
  subject_line?: string;
  greeting: string;
  opening: string;
  value_experience?: string;
  why_company?: string;
  body?: string;
  closing: string;
  sign_off?: string;
}

export interface CoverLetter {
  id: string;
  title: string;
  resume_id: string | null;
  job_description: string | null;
  tone: string;
  cover_letter_data: CoverLetterData;
  created_at: string;
  updated_at: string;
}

interface Resume {
  id: string;
  title: string;
  resume_data: any;
}

const STORAGE_KEY = "ats-cover-letter-draft";

function saveDraft(data: { selectedResumeId: string; jobDescription: string; tone: string; title: string; createOpen: boolean }) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function loadDraft(): { selectedResumeId: string; jobDescription: string; tone: string; title: string; createOpen: boolean } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function clearDraft() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
}

export default function CoverLetters() {
  const { user } = useAuth();
  const { toast } = useToast();
  const draft = loadDraft();
  
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [createOpen, setCreateOpen] = useState(draft?.createOpen ?? false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [selectedResumeId, setSelectedResumeId] = useState(draft?.selectedResumeId ?? "");
  const [jobDescription, setJobDescription] = useState(draft?.jobDescription ?? "");
  const [tone, setTone] = useState(draft?.tone ?? "professional");
  const [title, setTitle] = useState(draft?.title ?? "");

  const [editData, setEditData] = useState<CoverLetterData>({ greeting: "", opening: "", closing: "" });

  useEffect(() => {
    if (createOpen || jobDescription || selectedResumeId || title) {
      saveDraft({ selectedResumeId, jobDescription, tone, title, createOpen });
    }
  }, [createOpen, selectedResumeId, jobDescription, tone, title]);

  const fetchData = async () => {
    if (!user) return;
    const [clRes, rRes] = await Promise.all([
      supabase.from("cover_letters").select("*").order("updated_at", { ascending: false }),
      supabase.from("resumes").select("id, title, resume_data"),
    ]);
    if (clRes.data) setCoverLetters(clRes.data as unknown as CoverLetter[]);
    if (rRes.data) setResumes(rRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleGenerate = async () => {
    if (!selectedResumeId) {
      toast({ title: "Select a resume", variant: "destructive" });
      return;
    }
    if (!jobDescription.trim()) {
      toast({ title: "Enter a job description", variant: "destructive" });
      return;
    }
    const resume = resumes.find((r) => r.id === selectedResumeId);
    if (!resume) return;

    setGenerating(true);
    try {
      const { data, error } = await invokeFunction("generate-cover-letter", {
        body: { resumeData: resume.resume_data, jobDescription, tone },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "AI Error", description: data.error, variant: "destructive" });
        return;
      }

      const coverLetterData: CoverLetterData = {
        applicant_name: data.applicant_name || "",
        applicant_address: data.applicant_address || "",
        applicant_phone: data.applicant_phone || "",
        applicant_email: data.applicant_email || "",
        applicant_linkedin: data.applicant_linkedin || "",
        date: data.date || "",
        recipient_name: data.recipient_name || "",
        recipient_title: data.recipient_title || "",
        company_name: data.company_name || "",
        company_address: data.company_address || "",
        subject_line: data.subject_line || "",
        greeting: data.greeting || "",
        opening: data.opening || "",
        value_experience: data.value_experience || "",
        why_company: data.why_company || "",
        closing: data.closing || "",
        sign_off: data.sign_off || "Sincerely,",
      };
      const finalTitle = title.trim() || data.suggested_title || "Untitled Cover Letter";

      const { data: saved, error: saveErr } = await supabase
        .from("cover_letters")
        .insert([{
          user_id: user!.id,
          title: finalTitle,
          resume_id: selectedResumeId,
          job_description: jobDescription,
          tone,
          cover_letter_data: coverLetterData as any,
        }])
        .select()
        .single();

      if (saveErr) throw saveErr;
      toast({ title: "Cover letter generated!" });
      setCreateOpen(false);
      resetForm();
      fetchData();
      if (saved) {
        setEditingId(saved.id);
        setEditData(coverLetterData);
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const resetForm = () => {
    setSelectedResumeId("");
    setJobDescription("");
    setTone("professional");
    setTitle("");
    clearDraft();
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase
      .from("cover_letters")
      .update({ cover_letter_data: editData as any })
      .eq("id", editingId);
    if (error) {
      toast({ title: "Error saving", variant: "destructive" });
    } else {
      toast({ title: "Saved!" });
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("cover_letters").delete().eq("id", id);
    if (editingId === id) setEditingId(null);
    fetchData();
  };

  const openEditor = (cl: CoverLetter) => {
    setEditingId(cl.id);
    setEditData(cl.cover_letter_data);
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-50 dark:bg-slate-900 rounded-[2rem] animate-pulse" />)}
    </div>
  );

  if (editingId) {
    const cl = coverLetters.find((c) => c.id === editingId);
    return (
      <CoverLetterEditor
        title={cl?.title || "Cover Letter"}
        editData={editData}
        setEditData={setEditData}
        onBack={() => setEditingId(null)}
        onSave={handleSaveEdit}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)} className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-5 rounded-2xl shadow-lg shadow-primary/20 gap-2 h-auto">
          <Plus className="w-5 h-5" /> New Cover Letter
        </Button>
      </div>

      {coverLetters.length === 0 ? (
        <Card className="rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
              <Mail className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">No cover letters</h3>
            <p className="text-slate-500 font-medium mt-2 max-w-sm">AI will help you write a tailored cover letter for any job in seconds.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coverLetters.map((cl, index) => (
            <motion.div
              key={cl.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl transition-all group overflow-hidden border-b-4 border-b-transparent hover:border-b-primary">
                <CardHeader className="p-8 pb-4">
                   <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-primary border border-slate-100 dark:border-slate-700">
                         <Mail className="w-6 h-6" />
                      </div>
                      <div className="flex gap-1">
                         <Button variant="ghost" size="icon" onClick={() => openEditor(cl)} className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary">
                            <Edit className="h-4 w-4" />
                         </Button>
                         <Button variant="ghost" size="icon" onClick={() => handleDelete(cl.id)} className="h-9 w-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                   </div>
                   <h3 className="text-xl font-black text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{cl.title}</h3>
                   <div className="flex items-center gap-2 mt-2">
                     <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-slate-100 dark:border-slate-800">
                       {cl.tone}
                     </Badge>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       {new Date(cl.updated_at).toLocaleDateString()}
                     </span>
                   </div>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                   <p className="text-sm text-slate-500 font-medium line-clamp-3 leading-relaxed mb-6">
                     {cl.cover_letter_data?.opening || "Preparing your perfect pitch..."}
                   </p>
                   <Button onClick={() => openEditor(cl)} variant="outline" className="w-full h-11 rounded-xl border-slate-200 font-bold group">
                     View Document
                     <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                   </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* New Cover Letter Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-2xl">
           <div className="bg-slate-900 p-8 text-white relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-6">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <DialogTitle className="text-2xl font-black tracking-tight">AI Cover Letter</DialogTitle>
                <p className="text-slate-400 text-sm font-medium mt-2">Tailor your pitch for a specific role using your resume data.</p>
             </div>
          </div>
          <div className="p-8 space-y-6 bg-white dark:bg-slate-950 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Document Title</Label>
                   <Input placeholder="e.g. Google SWE Application" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl h-11" />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Source Resume</Label>
                   <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                     <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select a resume" /></SelectTrigger>
                     <SelectContent className="rounded-xl">
                       {resumes.map((r) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tone of Voice</Label>
                   <Select value={tone} onValueChange={setTone}>
                     <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                     <SelectContent className="rounded-xl">
                       <SelectItem value="professional">Professional</SelectItem>
                       <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                       <SelectItem value="conversational">Conversational</SelectItem>
                       <SelectItem value="confident">Confident & Bold</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
              </div>
              <div className="space-y-2 flex flex-col">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Job Description</Label>
                <Textarea 
                  className="flex-1 rounded-2xl min-h-[180px] p-4 bg-slate-50 dark:bg-slate-900 border-none resize-none" 
                  placeholder="Paste the job description here..." 
                  value={jobDescription} 
                  onChange={(e) => setJobDescription(e.target.value)} 
                />
              </div>
            </div>
          </div>
          <div className="p-8 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setCreateOpen(false)} className="font-bold h-12 px-6 rounded-xl">Cancel</Button>
            <Button 
              onClick={handleGenerate} 
              disabled={generating} 
              className="bg-primary text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-primary/20"
            >
              {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate with AI</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Badge({ children, variant = "default", className = "" }: { children: React.ReactNode, variant?: string, className?: string }) {
  const styles = variant === "outline" ? "border border-slate-200 text-slate-600" : "bg-primary text-white";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${styles} ${className}`}>
      {children}
    </span>
  );
}
