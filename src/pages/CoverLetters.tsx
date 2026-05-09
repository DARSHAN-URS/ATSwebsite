import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Trash2, Edit, Sparkles, Loader2, Mail, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CoverLetterEditor from "@/components/cover-letter/CoverLetterEditor";
import SEOHead from "@/components/SEOHead";

export interface CoverLetterData {
  greeting: string;
  opening: string;
  body?: string;
  closing: string;
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

export default function CoverLetters() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("professional");
  const [title, setTitle] = useState("");

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const [clRes, rRes] = await Promise.all([
      supabase.from("cover_letters").select("*").order("updated_at", { ascending: false }),
      supabase.from("resumes").select("id, title")
    ]);
    if (clRes.data) setCoverLetters(clRes.data as unknown as CoverLetter[]);
    if (rRes.data) setResumes(rRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const generate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await invokeFunction("generate-cover-letter", {
        resumeId: selectedResumeId, jobDescription, tone,
      });
      if (error) throw error;
      const { data: saved, error: saveError } = await supabase.from("cover_letters").insert({
        user_id: user?.id,
        title: title || `Narrative for ${tone}`,
        resume_id: selectedResumeId,
        job_description: jobDescription,
        tone,
        cover_letter_data: data.coverLetterData,
      }).select().single();
      if (saveError) throw saveError;
      toast({ title: "Narrative Synthesized" });
      setCreateOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: "Synthesis failed", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const deleteLetter = async (id: string) => {
    await supabase.from("cover_letters").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 md:p-10 space-y-16 font-sans">
      <SEOHead title="Narratives — ResumePro" description="Synthesize high-fidelity professional narratives." />
      
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-12">
        <div className="space-y-4">
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                 <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Narrative Architecture Protocol</span>
           </motion.div>
           <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
              Professional <br /> <span className="text-blue-600">Narratives.</span>
           </h1>
           <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
              Synthesize high-fidelity cover letters that bridge the gap between your professional architecture and organizational requirements.
           </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
           <DialogTrigger asChild>
              <Button className="h-20 px-12 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-[2rem] shadow-2xl shadow-blue-600/30 gap-4 hover:scale-105 transition-all">
                 <Plus className="w-6 h-6" /> Initialize New Narrative
              </Button>
           </DialogTrigger>
           <DialogContent className="max-w-2xl rounded-[3rem] border-none p-10 bg-white dark:bg-slate-900">
              <DialogHeader>
                 <DialogTitle className="text-3xl font-black tracking-tight">Narrative Synthesis</DialogTitle>
              </DialogHeader>
              <div className="space-y-8 py-6">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Architecture Source</Label>
                    <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                       <SelectTrigger className="h-16 rounded-2xl bg-white border-slate-100 font-bold px-6">
                          <SelectValue placeholder="Select Module" />
                       </SelectTrigger>
                       <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                          {resumes.map(r => <SelectItem key={r.id} value={r.id} className="rounded-xl p-3 font-bold">{r.title}</SelectItem>)}
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strategic Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                       <SelectTrigger className="h-16 rounded-2xl bg-white border-slate-100 font-bold px-6">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                          <SelectItem value="professional" className="rounded-xl p-3 font-bold">Executive Professional</SelectItem>
                          <SelectItem value="creative" className="rounded-xl p-3 font-bold">Creative Visionary</SelectItem>
                          <SelectItem value="bold" className="rounded-xl p-3 font-bold">Impact Driven</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Organizational Context</Label>
                    <Textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste job description..." className="min-h-[200px] rounded-2xl bg-white border-slate-100 font-bold p-6" />
                 </div>
                 <Button onClick={generate} disabled={generating || !selectedResumeId} className="w-full h-16 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-blue-600/30 gap-4">
                    {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    Synthesize Narrative
                 </Button>
              </div>
           </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
         <AnimatePresence>
            {coverLetters.map((cl, i) => (
               <motion.div key={cl.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.1 }}>
                  <Card className="rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-10 group hover:shadow-2xl transition-all relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => setEditingId(cl.id)} className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm border border-slate-100 dark:border-slate-700">
                           <Edit className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteLetter(cl.id)} className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white shadow-sm border border-rose-100">
                           <Trash2 className="w-5 h-5" />
                        </Button>
                     </div>
                     <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform">
                        <Mail className="w-8 h-8" />
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{cl.title}</h3>
                     <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-6">{new Date(cl.updated_at).toLocaleDateString()}</p>
                     
                     <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tone Module:</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{cl.tone}</span>
                     </div>
                  </Card>
               </motion.div>
            ))}
         </AnimatePresence>
      </div>

      {editingId && (
         <CoverLetterEditor id={editingId} onClose={() => { setEditingId(null); fetchData(); }} />
      )}
    </div>
  );
}
