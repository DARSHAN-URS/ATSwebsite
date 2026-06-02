import { useState } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

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
  const queryClient = useQueryClient();
  
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("professional");
  const [title, setTitle] = useState("");

  const { data: coverLetters = [], isLoading: lettersLoading } = useQuery({
    queryKey: ["cover-letters", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("cover_letters").select("*").eq("user_id", user?.id).order("updated_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as CoverLetter[];
    },
    enabled: !!user?.id,
  });

  const { data: resumes = [] } = useQuery({
    queryKey: ["resumes-list", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("resumes").select("id, title").eq("user_id", user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data: existing } = await supabase.from("cover_letters")
        .select("*")
        .eq("user_id", user?.id)
        .eq("resume_id", selectedResumeId)
        .eq("job_description", jobDescription)
        .eq("tone", tone)
        .maybeSingle();

      if (existing) {
        return { ...existing, _cached: true };
      }

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
      return saved;
    },
    onSuccess: (data: any) => {
      if (data._cached) {
         toast({ title: "Narrative Restored", description: "Loaded identical cover letter from history." });
      } else {
         toast({ title: "Narrative Synthesized" });
      }
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["cover-letters", user?.id] });
    },
    onError: () => {
      toast({ title: "Synthesis failed", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cover_letters").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["cover-letters", user?.id] });
      const previousLetters = queryClient.getQueryData<CoverLetter[]>(["cover-letters", user?.id]);
      
      queryClient.setQueryData<CoverLetter[]>(["cover-letters", user?.id], (old = []) => 
        old.filter(cl => cl.id !== id)
      );
      return { previousLetters };
    },
    onError: (err, id, context) => {
      if (context?.previousLetters) {
        queryClient.setQueryData(["cover-letters", user?.id], context.previousLetters);
      }
      toast({ title: "Delete failed", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cover-letters", user?.id] });
    }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-left pb-20 font-sans px-4 sm:px-6 md:px-8">
      <SEOHead title="Cover Letters - ResumePro" description="Synthesize high-fidelity professional narratives." />
      
      {/* 1. SaaS Hero Section */}
      <div className="relative bg-white rounded-3xl p-8 md:p-10 overflow-hidden border border-slate-200 shadow-sm">
         <div className="absolute top-0 right-0 w-full lg:w-[400px] h-auto lg:h-[400px] bg-blue-600/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100 text-blue-600">
                   <FileText className="w-3.5 h-3.5" />
                   <span className="text-[10px] font-bold uppercase tracking-wider">Narrative Architecture</span>
                </div>
                <div className="space-y-1">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none uppercase">
                     Cover Letters.
                  </h1>
                  <p className="text-slate-500 font-medium text-sm max-w-xl">Synthesize high-fidelity cover letters that bridge the gap between your professional architecture and organizational requirements.</p>
                </div>
             </div>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
               <DialogTrigger asChild>
                  <Button className="h-12 rounded-xl bg-blue-600 text-white font-bold uppercase tracking-wider text-[10px] shadow-lg shadow-blue-600/20 gap-2 hover:bg-blue-700">
                     <Plus className="w-3.5 h-3.5" /> Initialize Build
                  </Button>
               </DialogTrigger>
               <DialogContent className="max-w-2xl rounded-3xl border border-slate-200 p-8 bg-white">
                  <DialogHeader>
                     <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">Narrative Synthesis</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 mt-2">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Architecture Source</Label>
                        <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 font-bold text-sm text-slate-900 dark:text-slate-100">
                               <SelectValue placeholder="Select Module" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl p-1 bg-white dark:bg-slate-900">
                               {resumes.map(r => <SelectItem key={r.id} value={r.id} className="rounded-lg p-2.5 font-bold text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">{r.title}</SelectItem>)}
                            </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Strategic Tone</Label>
                        <Select value={tone} onValueChange={setTone}>
                            <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 font-bold text-sm text-slate-900 dark:text-slate-100">
                               <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl p-1 bg-white dark:bg-slate-900">
                               <SelectItem value="professional" className="rounded-lg p-2.5 font-bold text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">Executive Professional</SelectItem>
                               <SelectItem value="creative" className="rounded-lg p-2.5 font-bold text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">Creative Visionary</SelectItem>
                               <SelectItem value="bold" className="rounded-lg p-2.5 font-bold text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">Impact Driven</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Organizational Context</Label>
                        <Textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste job description..." className="min-h-[160px] resize-none rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 font-bold text-sm text-slate-900 focus-visible:ring-blue-500" />
                     </div>
                     <div className="flex gap-3 pt-2">
                        <Button variant="outline" onClick={() => setCreateOpen(false)} className="h-12 flex-1 rounded-xl font-bold uppercase tracking-wider text-[10px] border-slate-200 text-slate-600 hover:bg-slate-50">
                           Back
                        </Button>
                        <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending || !selectedResumeId} className="h-12 flex-[2] bg-blue-600 text-white font-bold uppercase tracking-wider text-[10px] rounded-xl shadow-lg shadow-blue-600/20 gap-2 hover:bg-blue-700">
                           {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                           Synthesize Narrative
                        </Button>
                     </div>
                  </div>
               </DialogContent>
            </Dialog>
         </div>
      </div>

      <div className="space-y-16">

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
         {lettersLoading ? (
            [1,2,3].map(i => (
               <Card key={i} className="rounded-[3rem] border-none bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-10 relative overflow-hidden h-auto lg:h-[280px] flex flex-col justify-end">
                  <Skeleton className="absolute top-8 right-8 w-12 h-12 rounded-xl" />
                  <Skeleton className="absolute top-8 right-24 w-12 h-12 rounded-xl" />
                  <Skeleton className="w-16 h-16 rounded-2xl mb-8" />
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/4 mb-6" />
                  <Skeleton className="h-3 w-1/2" />
               </Card>
            ))
         ) : (
            <AnimatePresence>
               {coverLetters.map((cl, i) => (
                  <motion.div key={cl.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.1 }}>
                     <Card className="rounded-[3rem] border-none bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-10 group hover:shadow-2xl transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <Button variant="ghost" size="icon" onClick={() => setEditingId(cl.id)} className="w-12 h-12 rounded-xl bg-white text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm border border-slate-100">
                                  <Edit className="w-5 h-5" />
                               </Button>
                             </TooltipTrigger>
                             <TooltipContent className="bg-blue-600 text-white font-bold text-xs rounded-xl border-none">
                               Edit Narrative
                             </TooltipContent>
                           </Tooltip>
                           
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(cl.id)} className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white shadow-sm border border-rose-100">
                                  <Trash2 className="w-5 h-5" />
                               </Button>
                             </TooltipTrigger>
                             <TooltipContent className="bg-rose-600 text-white font-bold text-xs rounded-xl border-none">
                               Delete Narrative
                             </TooltipContent>
                           </Tooltip>
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform">
                           <Mail className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight line-clamp-1">{cl.title}</h3>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-6">{new Date(cl.updated_at).toLocaleDateString()}</p>
                        
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tone Module:</span>
                           <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{cl.tone}</span>
                        </div>
                     </Card>
                  </motion.div>
               ))}
            </AnimatePresence>
         )}
      </div>

      {editingId && (
         <CoverLetterEditor id={editingId} onClose={() => { setEditingId(null); queryClient.invalidateQueries({ queryKey: ["cover-letters", user?.id] }); }} />
      )}
    </div>
  </div>
);
}
