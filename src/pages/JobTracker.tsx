import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Briefcase, 
  ExternalLink, 
  Mail, 
  Trash2, 
  Send, 
  Loader2, 
  ArrowUpRight, 
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin,
  Calendar,
  Building2,
  Search,
  ChevronRight,
  Zap
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import SEOHead from "@/components/SEOHead";
import { motion, AnimatePresence } from "framer-motion";

type JobApp = Tables<"job_applications">;

const statusConfig: Record<string, { label: string; className: string; icon: any; color: string }> = {
  applied: { label: "Applied", className: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20", color: "#2563EB", icon: Clock },
  screening: { label: "Screening", className: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20", color: "#D97706", icon: Search },
  interview: { label: "Interview", className: "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20", color: "#9333EA", icon: Send },
  offer: { label: "Offer", className: "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20", color: "#16A34A", icon: CheckCircle2 },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20", color: "#DC2626", icon: AlertCircle },
};

export default function JobTracker() {
  const { user, session } = useAuth();
  const { toast } = useToast();
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

  const openEmailDialog = async (app: JobApp) => {
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
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/send-outreach-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ to: emailTo, subject: emailSubject, body: emailBody, fromName: emailFromName, replyTo: emailReplyTo, position: selectedApp?.position, company: selectedApp?.company }),
      });
      if (!res.ok) throw new Error("Failed to send");
      toast({ title: "Email sent!" });
      setEmailOpen(false);
    } catch (err: any) {
      toast({ title: "Send failed", variant: "destructive" });
    } finally { setSending(false); }
  };

  const fetchApps = async () => {
    const { data } = await supabase.from("job_applications").select("*").order("created_at", { ascending: false });
    setApps(data ?? []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchApps(); }, [user]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("job_applications").update({ status }).eq("id", id);
    if (!error) fetchApps();
  };

  const deleteApp = async (id: string) => {
    await supabase.from("job_applications").delete().eq("id", id);
    fetchApps();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <SEOHead title="Job Tracker — ResumePro" description="Track your job applications in one place." noindex />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Career <span className="text-primary">Pipeline</span></h1>
          <p className="text-slate-500 mt-2 font-medium">Manage every application, interview, and offer in your premium command center.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-6 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
              <div className="text-center">
                 <p className="text-xl font-black text-slate-900 dark:text-white">{apps.length}</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Apps</p>
              </div>
              <Separator orientation="vertical" className="h-8 bg-slate-200 dark:bg-slate-700" />
              <div className="text-center">
                 <p className="text-xl font-black text-primary">{apps.filter(a => a.status === 'offer').length}</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Offers</p>
              </div>
           </div>
           <Button className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs px-8 h-14 rounded-2xl shadow-2xl shadow-primary/20 gap-2">
             <Plus className="w-5 h-5" /> New Application
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {Object.entries(statusConfig).map(([key, { label, className, icon: Icon }]) => {
          const count = apps.filter((a) => a.status === key).length;
          return (
            <Card key={key} className="rounded-[2rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm group hover:shadow-xl transition-all overflow-hidden relative">
              <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-bl-[2rem] flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                 <Icon className="w-6 h-6" />
              </div>
              <CardContent className="p-8 pt-10">
                <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{count}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] animate-pulse" />)}
        </div>
      ) : apps.length === 0 ? (
        <div className="py-32 text-center space-y-6 rounded-[3rem] bg-slate-50/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-100 dark:border-slate-800">
           <Briefcase className="w-16 h-16 text-slate-300 mx-auto" />
           <h3 className="text-2xl font-black text-slate-900 dark:text-white">Empty Pipeline</h3>
           <p className="text-slate-500 font-medium max-w-sm mx-auto">Start tracking your applications here. Every career move starts with a single entry.</p>
           <Button variant="outline" className="rounded-xl font-bold border-slate-200">Get Started</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence>
            {apps.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl transition-all group overflow-hidden">
                   <CardContent className="p-0 flex flex-col md:flex-row items-stretch">
                      <div className="p-8 flex-1 flex items-center gap-8 border-b md:border-b-0 md:border-r border-slate-50 dark:border-slate-800">
                         <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-primary text-2xl shadow-inner shrink-0">
                            {app.company.charAt(0)}
                         </div>
                         <div className="min-w-0">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{app.position}</h3>
                            <div className="flex flex-wrap items-center gap-5 mt-2">
                               <span className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                  <Building2 className="w-4 h-4" /> {app.company}
                               </span>
                               <span className="flex items-center gap-2 text-sm font-bold text-slate-400">
                                  <Calendar className="w-4 h-4" /> {new Date(app.date_applied).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                               </span>
                            </div>
                         </div>
                      </div>

                      <div className="p-8 flex items-center justify-between gap-8 md:min-w-[400px]">
                         <div className="flex items-center gap-4">
                            <div className={`px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] ${statusConfig[app.status]?.className}`}>
                               {statusConfig[app.status]?.label}
                            </div>
                            <Select value={app.status} onValueChange={(v) => updateStatus(app.id, v)}>
                               <SelectTrigger className="w-[40px] h-10 p-0 border-none bg-slate-50 dark:bg-slate-800 rounded-xl focus:ring-0">
                                  <ChevronRight className="w-4 h-4 mx-auto rotate-90" />
                               </SelectTrigger>
                               <SelectContent className="rounded-xl">
                                  {Object.entries(statusConfig).map(([key, { label }]) => (
                                    <SelectItem key={key} value={key} className="text-[10px] font-black uppercase tracking-widest">{label}</SelectItem>
                                  ))}
                               </SelectContent>
                            </Select>
                         </div>

                         <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => openEmailDialog(app)} className="h-12 w-12 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all">
                               <Mail className="w-5 h-5" />
                            </Button>
                            {app.url && (
                               <Button variant="ghost" size="icon" asChild className="h-12 w-12 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                  <a href={app.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-5 h-5" /></a>
                               </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => deleteApp(app.id)} className="h-12 w-12 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all">
                               <Trash2 className="w-5 h-5" />
                            </Button>
                         </div>
                      </div>
                   </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Email Dialog updated to match premium modal style */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
         <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-xl">
            <div className="bg-slate-900 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                 <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-6">
                   <Send className="h-6 w-6 text-white" />
                 </div>
                 <DialogTitle className="text-2xl font-black tracking-tight">Follow-up Session</DialogTitle>
                 <p className="text-slate-400 text-sm font-medium mt-2">Connecting with {selectedApp?.company} about the {selectedApp?.position} role.</p>
              </div>
           </div>
           <div className="p-8 space-y-6 bg-white dark:bg-slate-950">
              <div className="space-y-4">
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recipient</Label>
                   <Input value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="recruiter@company.com" className="rounded-xl h-11" />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</Label>
                   <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="rounded-xl h-11 font-bold" />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message</Label>
                   <Textarea rows={6} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="rounded-2xl resize-none text-sm leading-relaxed" />
                 </div>
              </div>
              <Button onClick={sendEmail} disabled={!emailTo || sending} className="w-full bg-primary text-white font-black uppercase tracking-widest text-xs h-14 rounded-2xl shadow-2xl shadow-primary/20 gap-3 hover:scale-105 transition-all">
                 {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                 {sending ? "Sending..." : "Send Outreach"}
              </Button>
           </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
