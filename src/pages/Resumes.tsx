import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, FileText, Trash2, Edit, Download, MoreVertical, Sparkles, Layout, 
  Share2, Copy, Check, ExternalLink, Upload, Linkedin, Loader2, X, Search, Zap
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import type { Tables } from "@/integrations/supabase/types";
import type { ResumeData } from "@/components/resume/types";
import SEOHead from "@/components/SEOHead";
import CoverLetters from "@/components/CoverLetters";
import { useSearchParams } from "react-router-dom";

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
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const fetchResumes = async () => {
    if (!user) return;
    const { data } = await supabase.from("resumes").select("*").order("updated_at", { ascending: false });
    setResumes(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchResumes(); }, [user]);

  const handleCreate = async () => {
    if (!user || !title.trim()) return;
    const { data, error } = await supabase.from("resumes").insert({
      user_id: user.id,
      title: title.trim(),
      resume_data: {} as any,
    }).select().single();

    if (error) {
      toast({ title: t.common.error, description: error.message, variant: "destructive" });
    } else {
      navigate(`/builder/${data.id}`);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("resumes").delete().eq("id", id);
    if (error) {
      toast({ title: t.common.error, description: error.message, variant: "destructive" });
    } else {
      setResumes((prev) => prev.filter((r) => r.id !== id));
      toast({ title: t.resumes.deleteSuccess });
    }
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/p/${shareId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied to clipboard!" });
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingPdf(true);
    // Simulation of PDF parsing
    setTimeout(async () => {
       const { data, error } = await supabase.from("resumes").insert({
         user_id: user.id,
         title: file.name.replace(".pdf", ""),
         resume_data: { personalInfo: { fullName: user.user_metadata?.display_name } } as any,
       }).select().single();
       setUploadingPdf(false);
       if (data) navigate(`/builder/${data.id}`);
    }, 1500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 min-h-screen">
      <SEOHead title="Resumes — ResumePro" description="Manage and share your professional identity." />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Professional <span className="text-primary italic">Library.</span></h1>
           <p className="text-slate-500 font-medium mt-2">Design, track, and share your career-defining documents.</p>
        </div>
        <div className="flex gap-4">
           <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
           <Button variant="outline" onClick={() => pdfInputRef.current?.click()} className="h-14 px-8 rounded-2xl border-slate-200 font-bold bg-white shadow-sm hover:bg-slate-50 transition-all">
              {uploadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-3" />}
              Import PDF
           </Button>
           <Button onClick={() => setCreateOpen(true)} className="h-14 px-10 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all">
              <Plus className="w-5 h-5 mr-3" /> New Resume
           </Button>
        </div>
      </div>

      <Tabs value={searchParams.get("tab") || "resumes"} onValueChange={(v) => setSearchParams(v === "resumes" ? {} : { tab: v })} className="space-y-10">
         <TabsList className="p-1.5 bg-slate-100 rounded-[1.5rem] w-fit border border-slate-200">
            <TabsTrigger value="resumes" className="px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
               <FileText className="w-4 h-4 mr-2" /> Resumes
            </TabsTrigger>
            <TabsTrigger value="cover-letters" className="px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
               <Mail className="w-4 h-4 mr-2" /> Cover Letters
            </TabsTrigger>
         </TabsList>

         <TabsContent value="resumes" className="mt-0 outline-none">
            {loading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map(i => <div key={i} className="h-[400px] rounded-[3rem] bg-slate-50 animate-pulse" />)}
               </div>
            ) : resumes.length === 0 ? (
               <Card className="rounded-[3rem] border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center py-32 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-8">
                     <FileText className="w-10 h-10 text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Your library is empty</h3>
                  <p className="text-slate-400 font-medium max-w-sm mt-2 mb-10">Start by building your first high-impact resume with our AI architect.</p>
                  <Button onClick={() => setCreateOpen(true)} className="bg-primary text-white font-black uppercase tracking-widest text-[10px] h-14 px-10 rounded-2xl">Create First Resume</Button>
               </Card>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <AnimatePresence>
                     {resumes.map((resume, i) => {
                        const data = resume.resume_data as unknown as ResumeData;
                        const score = computeResumeScore(data);
                        return (
                           <motion.div
                              key={resume.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                           >
                              <Card className="group relative rounded-[2.5rem] border-slate-100 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
                                 <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden flex items-center justify-center p-8 group-hover:p-6 transition-all duration-500">
                                    <div className="w-full h-full bg-white shadow-2xl rounded-sm border border-slate-100 overflow-hidden transform rotate-2 group-hover:rotate-0 transition-transform duration-500 origin-bottom-right p-4 space-y-3">
                                       <div className="h-1 w-1/3 bg-slate-100 rounded" />
                                       <div className="space-y-1">
                                          <div className="h-1 w-full bg-slate-50 rounded" />
                                          <div className="h-1 w-full bg-slate-50 rounded" />
                                       </div>
                                       <div className="pt-4 h-1/2 w-full bg-slate-50/50 rounded flex items-center justify-center">
                                          <FileText className="w-8 h-8 text-slate-100" />
                                       </div>
                                    </div>
                                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/60 transition-all duration-500 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                                       <Button onClick={() => navigate(`/builder/${resume.id}`)} className="bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl hover:bg-primary hover:text-white transition-all">Edit Draft</Button>
                                       <div className="flex gap-2">
                                          <Button variant="ghost" className="w-10 h-10 p-0 rounded-lg bg-white/10 hover:bg-white/20 text-white">
                                             <Download className="w-4 h-4" />
                                          </Button>
                                          <Button onClick={() => { setShareId(resume.id); setShareOpen(true); }} variant="ghost" className="w-10 h-10 p-0 rounded-lg bg-white/10 hover:bg-white/20 text-white">
                                             <Share2 className="w-4 h-4" />
                                          </Button>
                                       </div>
                                    </div>
                                 </div>
                                 <CardContent className="p-8 space-y-6">
                                    <div className="flex items-start justify-between">
                                       <div>
                                          <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">{resume.title}</h3>
                                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Updated {new Date(resume.updated_at).toLocaleDateString()}</p>
                                       </div>
                                       <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreVertical className="w-4 h-4" /></Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-xl p-2 min-w-[180px]">
                                             <DropdownMenuItem onClick={() => navigate(`/builder/${resume.id}`)} className="rounded-xl font-bold text-xs uppercase tracking-widest p-3 gap-3">
                                                <Edit className="w-4 h-4" /> Edit Details
                                             </DropdownMenuItem>
                                             <DropdownMenuItem onClick={() => { setShareId(resume.id); setShareOpen(true); }} className="rounded-xl font-bold text-xs uppercase tracking-widest p-3 gap-3 text-primary focus:text-primary focus:bg-primary/5">
                                                <Share2 className="w-4 h-4" /> Share Profile
                                             </DropdownMenuItem>
                                             <DropdownMenuItem onClick={() => handleDelete(resume.id)} className="rounded-xl font-bold text-xs uppercase tracking-widest p-3 gap-3 text-red-500 focus:text-red-500 focus:bg-red-50">
                                                <Trash2 className="w-4 h-4" /> Delete Permanently
                                             </DropdownMenuItem>
                                          </DropdownMenuContent>
                                       </DropdownMenu>
                                    </div>

                                    <div className="space-y-3">
                                       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                          <span className="text-slate-400">ATS Strength</span>
                                          <span className={score >= 80 ? "text-green-500" : score >= 50 ? "text-amber-500" : "text-red-500"}>{score}%</span>
                                       </div>
                                       <div className="h-1.5 rounded-full bg-slate-50 overflow-hidden">
                                          <motion.div 
                                             initial={{ width: 0 }}
                                             animate={{ width: `${score}%` }}
                                             className={`h-full rounded-full ${score >= 80 ? "bg-green-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"}`} 
                                          />
                                       </div>
                                    </div>
                                 </CardContent>
                              </Card>
                           </motion.div>
                        );
                     })}
                  </AnimatePresence>
               </div>
            )}
         </TabsContent>

         <TabsContent value="cover-letters" className="mt-0 outline-none">
            <CoverLetters />
         </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-md">
           <div className="bg-slate-900 p-10 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                 <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-primary/20">
                    <Plus className="h-6 w-6" />
                 </div>
                 <DialogTitle className="text-3xl font-black tracking-tight">New Project</DialogTitle>
                 <p className="text-slate-400 font-medium mt-2">Initialize your professional drafting engine.</p>
              </div>
           </div>
           <div className="p-10 space-y-8 bg-white">
              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resume Identity</Label>
                 <Input 
                   placeholder="e.g. Senior Cloud Architect" 
                   value={title} 
                   onChange={(e) => setTitle(e.target.value)}
                   className="h-14 rounded-xl border-slate-100 focus-visible:ring-primary text-lg font-bold"
                 />
              </div>
              <Button 
                onClick={handleCreate} 
                disabled={!title.trim()} 
                className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/10 hover:scale-[1.02] transition-all"
              >
                 Initialize Architect
              </Button>
           </div>
        </DialogContent>
      </Dialog>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-md">
           <div className="bg-slate-900 p-10 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 text-center flex flex-col items-center">
                 <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
                    <Share2 className="h-8 w-8 text-white" />
                 </div>
                 <DialogTitle className="text-3xl font-black tracking-tight">Share Identity</DialogTitle>
                 <p className="text-slate-400 font-medium mt-2">Generate a public link to your professional profile.</p>
              </div>
           </div>
           <div className="p-10 space-y-8 bg-white">
              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Public Profile URL</Label>
                 <div className="flex gap-2">
                    <div className="flex-1 h-14 rounded-2xl bg-slate-50 border border-slate-100 px-6 flex items-center text-xs font-bold text-slate-500 overflow-hidden truncate">
                       {window.location.origin}/p/{shareId}
                    </div>
                    <Button onClick={copyToClipboard} className="h-14 w-14 rounded-2xl bg-slate-900 text-white shrink-0">
                       {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                    </Button>
                 </div>
              </div>
              <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-center gap-6">
                 <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0"><Sparkles className="w-6 h-6" /></div>
                 <p className="text-xs font-bold text-slate-600 leading-relaxed">
                    This link showcases your skills, experience, and contact info in a high-performance visual portfolio.
                 </p>
              </div>
              <Button asChild className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">
                 <Link to={`/p/${shareId}`} target="_blank" className="flex items-center justify-center gap-3">
                    <ExternalLink className="w-5 h-5" /> Preview Live Site
                 </Link>
              </Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
