import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, FileText, Trash2, Edit, MoreVertical, Sparkles, 
  Share2, Check, ExternalLink, Loader2, Search, Zap, Mail, ShieldCheck
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
      toast({ title: "Module Error", description: "Failed to initialize architecture.", variant: "destructive" });
    } else {
      navigate(`/builder/${data.id}`);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("resumes").delete().eq("id", id);
    if (error) toast({ title: "Deletion Failed", variant: "destructive" });
    else setResumes(resumes.filter(r => r.id !== id));
  };

  const copyShareLink = (id: string) => {
    const url = `${window.location.origin}/profile/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: "Identity Vector Copied" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans pb-20">
      <SEOHead title="Architectural Repository — ResumePro" description="Manage your high-fidelity resume modules and professional architectures." />
      
      <div className="container mx-auto px-8 pt-16 space-y-16">
         {/* Header Section */}
         <div className="flex flex-col md:flex-row items-end justify-between gap-12">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-600">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Repository Protocol</span>
               </div>
               <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  Identity <br /> <span className="text-blue-600">Matrices.</span>
               </h1>
            </div>

            <Button onClick={() => setCreateOpen(true)} className="h-20 px-10 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-[2rem] shadow-2xl shadow-blue-600/30 gap-4 hover:scale-105 transition-all">
               <Plus className="w-5 h-5" /> Initialize Architecture
            </Button>
         </div>

         {/* Search & Filter Proto */}
         <div className="relative group max-w-xl">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <Input placeholder="Filter identity modules..." className="h-16 rounded-[2rem] bg-white dark:bg-slate-900 border-none px-16 font-bold shadow-sm focus:ring-blue-600/10 transition-all" />
         </div>

         {/* Content Grid */}
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
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Repository Empty</h3>
                  <p className="text-slate-500 font-medium">No architecture modules detected in your current workspace.</p>
               </div>
               <Button onClick={() => setCreateOpen(true)} variant="link" className="text-blue-600 font-black uppercase tracking-widest text-xs">Deploy First Module</Button>
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
                           transition={{ delay: i * 0.1 }}
                           className="group relative h-full"
                        >
                           <Card className="h-full rounded-[4rem] border-none bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all p-10 flex flex-col justify-between space-y-12">
                              <div className="space-y-8">
                                 <div className="flex items-center justify-between">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shadow-xl shadow-blue-600/10">
                                       <FileText className="w-8 h-8" />
                                    </div>
                                    <DropdownMenu>
                                       <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800"><MoreVertical className="w-5 h-5" /></Button>
                                       </DropdownMenuTrigger>
                                       <DropdownMenuContent className="rounded-2xl p-2 border-none shadow-2xl">
                                          <DropdownMenuItem onClick={() => navigate(`/builder/${resume.id}`)} className="rounded-xl font-bold gap-3"><Edit className="w-4 h-4" /> Modify Architecture</DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => { setShareId(resume.id); setShareOpen(true); }} className="rounded-xl font-bold gap-3"><Share2 className="w-4 h-4" /> Share Identity</DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleDelete(resume.id)} className="rounded-xl font-bold gap-3 text-red-500"><Trash2 className="w-4 h-4" /> Purge Module</DropdownMenuItem>
                                       </DropdownMenuContent>
                                    </DropdownMenu>
                                 </div>

                                 <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter line-clamp-1">{resume.title}</h3>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Last Synced: {new Date(resume.updated_at).toLocaleDateString()}</p>
                                 </div>
                              </div>

                              <div className="space-y-8">
                                 <div className="space-y-4">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                       <span className="text-slate-400">Completion Score</span>
                                       <span className="text-blue-600">{score}%</span>
                                    </div>
                                    <Progress value={score} className="h-2 rounded-full bg-slate-100 dark:bg-slate-800" />
                                 </div>

                                 <div className="flex items-center gap-4">
                                    <Button asChild className="flex-1 h-16 rounded-[1.5rem] bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] gap-3">
                                       <Link to={`/builder/${resume.id}`}><Edit className="w-4 h-4" /> Open Builder</Link>
                                    </Button>
                                    <Button onClick={() => { setShareId(resume.id); setShareOpen(true); }} variant="outline" className="h-16 w-16 rounded-[1.5rem] border-slate-100 dark:border-slate-800"><Share2 className="w-5 h-5" /></Button>
                                 </div>
                              </div>
                           </Card>
                        </motion.div>
                     );
                  })}
               </AnimatePresence>
            </div>
         )}
      </div>

      {/* Create Architecture Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
         <DialogContent className="rounded-[4rem] border-none p-16 max-w-xl">
            <DialogHeader className="space-y-6">
               <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-600/30">
                  <Sparkles className="w-8 h-8" />
               </div>
               <div className="space-y-2">
                  <DialogTitle className="text-4xl font-black tracking-tight">New Architecture</DialogTitle>
                  <DialogDescription className="text-lg font-medium text-slate-500">Initialize a high-fidelity professional identity module.</DialogDescription>
               </div>
            </DialogHeader>
            <div className="py-10 space-y-8">
               <Input 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="Architectural Title (e.g. Senior Cloud Architect)" 
                  className="h-16 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border-none px-8 font-bold text-lg"
               />
               <Button onClick={handleCreate} disabled={!title.trim()} className="w-full h-20 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-[2rem] shadow-2xl shadow-blue-600/30 gap-4">
                  Deploy Module <Zap className="w-5 h-5" />
               </Button>
            </div>
         </DialogContent>
      </Dialog>

      {/* Share Identity Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
         <DialogContent className="rounded-[4rem] border-none p-16 max-w-xl text-center space-y-12">
            <div className="space-y-4">
               <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-[2rem] flex items-center justify-center text-blue-600 mx-auto shadow-xl">
                  <Share2 className="w-10 h-10" />
               </div>
               <h2 className="text-4xl font-black tracking-tight">Identity Vector</h2>
               <p className="text-lg font-medium text-slate-500">Dispatch your professional profile to the global recruiter network.</p>
            </div>
            
            <div className="space-y-6">
               <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <div className="flex-1 text-sm font-bold text-slate-500 truncate text-left px-4">{window.location.origin}/profile/{shareId}</div>
                  <Button onClick={() => copyShareLink(shareId)} className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] gap-2">
                     {copied ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />} {copied ? "Copied" : "Copy Link"}
                  </Button>
               </div>
               <Button variant="outline" onClick={() => window.open(`${window.location.origin}/profile/${shareId}`, '_blank')} className="w-full h-16 rounded-[1.5rem] border-slate-200 dark:border-slate-800 font-black uppercase tracking-widest text-[10px] gap-3">
                  <ExternalLink className="w-4 h-4" /> Launch Public Profile
               </Button>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
