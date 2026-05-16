import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { 
  Briefcase, Search, Mail, MapPin, Trash2, CheckCircle2, 
  Clock, XCircle, Loader2, Send, ArrowUpRight
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type JobApp = {
  id: string;
  company: string;
  position: string;
  status: string;
  location?: string;
  created_at: string;
};

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  applied: { label: "Applied", icon: Send, className: "bg-blue-100 text-blue-600" },
  interviewing: { label: "Interviewing", icon: Clock, className: "bg-amber-100 text-amber-600" },
  offered: { label: "Offered", icon: CheckCircle2, className: "bg-green-100 text-green-600" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-rose-100 text-rose-600" },
};

export default function JobTracker() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [apps, setApps] = useState<JobApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailFromName, setEmailFromName] = useState("");
  const [emailReplyTo, setEmailReplyTo] = useState("");
  const [selectedApp, setSelectedApp] = useState<JobApp | null>(null);
  const [sending, setSending] = useState(false);

  const fetchApps = async () => {
    const { data } = await supabase.from("job_applications").select("*").eq("user_id", user?.id).order("created_at", { ascending: false });
    setApps(data ?? []);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (user) fetchApps(); }, [user]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("job_applications").update({ status }).eq(
      "id",
      id
    );
    if (!error) fetchApps();
  };

  const deleteApp = async (id: string) => {
    const { error } = await supabase.from("job_applications").delete().eq("id", id);
    if (!error) fetchApps();
  };

  const openEmailDialog = (app: JobApp) => {
    setSelectedApp(app);
    setEmailTo("");
    setEmailReplyTo(user?.email ?? "");
    setEmailFromName(user?.user_metadata?.display_name || "");
    setEmailSubject(`Application for ${app.position} at ${app.company}`);
    setEmailBody(`Dear Hiring Manager,\n\nI am writing to express my interest in the ${app.position} position at ${app.company}.\n\nBest regards,\n${user?.user_metadata?.display_name || 'Candidate'}`);
    setEmailOpen(true);
  };

  const sendEmail = async () => {
    if (!emailTo || !session?.access_token) return;
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-outreach-email", {
        body: { to: emailTo, subject: emailSubject, body: emailBody, fromName: emailFromName, replyTo: emailReplyTo, position: selectedApp?.position, company: selectedApp?.company }
      });
      if (error) throw error;
      toast({ title: "Email sent!" });
      setEmailOpen(false);
    } catch (err: any) {
      toast({ title: "Send failed", variant: "destructive" });
    } finally { setSending(false); }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 md:p-10 space-y-12 font-sans">
      <SEOHead title="Tracking Engine — ResumePro" description="Monitor your operational pipeline in real-time." />

      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-10 text-left">
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <Briefcase className="w-5 h-5" />
             </div>
             <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Operational Pipeline</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
             Tracking <br /> <span className="text-blue-600">Engine.</span>
          </h1>
        </div>

        <div className="flex items-center gap-8">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Success Rate</span>
              <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">94%</span>
           </div>
           <Separator orientation="vertical" className="h-12 bg-slate-100" />
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Active Tracks</span>
              <span className="text-4xl font-black text-blue-600 leading-none">{apps.length}</span>
           </div>
        </div>
      </div>

      <div className="space-y-6 text-left">
        {loading ? (
          <div className="space-y-6">
             {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-[2.5rem] bg-white animate-pulse shadow-sm" />)}
          </div>
        ) : apps.length === 0 ? (
          <Card className="rounded-[4rem] border-none bg-white dark:bg-slate-900 flex flex-col items-center justify-center py-40 text-center shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
             <div className="w-24 h-24 rounded-[2.5rem] bg-white dark:bg-slate-800 flex items-center justify-center mb-10 shadow-sm">
                <Search className="w-10 h-10 text-slate-200" />
             </div>
             <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Pipeline is clear.</h3>
             <p className="text-slate-400 font-medium max-w-sm mt-3 mb-12">Your career pipeline is currently idle. Let's initialize new tracks from the job board.</p>
             <Button onClick={() => navigate("/job-board")} className="bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] h-16 px-12 rounded-2xl shadow-xl shadow-blue-600/20">Discovery Engine</Button>
          </Card>
        ) : (
          <div className="space-y-6">
             {apps.map((app, i) => (
               <motion.div key={app.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                 <Card className="group relative rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.08)] transition-all duration-500 overflow-hidden">
                    <div className="p-8 flex flex-col xl:flex-row items-center gap-10">
                       <div className="flex items-center gap-8 flex-1">
                          <div className="w-20 h-20 rounded-[2rem] bg-white dark:bg-slate-800 flex items-center justify-center font-black text-3xl text-blue-600 shadow-sm border border-slate-100 dark:border-slate-800 group-hover:rotate-6 transition-transform">
                             {app.company.charAt(0)}
                          </div>
                          <div>
                             <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors">{app.position}</h3>
                             <div className="flex items-center gap-4 mt-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{app.company}</span>
                                <Separator orientation="vertical" className="h-3 bg-slate-200" />
                                <div className="flex items-center gap-1.5 text-slate-400">
                                   <MapPin className="w-3.5 h-3.5" />
                                   <span className="text-[10px] font-black uppercase tracking-widest">{app.location || "Remote"}</span>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="flex flex-wrap items-center gap-10">
                          <div className="space-y-3 min-w-[200px]">
                             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-300">
                                <span>Phase Status</span>
                                <span>{statusConfig[app.status || "applied"].label}</span>
                             </div>
                             <Select value={app.status || "applied"} onValueChange={(v) => updateStatus(app.id, v)}>
                                <SelectTrigger className="h-12 rounded-xl border-none bg-white dark:bg-slate-800 font-black uppercase tracking-widest text-[10px] focus:ring-blue-600">
                                   <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                   {Object.entries(statusConfig).map(([val, conf]) => (
                                     <SelectItem key={val} value={val} className="rounded-xl font-black text-[10px] uppercase tracking-widest p-3">
                                        <div className="flex items-center gap-3">
                                           <conf.icon className="w-4 h-4" /> {conf.label}
                                        </div>
                                     </SelectItem>
                                   ))}
                                </SelectContent>
                             </Select>
                          </div>

                          <div className="flex items-center gap-4">
                             <Button onClick={() => openEmailDialog(app)} className="h-14 w-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:scale-110 transition-all">
                                <Mail className="w-6 h-6" />
                             </Button>
                             <Button onClick={() => deleteApp(app.id)} variant="ghost" className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 transition-all">
                                <Trash2 className="w-6 h-6" />
                             </Button>
                          </div>
                       </div>
                    </div>
                    <div className={cn("absolute bottom-0 left-0 h-1 transition-all duration-500 bg-blue-600")} style={{ width: "100%" }} />
                 </Card>
               </motion.div>
             ))}
          </div>
        )}
      </div>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="rounded-[4rem] p-0 overflow-hidden border-none shadow-2xl max-w-2xl text-left">
           <div className="bg-slate-900 p-12 text-white relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                 <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center mb-10 shadow-2xl shadow-blue-600/30">
                    <Send className="h-8 w-8" />
                 </div>
                 <DialogTitle className="text-4xl font-black tracking-tight leading-none">Strategic <br /> Outreach.</DialogTitle>
                 <p className="text-slate-400 font-medium mt-4">Draft a high-conversion communication to the internal hiring team.</p>
              </div>
           </div>
           <div className="p-12 space-y-8 bg-white max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recipient Address</Label>
                    <Input value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="recruiter@company.com" className="h-14 rounded-2xl bg-white border-slate-100 font-bold px-6" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject Protocol</Label>
                    <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="h-14 rounded-2xl bg-white border-slate-100 font-bold px-6" />
                 </div>
              </div>
              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message Content</Label>
                 <Textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="min-h-[250px] rounded-[2rem] bg-white border-slate-100 font-medium p-8 leading-relaxed focus-visible:ring-blue-600" />
              </div>
              <Button onClick={sendEmail} disabled={sending} className="w-full h-20 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-blue-600 transition-all">
                 {sending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Initiate Dispatch"}
              </Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
