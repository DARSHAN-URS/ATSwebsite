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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger 
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
    <div className="min-h-screen bg-white font-sans pb-20 text-left">
    <div className="max-w-7xl mx-auto space-y-8 text-left pb-20">
      <SEOHead title="My Resumes — ResumePro" description="Create and manage your professional resumes." />
      
      <div className="relative bg-white rounded-3xl p-8 md:p-12 overflow-hidden border border-slate-200 shadow-sm">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-12 mb-16">
                <div className="space-y-8">
                   <div className="inline-flex items-center gap-3 px-5 py-2 bg-blue-600/5 rounded-full border border-blue-600/10 text-blue-600">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Asset Management</span>
                   </div>
                   <h1 className="text-7xl md:text-9xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase">
                      Resumes.
                   </h1>
                   <p className="text-slate-500 font-medium text-lg max-w-xl">Manage your professional document matrix and synchronize with global mission objectives.</p>
                </div>

               <Button onClick={() => setCreateOpen(true)} className="h-14 px-8 bg-blue-600 text-white font-bold uppercase tracking-wider text-[11px] rounded-2xl shadow-xl shadow-blue-600/20 gap-3 hover:scale-105 transition-all self-center md:self-auto">
                  <Plus className="w-4 h-4" /> Initialize Build
               </Button>
            </div>

            <div className="relative group max-w-2xl z-10">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
               <Input placeholder="Search document matrix..." className="h-14 rounded-2xl bg-slate-50 border border-slate-200 px-14 font-medium text-sm focus:bg-white shadow-sm focus:ring-4 focus:ring-blue-600/5 transition-all" />
            </div>
         </div>

         {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {[1,2,3].map(i => (
                  <div key={i} className="h-[450px] rounded-[4rem] bg-slate-50 animate-pulse border border-slate-100" />
               ))}
            </div>
         ) : resumes.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-48 text-center space-y-10">
               <div className="w-32 h-32 bg-slate-50 rounded-[3rem] border border-slate-100 flex items-center justify-center text-slate-300 mx-auto">
                  <FileText className="w-14 h-14" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">No active <br /> assets found.</h3>
                  <p className="text-lg text-slate-500 font-medium">Your document matrix is currently empty.</p>
               </div>
               <Button onClick={() => setCreateOpen(true)} variant="link" className="text-blue-600 font-black uppercase tracking-[0.2em] text-[11px]">Initialize First Build</Button>
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
                         <Card className="rounded-[4rem] border-none bg-slate-50/30 p-12 shadow-sm border border-slate-100 hover:border-blue-600/20 hover:bg-blue-50/10 hover:shadow-3xl hover:-translate-y-4 transition-all duration-700 relative overflow-hidden h-full flex flex-col justify-between group">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2" />
                              <div className="space-y-10 relative z-10">
                                 <div className="flex items-start justify-between">
                                    <div className="w-20 h-20 rounded-[2rem] bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-sm">
                                       <FileText className="w-10 h-10" />
                                    </div>
                                    <DropdownMenu>
                                       <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl hover:bg-slate-50"><MoreVertical className="w-6 h-6 text-slate-400" /></Button>
                                       </DropdownMenuTrigger>
                                       <DropdownMenuContent align="end" className="rounded-[2rem] border-none shadow-3xl p-3 w-56 bg-white">
                                          <DropdownMenuItem onClick={() => navigate(`/builder/${resume.id}`)} className="rounded-xl p-4 font-black uppercase tracking-widest text-[9px] gap-3 focus:bg-blue-50 focus:text-blue-600 cursor-pointer"><Edit className="w-4 h-4" /> Edit Build</DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => { setShareId(resume.id); setShareOpen(true); }} className="rounded-xl p-4 font-black uppercase tracking-widest text-[9px] gap-3 focus:bg-blue-50 focus:text-blue-600 cursor-pointer"><Share2 className="w-4 h-4" /> Share Link</DropdownMenuItem>
                                          <DropdownMenuSeparator className="my-2 bg-slate-100" />
                                          <DropdownMenuItem onClick={() => handleDelete(resume.id)} className="rounded-xl p-4 font-black uppercase tracking-widest text-[9px] gap-3 text-red-500 focus:bg-red-50 cursor-pointer"><Trash2 className="w-4 h-4" /> Deconstruct</DropdownMenuItem>
                                       </DropdownMenuContent>
                                    </DropdownMenu>
                                 </div>

                                 <div className="space-y-3">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-[1.1] group-hover:text-blue-600 transition-colors uppercase">{resume.title}</h3>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Last Sync: {new Date(resume.updated_at).toLocaleDateString()}</p>
                                 </div>

                                 <div className="space-y-6 pt-10 border-t border-slate-50">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                       <span>Quality Index</span>
                                       <span className={cn(score > 70 ? "text-blue-600" : "text-amber-500")}>{score}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                       <motion.div 
                                         initial={{ width: 0 }}
                                         animate={{ width: `${score}%` }}
                                         transition={{ duration: 1.5, ease: "circOut" }}
                                         className={cn("h-full rounded-full", score > 70 ? "bg-blue-600" : "bg-amber-500")}
                                       />
                                    </div>
                                 </div>
                              </div>

                               <div className="pt-12 relative z-10">
                                  <Button onClick={() => navigate(`/builder/${resume.id}`)} className="w-full h-16 rounded-[1.8rem] bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[10px] gap-4 shadow-xl shadow-blue-600/20 hover:scale-[1.02] transition-all">
                                     Access Editor <ArrowRight className="w-4 h-4" />
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
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Senior Software Engineer" className="h-16 rounded-2xl bg-white border-none px-6 font-bold text-lg" />
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
                  <Input readOnly value={`${window.location.origin}/profile/${shareId}`} className="h-16 rounded-2xl bg-white border-none px-6 font-medium text-slate-500" />
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
