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
        toast({ title: "AI Analysis complete!", description: "Check private notes for rankings." });
        fetchData();
      }
    } catch (e: any) {
      toast({ title: "Analysis failed", description: e.message, variant: "destructive" });
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
    toast({ title: "Notes saved" });
  };

  const scheduleInterview = async () => {
    if (!selectedApp || !interviewDate || !interviewTime) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
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
      toast({ title: "Interview scheduled successfully!" });
      setInterviewDate(""); setInterviewTime(""); setInterviewDuration("30"); setInterviewNotes("");
    } catch (error: any) {
      toast({ title: "Failed to schedule", description: error.message, variant: "destructive" });
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
    <div className="p-8 max-w-[1600px] mx-auto space-y-10 bg-slate-50 min-h-screen">
      <SEOHead title={`Hiring Pipeline — ${jobTitle}`} description="Manage your recruitment workflow" />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
           <Button variant="ghost" size="icon" onClick={() => navigate("/recruiter/jobs")} className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 hover:bg-slate-50">
              <ArrowLeft className="w-5 h-5 text-slate-900" />
           </Button>
           <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-3xl font-black text-slate-900 tracking-tight">{jobTitle}</h1>
                 <Badge variant="outline" className="rounded-lg font-black text-[10px] uppercase tracking-widest text-primary border-primary/20 bg-primary/5">Active</Badge>
              </div>
              <p className="text-slate-500 font-medium mt-1">Recruitment Pipeline • {applicants.length} Applicants</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           <Button variant="outline" className="h-12 rounded-xl font-bold bg-white border-slate-200">
              <Filter className="w-4 h-4 mr-2" /> Filter
           </Button>
           <Button 
             onClick={handleAIAnalyze} 
             disabled={analyzing || applicants.length === 0}
             className="h-12 px-8 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/10 hover:scale-105 transition-all gap-3"
           >
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4 text-primary" />}
              AI Analysis Rank
           </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
           <Loader2 className="w-10 h-10 animate-spin text-primary" />
           <p className="text-xs font-black uppercase tracking-widest text-slate-400">Synchronizing Pipeline</p>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide">
           {PIPELINE_STAGES.map((stage) => {
             const config = stageConfig[stage];
             const StageIcon = config.icon;
             return (
               <div key={stage} className="flex-shrink-0 w-80 space-y-6">
                  <div className="flex items-center justify-between px-2">
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl bg-${config.color}-500/10 flex items-center justify-center`}>
                           <StageIcon className={`w-4 h-4 text-${config.color}-600`} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{config.label}</h3>
                     </div>
                     <span className="w-6 h-6 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm">
                        {grouped[stage].length}
                     </span>
                  </div>

                  <div className="space-y-4 min-h-[500px]">
                     <AnimatePresence>
                        {grouped[stage].map((app) => {
                          const aiScore = getAiScore(app.recruiter_notes);
                          return (
                            <motion.div
                              key={app.id}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              whileHover={{ y: -4 }}
                              className="group"
                            >
                               <Card 
                                 onClick={() => openDrawer(app)}
                                 className="rounded-[2rem] border-slate-100 bg-white shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden border-b-4 border-b-transparent hover:border-b-primary"
                               >
                                  <CardContent className="p-6 space-y-4">
                                     <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">
                                              {app.profile?.display_name?.charAt(0) || "?"}
                                           </div>
                                           <div>
                                              <p className="font-black text-slate-900 leading-none">{app.profile?.display_name || "Unknown Candidate"}</p>
                                              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                                                {new Date(app.created_at).toLocaleDateString()}
                                              </p>
                                           </div>
                                        </div>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); toggleShortlist(app); }}
                                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${app.is_shortlisted ? "text-amber-500 bg-amber-50" : "text-slate-300 hover:text-amber-500 hover:bg-amber-50"}`}
                                        >
                                           <Star className={`w-4 h-4 ${app.is_shortlisted ? "fill-current" : ""}`} />
                                        </button>
                                     </div>

                                     {aiScore !== null && (
                                       <div className="space-y-2 pt-2">
                                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                             <span className="text-primary flex items-center gap-1"><Brain className="w-3 h-3" /> AI Match</span>
                                             <span className="text-slate-900">{aiScore}%</span>
                                          </div>
                                          <div className="h-1.5 rounded-full bg-slate-50 overflow-hidden">
                                             <motion.div 
                                               initial={{ width: 0 }} 
                                               animate={{ width: `${aiScore}%` }} 
                                               className="h-full bg-primary" 
                                             />
                                          </div>
                                       </div>
                                     )}

                                     <div className="flex items-center justify-between pt-2">
                                        <div className="flex -space-x-1">
                                           {app.resume_id && <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white border-2 border-white"><FileText className="w-3.5 h-3.5" /></div>}
                                           <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-white"><Mail className="w-3.5 h-3.5" /></div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                           <ChevronRight className="w-4 h-4 text-primary" />
                                        </div>
                                     </div>
                                  </CardContent>
                               </Card>
                            </motion.div>
                          );
                        })}
                     </AnimatePresence>
                     {grouped[stage].length === 0 && (
                       <div className="h-32 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center p-6 grayscale opacity-30">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Empty Stage</p>
                       </div>
                     )}
                  </div>
               </div>
             );
           })}
        </div>
      )}

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0 border-none bg-white">
           <div className="bg-slate-900 p-10 text-white relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex items-center gap-6">
                 <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center text-white text-3xl font-black border border-white/10">
                    {selectedApp?.profile?.display_name?.charAt(0) || "?"}
                 </div>
                 <div>
                    <h2 className="text-3xl font-black tracking-tight">{selectedApp?.profile?.display_name || "Applicant"}</h2>
                    <p className="text-slate-400 font-bold mt-1">Applied on {selectedApp ? new Date(selectedApp.created_at).toLocaleDateString() : ""}</p>
                 </div>
              </div>
           </div>

           <div className="p-10 space-y-10">
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Status</Label>
                    <Select
                      value={selectedApp?.status}
                      onValueChange={(v) => selectedApp && updateStatus(selectedApp.id, v)}
                    >
                      <SelectTrigger className="h-12 rounded-xl border-slate-100 shadow-sm"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {PIPELINE_STAGES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize font-bold text-xs uppercase tracking-widest">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="flex flex-col justify-end">
                    <Button 
                      onClick={() => selectedApp && toggleShortlist(selectedApp)}
                      variant="outline" 
                      className={`h-12 rounded-xl font-bold border-slate-100 ${selectedApp?.is_shortlisted ? "text-amber-500 bg-amber-50" : ""}`}
                    >
                       <Star className={`w-4 h-4 mr-2 ${selectedApp?.is_shortlisted ? "fill-current" : ""}`} />
                       {selectedApp?.is_shortlisted ? "Shortlisted" : "Shortlist"}
                    </Button>
                 </div>
              </div>

              {selectedApp?.recruiter_notes && (
                <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-4">
                   <div className="flex items-center gap-2 text-primary">
                      <Brain className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">AI Candidate Summary</span>
                   </div>
                   <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                      "{selectedApp.recruiter_notes}"
                   </p>
                </div>
              )}

              <div className="space-y-4">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Internal Review Notes</Label>
                 <Textarea 
                   value={notes} 
                   onChange={(e) => setNotes(e.target.value)} 
                   rows={6} 
                   placeholder="Your private notes about this candidate..." 
                   className="rounded-2xl border-slate-100 shadow-sm focus-visible:ring-primary"
                 />
                 <Button onClick={saveNotes} className="w-full h-12 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs">Save Assessment</Button>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-100">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Video className="w-5 h-5 text-primary" />
                       <h3 className="text-xl font-black text-slate-900">Schedule Interview</h3>
                    </div>
                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 rounded-lg">Zoom Integrated</Badge>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meeting Date</Label>
                       <Input type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} className="h-12 rounded-xl border-slate-100" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meeting Time</Label>
                       <Input type="time" value={interviewTime} onChange={(e) => setInterviewTime(e.target.value)} className="h-12 rounded-xl border-slate-100" />
                    </div>
                 </div>
                 
                 <Button 
                   onClick={scheduleInterview} 
                   disabled={schedulingInterview}
                   className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                 >
                    {schedulingInterview ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Calendar className="w-5 h-5 mr-3" /> Confirm Schedule</>}
                 </Button>
              </div>

              {selectedApp && <ScheduledInterviewsList applicationId={selectedApp.id} />}
           </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
