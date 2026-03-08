import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Trash2, Edit, Download, Sparkles, Loader2 } from "lucide-react";
import SEOHead from "@/components/SEOHead";

interface CoverLetterData {
  greeting: string;
  opening: string;
  body: string;
  closing: string;
}

interface CoverLetter {
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

  // Create form state — restored from draft
  const [selectedResumeId, setSelectedResumeId] = useState(draft?.selectedResumeId ?? "");
  const [jobDescription, setJobDescription] = useState(draft?.jobDescription ?? "");
  const [tone, setTone] = useState(draft?.tone ?? "professional");
  const [title, setTitle] = useState(draft?.title ?? "");

  // Editor state
  const [editData, setEditData] = useState<CoverLetterData>({ greeting: "", opening: "", body: "", closing: "" });
  const printRef = useRef<HTMLDivElement>(null);

  // Auto-save draft whenever form fields change
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
      const { data, error } = await supabase.functions.invoke("generate-cover-letter", {
        body: { resumeData: resume.resume_data, jobDescription, tone },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "AI Error", description: data.error, variant: "destructive" });
        return;
      }

      const coverLetterData: CoverLetterData = {
        greeting: data.greeting,
        opening: data.opening,
        body: data.body,
        closing: data.closing,
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

  const handleExportPDF = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const cl = coverLetters.find((c) => c.id === editingId);
    printWindow.document.write(`
      <html><head><title>${cl?.title || "Cover Letter"}</title>
      <style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;line-height:1.7;color:#222;padding:20px}
      p{margin-bottom:1em}</style></head><body>
      <p>${editData.greeting}</p><p>${editData.opening}</p><p>${editData.body}</p><p>${editData.closing}</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const openEditor = (cl: CoverLetter) => {
    setEditingId(cl.id);
    setEditData(cl.cover_letter_data);
  };

  if (loading) return <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>;

  // Editor view
  if (editingId) {
    const cl = coverLetters.find((c) => c.id === editingId);
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => setEditingId(null)} className="mb-2">← Back</Button>
            <h1 className="text-2xl font-bold">{cl?.title}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF}><Download className="h-4 w-4 mr-2" />Export PDF</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-4">
            <div>
              <Label>Greeting</Label>
              <Input value={editData.greeting} onChange={(e) => setEditData({ ...editData, greeting: e.target.value })} />
            </div>
            <div>
              <Label>Opening Paragraph</Label>
              <Textarea rows={4} value={editData.opening} onChange={(e) => setEditData({ ...editData, opening: e.target.value })} />
            </div>
            <div>
              <Label>Body</Label>
              <Textarea rows={8} value={editData.body} onChange={(e) => setEditData({ ...editData, body: e.target.value })} />
            </div>
            <div>
              <Label>Closing</Label>
              <Textarea rows={4} value={editData.closing} onChange={(e) => setEditData({ ...editData, closing: e.target.value })} />
            </div>
          </div>

          {/* Preview */}
          <Card>
            <CardHeader><CardTitle className="text-base">Preview</CardTitle></CardHeader>
            <CardContent>
              <div ref={printRef} className="prose prose-sm max-w-none space-y-4 font-serif text-foreground">
                <p>{editData.greeting}</p>
                <p>{editData.opening}</p>
                <p>{editData.body}</p>
                <p>{editData.closing}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <>
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0 self-start"><Plus className="h-4 w-4 mr-2" />New Cover Letter</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Generate Cover Letter</DialogTitle>
              <DialogDescription>Select a resume and paste the job description to generate a tailored cover letter.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title (optional)</Label>
                <Input placeholder="e.g. Google SWE Cover Letter" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <Label>Resume</Label>
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                  <SelectTrigger><SelectValue placeholder="Select a resume" /></SelectTrigger>
                  <SelectContent>
                    {resumes.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Job Description</Label>
                <Textarea rows={6} placeholder="Paste the full job description here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
              </div>
              <div>
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="h-4 w-4 mr-2" />Generate with AI</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {coverLetters.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No cover letters yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Create your first AI-generated cover letter.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coverLetters.map((cl) => (
            <Card key={cl.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base truncate">{cl.title}</CardTitle>
                <CardDescription className="capitalize">{cl.tone} tone • {new Date(cl.updated_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{cl.cover_letter_data?.opening}</p>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => openEditor(cl)}><Edit className="h-3 w-3 mr-1" />Edit</Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(cl.id)}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </>
    </div>
  );
}
