import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, FileText, Trash2, Edit, MoreVertical, Sparkles, 
  Share2, Check, ExternalLink, Loader2, Search, Zap, Mail, ShieldCheck,
  ArrowRight, Copy
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import type { Tables } from "@/integrations/supabase/types";
import type { ResumeData } from "@/components/resume/types";
import SEOHead from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Resume = Tables<"resumes">;

function computeResumeScore(rd: ResumeData): number {
  const pi = rd.personalInfo || {};
  const checks = [
    !!pi.fullName?.trim(),
    !!(pi.email?.trim() && pi.phone?.trim()),
    !!pi.location?.trim(),
    !!(rd.summary?.trim() && rd.summary.length > 50),
    (rd.skills || []).length >= 5,
    (rd.experience || []).length > 0,
    (rd.education || []).length > 0,
    !!(pi.linkedin?.trim() || pi.portfolio?.trim()),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default function Resumes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareId, setShareId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("resumes").select("*").order("updated_at", { ascending: false })
      .then(({ data }) => {
        setResumes(data || []);
        setLoading(false);
      });
  }, [user]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    const { data, error } = await supabase.from("resumes").insert({
      user_id: user?.id,
      title: title.trim(),
      resume_data: {
        personalInfo: { fullName: user?.user_metadata?.display_name || "" },
        education: [], experience: [], skills: [], languages: [], projects: [], certifications: [],
      } as any,
    }).select().single();

    if (error) {
      toast({ title: "Error", description: "Failed to create resume.", variant: "destructive" });
    } else {
      navigate(`/builder/${data.id}`);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("resumes").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", variant: "destructive" });
    else setResumes(resumes.filter(r => r.id !== id));
  };

  const copyShareLink = (id: string) => {
    const url = `${window.location.origin}/profile/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: "Link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans pb-20 text-left">
      <SEOHead title="My Resumes — ResumePro" description="Create and manage your professional resumes." />
      
      <div className="container mx-auto px-8 pt-16 space-y-16">
         <div className="flex flex-col md:flex-row items-end justify-between gap-12">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-600">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">My Resumes</span>
               </div>
               <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  Resumes.
               </h1>
            </div>

            <Button onClick={() => setCreateOpen(true)} className="h-20 px-10 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-[2rem] shadow-2xl shadow-blue-600/30 gap-4 hover:scale-105 transition-all">
               <Plus className="w-5 h-5" /> Create New
            </Button>
         </div>

         <div className="relative group max-w-xl">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <Input placeholder="Search resumes..." className="h-16 rounded-[2rem] bg-white dark:bg-slate-900 border-none px-16 font-bold shadow-sm focus:ring-blue-600/10 transition-all" />
         </div>

         {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {[1,2,3].map(i => (
                  <div key={i} className="h-[400px] rounded-[4rem] bg-slate-100 dark:bg-slate-900 animate-pulse" />
               ))}
            </div>
         ) : resumes.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-40 text-center space-y-8">
               <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto">
                  <FileText className="w-12 h-12" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">No resumes found</h3>
                  <p className="text-slate-500 font-medium">You haven't created any resumes yet.</p>
               </div>
               <Button onClick={() => setCreateOpen(true)} variant="link" className="text-blue-600 font-black uppercase tracking-widest text-xs">Create your first resume</Button>
            </motion.div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               <AnimatePresence>
                  {resumes.map((resume, i) => {
                     const data = resume.resume_data as any as ResumeData;
                     const score = computeResumeScore(data);
                     return (
                        <motion.div 
                           key={resume.id} 
                           initial={{ opacity: 0, y: 20 }} 
                           animate={{ opacity: 1, y: 0 }} 
                           transition={{ delay: i * 0.05 }}
                           className="group"
                        >
                           <Card className="rounded-[4rem] border-none bg-white dark:bg-slate-900 p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-2xl hover:-translate-y-2 transition-all relative overflow-hidden h-full flex flex-col justify-between">
                              <div className="space-y-8">
                                 <div className="flex items-start justify-between">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                       <FileText className="w-8 h-8" />
                                    </div>
                                    <DropdownMenu>
                                       <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="rounded-xl"><MoreVertical className="w-5 h-5 text-slate-400" /></Button>
                                       </DropdownMenuTrigger>
                                       <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 w-48">
                                          <DropdownMenuItem onClick={() => navigate(`/builder/${resume.id}`)} className="rounded-xl p-3 font-bold gap-3"><Edit className="w-4 h-4" /> Edit Resume</DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => { setShareId(resume.id); setShareOpen(true); }} className="rounded-xl p-3 font-bold gap-3"><Share2 className="w-4 h-4" /> Share Link</DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleDelete(resume.id)} className="rounded-xl p-3 font-bold gap-3 text-red-500 focus:bg-red-50"><Trash2 className="w-4 h-4" /> Delete Resume</DropdownMenuItem>
                                       </DropdownMenuContent>
                                    </DropdownMenu>
                                 </div>

                                 <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none group-hover:text-blue-600 transition-colors">{resume.title}</h3>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Last updated: {new Date(resume.updated_at).toLocaleDateString()}</p>
                                 </div>

                                 <div className="space-y-4 pt-8 border-t border-slate-50 dark:border-slate-800">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                       <span>Resume Score</span>
                                       <span className={cn(score > 70 ? "text-blue-600" : "text-amber-500")}>{score}%</span>
                                    </div>
                                    <Progress value={score} className="h-2 bg-slate-50 dark:bg-slate-800" />
                                 </div>
                              </div>

                              <div className="pt-10">
                                 <Button onClick={() => navigate(`/builder/${resume.id}`)} className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl hover:bg-blue-600 transition-all">
                                    Edit Resume <ArrowRight className="w-4 h-4" />
                                 </Button>
                              </div>
                           </Card>
                        </motion.div>
                     );
                  })}
               </AnimatePresence>
            </div>
         )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
         <DialogContent className="rounded-[3rem] p-12 border-none shadow-2xl max-w-lg">
            <div className="space-y-8">
               <div className="space-y-4">
                  <DialogTitle className="text-4xl font-black tracking-tighter">New Resume</DialogTitle>
                  <DialogDescription className="font-medium text-slate-500">Give your new resume a title to get started.</DialogDescription>
               </div>
               <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Resume Title</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Senior Software Engineer" className="h-16 rounded-2xl bg-slate-50 border-none px-6 font-bold text-lg" />
               </div>
               <Button onClick={handleCreate} disabled={!title.trim()} className="w-full h-20 rounded-[2rem] bg-blue-600 text-white font-black uppercase tracking-widest text-xs gap-4 shadow-2xl shadow-blue-600/20">
                  Create Resume <Sparkles className="w-5 h-5" />
               </Button>
            </div>
         </DialogContent>
      </Dialog>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
         <DialogContent className="rounded-[3rem] p-12 border-none shadow-2xl max-w-lg">
            <div className="space-y-8">
               <div className="space-y-4">
                  <DialogTitle className="text-4xl font-black tracking-tighter">Share Link</DialogTitle>
                  <DialogDescription className="font-medium text-slate-500">Copy this link to share your professional profile with others.</DialogDescription>
               </div>
               <div className="flex gap-4">
                  <Input readOnly value={`${window.location.origin}/profile/${shareId}`} className="h-16 rounded-2xl bg-slate-50 border-none px-6 font-medium text-slate-500" />
                  <Button onClick={() => copyShareLink(shareId)} className="h-16 w-16 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                     {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                  </Button>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Anyone with this link can view your profile.</p>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
