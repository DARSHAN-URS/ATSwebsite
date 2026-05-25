import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, Star, StarOff, FileText, Loader2, Users, 
  Calendar, Video, Sparkles, MoreHorizontal, Mail, Phone,
  ChevronRight, Brain, Zap, Filter
} from "lucide-react";
import { invokeFunction } from "@/lib/api-client";
import SEOHead from "@/components/SEOHead";
import { cn } from "@/lib/utils";
import ScheduledInterviewsList from "@/components/ScheduledInterviewsList";
import { motion, AnimatePresence } from "framer-motion";

const PIPELINE_STAGES = ["applied", "screening", "interview", "offer", "rejected"] as const;
type Stage = typeof PIPELINE_STAGES[number];

const stageConfig: Record<Stage, { label: string; color: string; icon: any }> = {
  applied: { label: "Applied", color: "blue", icon: Users },
  screening: { label: "Screening", color: "amber", icon: Zap },
  interview: { label: "Interview", color: "purple", icon: Video },
  offer: { label: "Offer", color: "green", icon: Star },
  rejected: { label: "Rejected", color: "red", icon: StarOff },
};

interface Applicant {
  id: string;
  applicant_id: string;
  status: string;
  created_at: string;
  resume_id: string | null;
  recruiter_notes: string | null;
  is_shortlisted: boolean;
  profile?: { display_name: string | null; user_id: string };
}

