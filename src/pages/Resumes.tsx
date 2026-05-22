import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, FileText, Trash2, Edit, MoreVertical, Sparkles, 
  Share2, Check, ExternalLink, Loader2, Search, Zap, Mail, ShieldCheck,
  ArrowRight, Copy, TrendingUp, Star, Clock, Filter, BarChart3,
  ChevronRight, Download, Eye, Layers
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
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";
import type { ResumeData } from "@/components/resume/types";
import SEOHead from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
  const [appsCount, setAppsCount] = useState(0);
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
    supabase.from("job_applications").select("*", { count: 'exact', head: true }).eq("user_id", user.id)
      .then(({ count }) => {
        setAppsCount(count || 0);
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
    <div className="max-w-7xl mx-auto space-y-8 text-left pb-20 font-sans">
      <SEOHead title="My Resumes - ResumePro" description="Create and manage your professional resumes." />
      
      {/* 1. SaaS Hero Section */}
      <div className="relative bg-white rounded-3xl p-8 md:p-10 overflow-hidden border border-slate-200 shadow-sm">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100 text-blue-600">
                   <ShieldCheck className="w-3.5 h-3.5" />
                   <span className="text-[10px] font-bold uppercase tracking-wider">Asset Management</span>
                </div>
                <div className="space-y-1">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none uppercase">
                     Resumes.
                  </h1>
                  <p className="text-slate-500 font-medium text-sm max-w-xl">Manage your professional document matrix and synchronize with global mission objectives.</p>
                </div>
             </div>

            <div className="flex items-center gap-3">
               <Button onClick={() => toast({ title: "Export Started", description: "Your assets are being bundled for export." })} variant="outline" className="h-12 rounded-xl border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px] gap-2 hover:bg-slate-50">
                  <Download className="w-3.5 h-3.5" /> Export All
               </Button>
              <Button onClick={() => setCreateOpen(true)} className="h-12 px-6 bg-blue-600 text-white font-bold uppercase tracking-wider text-[10px] rounded-xl shadow-lg shadow-blue-600/20 gap-2 hover:scale-105 transition-all">
                 <Plus className="w-3.5 h-3.5" /> New Resume
              </Button>
            </div>
         </div>
      </div>

      {/* 2. Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: "Total Assets", value: resumes.length, sub: "Resumes in cloud", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
           { label: "Avg. ATS Score", value: resumes.length > 0 ? `${Math.round(resumes.reduce((acc, r) => acc + computeResumeScore(r.resume_data as any), 0) / resumes.length)}%` : "0%", sub: "Across all builds", icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50" },
           { label: "Active Deployments", value: appsCount, sub: "Live applications", icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50" },
           { label: "Asset Quality", value: "High", sub: "Optimization level", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
         ].map((stat, i) => (
            <Card key={i} onClick={() => {
               if (stat.label === "Total Assets") navigate("/resumes");
               if (stat.label === "Avg. ATS Score") navigate("/resumes");
               if (stat.label === "Active Deployments") navigate("/job-tracker");
               if (stat.label === "Asset Quality") navigate("/resumes");
            }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm cursor-pointer hover:border-blue-600/20 transition-all">
              <div className="flex items-center gap-4">
                 <div className={cn("p-2.5 rounded-xl", stat.bg, stat.color)}>
                    <stat.icon className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-lg font-bold text-slate-900 leading-none mb-1">{stat.value}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                 </div>
              </div>
           </Card>
         ))}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4">
         <div className="relative group flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <Input 
              placeholder="Search document matrix..." 
              className="h-12 rounded-xl bg-white border border-slate-200 pl-11 pr-16 font-medium text-sm focus:ring-4 focus:ring-blue-600/5 transition-all w-full" 
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[9px] font-bold text-slate-400 uppercase">
               <span>⌘</span>
               <span>K</span>
            </div>
         </div>
         <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" className="h-12 px-4 rounded-xl border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 gap-2 hover:bg-white transition-all flex-1 md:flex-none">
               <Filter className="w-3.5 h-3.5" /> Filter
            </Button>
            <Button variant="outline" className="h-12 px-4 rounded-xl border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 gap-2 hover:bg-white transition-all flex-1 md:flex-none">
               <Clock className="w-3.5 h-3.5" /> Recent
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Main Content Grid */}
         <div className="lg:col-span-8 space-y-8">
            {loading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1,2,3,4].map(i => (
                     <div key={i} className="h-64 rounded-3xl bg-white animate-pulse border border-slate-200" />
                  ))}
               </div>
            ) : resumes.length === 0 ? (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center space-y-6 bg-white rounded-3xl border border-slate-200 border-dashed">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 mx-auto">
                     <FileText className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-xl font-bold text-slate-900 tracking-tight">No active assets found</h3>
                     <p className="text-sm text-slate-500 font-medium">Your document matrix is currently empty.</p>
                  </div>
                  <Button onClick={() => setCreateOpen(true)} className="bg-slate-900 text-white rounded-xl h-10 px-6 text-[11px] font-bold uppercase tracking-widest">Initialize First Build</Button>
               </motion.div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatePresence>
                     {resumes.map((resume, i) => {
                        const data = resume.resume_data as any as ResumeData;
                        const score = computeResumeScore(data);
                        return (
                           <motion.div 
                              key={resume.id} 
                              initial={{ opacity: 0, y: 10 }} 
                              animate={{ opacity: 1, y: 0 }} 
                              transition={{ delay: i * 0.05 }}
                           >
                            <Card className="rounded-3xl border border-slate-200 bg-white p-6 hover:border-blue-600/30 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden h-full flex flex-col justify-between">
                                 <div className="space-y-6 relative z-10">
                                    <div className="flex items-start justify-between">
                                       <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                             <FileText className="w-5 h-5" />
                                          </div>
                                          <div>
                                             <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors truncate max-w-[150px]">{resume.title}</h3>
                                             <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[8px] px-1.5 h-4 font-bold uppercase tracking-widest">Optimized</Badge>
                                                <span className="text-[9px] text-slate-400 font-medium">v1.2</span>
                                             </div>
                                          </div>
                                       </div>
                                       <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                             <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg hover:bg-slate-50"><MoreVertical className="w-4 h-4 text-slate-400" /></Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="rounded-xl border border-slate-100 shadow-xl p-1.5 w-48 bg-white">
                                             <DropdownMenuItem onClick={() => navigate(`/builder/${resume.id}`)} className="rounded-lg p-2 text-[10px] font-bold uppercase tracking-widest gap-3 focus:bg-blue-50 focus:text-blue-600 cursor-pointer"><Edit className="w-3.5 h-3.5" /> Edit Build</DropdownMenuItem>
                                             <DropdownMenuItem onClick={() => { setShareId(resume.id); setShareOpen(true); }} className="rounded-lg p-2 text-[10px] font-bold uppercase tracking-widest gap-3 focus:bg-blue-50 focus:text-blue-600 cursor-pointer"><Share2 className="w-3.5 h-3.5" /> Share Link</DropdownMenuItem>
                                             <DropdownMenuSeparator className="my-1.5 bg-slate-100" />
                                             <DropdownMenuItem onClick={() => handleDelete(resume.id)} className="rounded-lg p-2 text-[10px] font-bold uppercase tracking-widest gap-3 text-red-500 focus:bg-red-50 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Delete Asset</DropdownMenuItem>
                                          </DropdownMenuContent>
                                       </DropdownMenu>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                                       <div className="space-y-1">
                                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ATS Score</p>
                                          <div className="flex items-center gap-2">
                                             <span className="text-sm font-bold text-slate-900">{score}%</span>
                                             <div className="flex-1 h-1 bg-slate-50 rounded-full overflow-hidden">
                                                <div className={cn("h-full rounded-full", score > 80 ? "bg-emerald-500" : score > 50 ? "bg-blue-500" : "bg-amber-500")} style={{ width: `${score}%` }} />
                                             </div>
                                          </div>
                                       </div>
                                       <div className="space-y-1">
                                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target Role</p>
                                          <p className="text-[11px] font-bold text-slate-600 truncate">Software Engineer</p>
                                       </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                       {["React", "Node.js", "TypeScript"].map(tag => (
                                          <span key={tag} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-bold uppercase rounded-md border border-slate-100">{tag}</span>
                                       ))}
                                    </div>
                                 </div>

                                 <div className="pt-6 flex items-center justify-between">
                                    <p className="text-[9px] text-slate-400 font-medium">Sync: {format(new Date(resume.updated_at), "MMM d, yyyy")}</p>
                                    <Button onClick={() => navigate(`/builder/${resume.id}`)} variant="ghost" className="h-8 px-3 rounded-lg text-blue-600 text-[10px] font-bold uppercase tracking-wider gap-2 hover:bg-blue-50">
                                       Open <ArrowRight className="w-3.5 h-3.5" />
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

         {/* Right Sidebar: Activity & Insights */}
         <div className="lg:col-span-4 space-y-8">
            <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                     <TrendingUp className="w-4 h-4 text-blue-600" /> Recent Activity
                  </h3>
                  <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] font-bold uppercase">Live</Badge>
               </div>
               <div className="space-y-5">
                  {[
                    { title: "ATS Score Improved", desc: "Build 'Senior SE' +12 points", time: "2m ago", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
                    { title: "Asset Deployed", desc: "Application sent to Stripe", time: "1h ago", icon: Share2, color: "text-blue-500", bg: "bg-blue-50" },
                    { title: "Optimization Sync", desc: "Keywords synchronized", time: "3h ago", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
                  ].map((act, i) => (
                    <div key={i} onClick={() => navigate("/resumes")} className="flex gap-4 group cursor-pointer">
                       <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", act.bg, act.color)}>
                          <act.icon className="w-4 h-4" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[11px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{act.title}</p>
                          <p className="text-[10px] text-slate-500 font-medium leading-tight">{act.desc}</p>
                          <p className="text-[9px] text-slate-400 font-medium">{act.time}</p>
                       </div>
                    </div>
                  ))}
               </div>
               <Button onClick={() => navigate("/resumes")} variant="outline" className="w-full h-10 rounded-xl border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all">View All Activity</Button>
            </Card>
         </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
         <DialogContent className="rounded-3xl p-8 border-none shadow-2xl max-w-lg bg-white">
            <div className="space-y-6">
               <div className="space-y-2">
                  <DialogTitle className="text-2xl font-bold tracking-tight">New Resume Build</DialogTitle>
                  <DialogDescription className="text-sm font-medium text-slate-500">Initialize a new professional identity asset.</DialogDescription>
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Resume Title</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Senior Software Engineer" className="h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 font-bold text-sm" />
               </div>
               <Button onClick={handleCreate} disabled={!title.trim()} className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold uppercase tracking-widest text-[10px] gap-3 shadow-lg shadow-blue-600/20">
                  Initialize Build <Sparkles className="w-4 h-4" />
               </Button>
            </div>
         </DialogContent>
      </Dialog>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
         <DialogContent className="rounded-3xl p-8 border-none shadow-2xl max-w-lg bg-white">
            <div className="space-y-6">
               <div className="space-y-2">
                  <DialogTitle className="text-2xl font-bold tracking-tight">Share Identity</DialogTitle>
                  <DialogDescription className="text-sm font-medium text-slate-500">Global link for professional profile synchronization.</DialogDescription>
               </div>
               <div className="flex gap-2">
                  <Input readOnly value={`${window.location.origin}/profile/${shareId}`} className="h-12 rounded-xl bg-slate-50 border border-slate-200 px-4 font-medium text-slate-600 text-xs flex-1" />
                  <Button onClick={() => copyShareLink(shareId)} className="h-12 w-12 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 flex items-center justify-center">
                     {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </Button>
               </div>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">Public synchronization active.</p>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