export default function RecruiterApplicants() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Applicant | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [schedulingInterview, setSchedulingInterview] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewDuration, setInterviewDuration] = useState("30");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const fetchData = async () => {
    if (!user || !jobId) return;
    setLoading(true);

    const [{ data: jobData }, { data: appData }] = await Promise.all([
      supabase.from("job_posts").select("title").eq("id", jobId).single(),
      supabase.from("job_post_applications" as any).select("*").eq("job_post_id", jobId).order("created_at", { ascending: false }),
    ]);

    setJobTitle((jobData as any)?.title || "");

    if (appData && (appData as any[]).length > 0) {
      const applicantIds = (appData as any[]).map((a: any) => a.applicant_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("display_name, user_id")
        .in("user_id", applicantIds);

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
      const enriched = (appData as any[]).map((a: any) => ({
        ...a,
        profile: profileMap.get(a.applicant_id),
      }));
      setApplicants(enriched);
    } else {
      setApplicants([]);
    }
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [user, jobId]);

  const handleAIAnalyze = async () => {
    if (applicants.length === 0) return;
    setAnalyzing(true);
    try {
      const { data: job } = await supabase.from("job_posts").select("description").eq("id", jobId).single();
      const resumeIds = applicants.filter(a => a.resume_id).map(a => a.resume_id);
      const { data: resumes } = await supabase.from("resumes").select("id, resume_data").in("id", resumeIds);
      const resumeMap = new Map(resumes?.map(r => [r.id, r.resume_data]) || []);

      const { data, error } = await invokeFunction("recruiter-analyze", {
        jobDescription: (job as any)?.description || "",
        applicants: applicants.map(a => ({
          id: a.id,
          name: a.profile?.display_name || "Unknown",
          resume_data: a.resume_id ? resumeMap.get(a.resume_id) : {}
        }))
      });

      if (error) throw error;

      if (data?.rankings) {
        for (const rank of data.rankings) {
          const note = `[AI Score: ${rank.score}%] ${rank.fitReason}\nRec: ${rank.recommendation}`;
          await supabase.from("job_post_applications" as any).update({ recruiter_notes: note } as any).eq("id", rank.applicantId);
        }
        toast({ title: "Intelligence Scan Complete", description: "Applicant matrix has been ranked." });
        fetchData();
      }
    } catch (e: any) {
      toast({ title: "Scan Failed", description: e.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const updateStatus = async (appId: string, newStatus: string) => {
    setUpdatingId(appId);
    await supabase.from("job_post_applications" as any).update({ status: newStatus } as any).eq("id", appId);
    setApplicants((prev) => prev.map((a) => a.id === appId ? { ...a, status: newStatus } : a));
    if (selectedApp?.id === appId) setSelectedApp((prev) => prev ? { ...prev, status: newStatus } : null);
    setUpdatingId(null);
  };

  const toggleShortlist = async (app: Applicant) => {
    const newVal = !app.is_shortlisted;
    await supabase.from("job_post_applications" as any).update({ is_shortlisted: newVal } as any).eq("id", app.id);
    setApplicants((prev) => prev.map((a) => a.id === app.id ? { ...a, is_shortlisted: newVal } : a));
    if (selectedApp?.id === app.id) setSelectedApp((prev) => prev ? { ...prev, is_shortlisted: newVal } : null);
  };

  const saveNotes = async () => {
    if (!selectedApp) return;
    await supabase.from("job_post_applications" as any).update({ recruiter_notes: notes } as any).eq("id", selectedApp.id);
    setApplicants((prev) => prev.map((a) => a.id === selectedApp.id ? { ...a, recruiter_notes: notes } : a));
    toast({ title: "Assessment Synchronized" });
  };

  const scheduleInterview = async () => {
    if (!selectedApp || !interviewDate || !interviewTime) {
      toast({ title: "Deployment data incomplete", variant: "destructive" });
      return;
    }

    setSchedulingInterview(true);
    try {
      const scheduledAt = new Date(`${interviewDate}T${interviewTime}:00.000Z`).toISOString();
      const { data, error } = await invokeFunction('schedule-zoom-interview', {
        applicationId: selectedApp.id,
        scheduledAt,
        durationMinutes: parseInt(interviewDuration),
        notes: interviewNotes,
      });

      if (error) throw error;
      toast({ title: "Mission Scheduled", description: "Zoom deployment synchronized." });
      setInterviewDate(""); setInterviewTime(""); setInterviewDuration("30"); setInterviewNotes("");
    } catch (error: any) {
      toast({ title: "Deployment Error", description: error.message, variant: "destructive" });
    } finally {
      setSchedulingInterview(false);
    }
  };

  const openDrawer = (app: Applicant) => {
    setSelectedApp(app);
    setNotes(app.recruiter_notes || "");
    setDrawerOpen(true);
  };

  const grouped = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = applicants.filter((a) => a.status === stage);
    return acc;
  }, {} as Record<Stage, Applicant[]>);

  const getAiScore = (notes: string | null) => {
    if (!notes) return null;
    const match = notes.match(/AI Score: (\d+)%/);
    return match ? parseInt(match[1]) : null;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20 font-sans">
      <SEOHead title={`Mission Ops — ${jobTitle}`} description="Manage your recruitment workflow" />
      
      <div className="container mx-auto px-8 pt-16 space-y-16 text-left">
         <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
            <div className="space-y-6">
               <Button 
                  variant="ghost" 
                  onClick={() => navigate("/recruiter/jobs")} 
                  className="p-0 hover:bg-transparent text-slate-400 hover:text-blue-600 transition-colors gap-2 text-[10px] font-black uppercase tracking-widest"
               >
                  <ArrowLeft className="w-4 h-4" /> Back to Missions
               </Button>
               <div className="space-y-4">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-600">
                     <Users className="w-4 h-4" />
                     <span className="text-[9px] font-black uppercase tracking-widest">Mission Operations</span>
                  </div>
                  <h1 className="text-2xl md:text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                     Pipeline <br /> <span className="text-blue-600">Dynamics.</span>
                  </h1>
                  <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                     Managing <span className="text-slate-900 dark:text-white font-black">{jobTitle}</span> mission with {applicants.length} active candidates.
                  </p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <Button 
                 onClick={handleAIAnalyze} 
                 disabled={analyzing || applicants.length === 0}
                 className="h-20 px-10 rounded-[2rem] bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-600/30 hover:scale-105 transition-all gap-4"
               >
                  {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Synchronize AI Rankings
               </Button>
            </div>
         </div>

         {loading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-6">
               <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Initializing Operation Matrix</p>
            </div>
         ) : (
            <div className="flex gap-10 overflow-x-auto pb-20 px-2 -mx-2 snap-x scroll-smooth no-scrollbar">
               {PIPELINE_STAGES.map((stage) => {
                 const config = stageConfig[stage];
                 const StageIcon = config.icon;
                 return (
                   <div key={stage} className="flex-shrink-0 w-full lg:w-[400px] snap-center space-y-10">
                      <div className="flex items-center justify-between px-6 border-l-4 border-blue-600 h-10">
                         <div className="flex items-center gap-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">{config.label}</h3>
                            <span className="text-2xl font-black text-slate-900 leading-none">{grouped[stage].length}</span>
                         </div>
                         <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", `bg-blue-50 text-blue-600`)}>
                            <StageIcon className="w-5 h-5" />
                          </div>
                      </div>

                      <div className="space-y-6 min-h-[600px] bg-slate-100/50 rounded-[3rem] p-6 border border-slate-200">
                         <AnimatePresence mode="popLayout">
                            {grouped[stage].map((app) => {
                              const aiScore = getAiScore(app.recruiter_notes);
                              return (
                                <motion.div
                                  key={app.id}
                                  layout
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  whileHover={{ y: -8 }}
                                  className="group"
                                >
                                   <Card 
                                     onClick={() => openDrawer(app)}
                                     className="rounded-[2.5rem] border border-slate-100 bg-white shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer overflow-hidden relative"
                                   >
                                      {aiScore !== null && aiScore > 85 && (
                                         <div className="absolute top-0 right-0 p-6">
                                            <div className="w-3 h-3 bg-blue-600 rounded-full animate-ping" />
                                         </div>
                                      )}
                                      <CardContent className="p-10 space-y-8">
                                         <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-5">
                                               <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20">
                                                  {app.profile?.display_name?.charAt(0) || "?"}
                                               </div>
                                               <div>
                                                  <p className="text-xl font-black text-slate-900 tracking-tight leading-tight">{app.profile?.display_name || "Unknown Candidate"}</p>
                                                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                                                    Deployed {new Date(app.created_at).toLocaleDateString()}
                                                  </p>
                                               </div>
                                            </div>
                                         </div>

                                         {aiScore !== null && (
                                           <div className="space-y-4 bg-slate-50 p-6 rounded-2xl">
                                              <div className="flex items-center justify-between">
                                                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2"><Sparkles className="w-3 h-3" /> Intel Score</span>
                                                 <span className="text-lg font-black text-slate-900">{aiScore}%</span>
                                              </div>
                                              <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                                 <motion.div 
                                                   initial={{ width: 0 }} 
                                                   animate={{ width: `${aiScore}%` }} 
                                                   className="h-full bg-blue-600" 
                                                 />
                                              </div>
                                           </div>
                                         )}

                                         <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                            <div className="flex gap-2">
                                               {app.resume_id && <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/10"><FileText className="w-4 h-4" /></div>}
                                               <button 
                                                  onClick={(e) => { e.stopPropagation(); toggleShortlist(app); }}
                                                  className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", app.is_shortlisted ? "bg-amber-100 text-amber-500 shadow-lg shadow-amber-500/10 scale-110" : "bg-slate-50 text-slate-300 hover:text-amber-500 hover:bg-amber-50")}
                                               >
                                                  <Star className={cn("w-4 h-4", app.is_shortlisted ? "fill-current" : "")} />
                                               </button>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
                                         </div>
                                      </CardContent>
                                   </Card>
                                </motion.div>
                              );
                            })}
                         </AnimatePresence>
                         {grouped[stage].length === 0 && (
                           <div className="h-40 border-4 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-center p-10 opacity-40">
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Neutral Zone</p>
                           </div>
                         )}
                      </div>
                   </div>
                 );
               })}
            </div>
         )}
      </div>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0 border-none bg-white font-sans">
           <div className="bg-slate-50 border-b border-slate-100 p-16 text-slate-900 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full lg:w-[500px] h-auto lg:h-[500px] bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
              <div className="relative z-10 space-y-10">
                 <div className="flex items-center justify-between">
                    <div className="w-24 h-24 rounded-[2rem] bg-blue-600 flex items-center justify-center text-white text-2xl md:text-4xl font-black shadow-2xl">
                       {selectedApp?.profile?.display_name?.charAt(0) || "?"}
                    </div>
                    <Badge className={cn("rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em]", selectedApp?.is_shortlisted ? "bg-amber-400 text-slate-900" : "bg-slate-100 text-slate-600")}>
                       {selectedApp?.is_shortlisted ? "Elite Candidate" : "Standard Profile"}
                    </Badge>
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight text-slate-900">{selectedApp?.profile?.display_name || "Applicant"}</h2>
                    <p className="text-blue-600 font-black uppercase tracking-[0.3em] text-xs">Mission Component • {selectedApp ? new Date(selectedApp.created_at).toLocaleDateString() : ""}</p>
                 </div>
              </div>
           </div>

           <div className="p-16 space-y-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-4">Operational Status</Label>
                    <Select
                      value={selectedApp?.status}
                      onValueChange={(v) => selectedApp && updateStatus(selectedApp.id, v)}
                    >
                      <SelectTrigger className="h-16 rounded-2xl border-slate-100 font-bold px-6 bg-slate-50"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-3xl">
                        {PIPELINE_STAGES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize font-black text-[10px] uppercase tracking-widest py-4">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="flex flex-col justify-end">
                    <Button 
                      onClick={() => selectedApp && toggleShortlist(selectedApp)}
                      className={cn("h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all", selectedApp?.is_shortlisted ? "bg-amber-400 text-slate-900 shadow-xl shadow-amber-400/20" : "bg-slate-900 text-white")}
                    >
                       <Star className={cn("w-5 h-5 mr-3", selectedApp?.is_shortlisted ? "fill-current" : "")} />
                       {selectedApp?.is_shortlisted ? "De-escalate Rank" : "Escalate to Elite"}
                    </Button>
                 </div>
              </div>

              {selectedApp?.recruiter_notes && (
                <div className="p-10 rounded-[3rem] bg-blue-600/5 border border-blue-600/10 space-y-6 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                      <Brain className="w-16 h-16 text-blue-600" />
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20"><Sparkles className="w-5 h-5" /></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">AI Intelligence Summary</span>
                   </div>
                   <p className="text-lg font-medium text-slate-700 leading-relaxed italic border-l-4 border-blue-600 pl-8 py-2">
                      {selectedApp.recruiter_notes}
                   </p>
                </div>
              )}

              <div className="space-y-6">
                 <div className="flex items-center justify-between px-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Internal Assessment</Label>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" /><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Auto-Saving Enabled</span></div>
                 </div>
                 <Textarea 
                   value={notes} 
                   onChange={(e) => setNotes(e.target.value)} 
                   rows={8} 
                   placeholder="Enter private operational notes..." 
                   className="rounded-[2.5rem] border-slate-100 bg-slate-50 p-10 font-medium text-lg focus-visible:ring-blue-600/20 leading-relaxed shadow-inner"
                 />
                 <Button onClick={saveNotes} className="h-20 w-full bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-900/20 hover:scale-[1.02] transition-all">Synchronize Assessment</Button>
              </div>

              <div className="space-y-10 pt-16 border-t border-slate-100">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600"><Video className="w-6 h-6" /></div>
                       <div>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Deploy Interview</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Direct Zoom Integration</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-4">Deployment Date</Label>
                       <Input type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} className="h-16 rounded-2xl border-slate-100 bg-slate-50 px-6 font-bold" />
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-4">Deployment Time</Label>
                       <Input type="time" value={interviewTime} onChange={(e) => setInterviewTime(e.target.value)} className="h-16 rounded-2xl border-slate-100 bg-slate-50 px-6 font-bold" />
                    </div>
                 </div>
                 
                 <Button 
                   onClick={scheduleInterview} 
                   disabled={schedulingInterview}
                   className="w-full h-20 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-600/30 hover:scale-[1.02] transition-all gap-4"
                 >
                    {schedulingInterview ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Calendar className="w-6 h-6" /> Initialize Deployment</>}
                 </Button>
              </div>

              {selectedApp && <ScheduledInterviewsList applicationId={selectedApp.id} />}
           </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
