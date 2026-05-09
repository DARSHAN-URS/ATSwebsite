import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Briefcase, Eye, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";

interface JobPost {
  id: string;
  title: string;
  company_name: string;
  location: string | null;
  job_type: string;
  description: string | null;
  requirements: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  status: string;
  created_at: string;
  viewCount?: number;
  appCount?: number;
}

const emptyForm = {
  title: "",
  company_name: "",
  location: "",
  job_type: "full-time",
  description: "",
  requirements: "",
  salary_min: "",
  salary_max: "",
  salary_currency: "USD",
};

export default function RecruiterJobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("all");

  const fetchJobs = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("job_posts")
      .select("*")
      .eq("recruiter_id", user.id)
      .order("created_at", { ascending: false });

    const jobList = (data as any[]) ?? [];
    if (jobList.length > 0) {
      const jobIds = jobList.map((j) => j.id);

      const [{ data: views }, { data: apps }] = await Promise.all([
        supabase.from("job_post_views").select("job_post_id").in("job_post_id", jobIds),
        supabase.from("job_post_applications" as any).select("job_post_id").in("job_post_id", jobIds),
      ]);

      const viewCounts = new Map<string, number>();
      const appCounts = new Map<string, number>();
      (views || []).forEach((v: any) => viewCounts.set(v.job_post_id, (viewCounts.get(v.job_post_id) || 0) + 1));
      ((apps || []) as any[]).forEach((a: any) => appCounts.set(a.job_post_id, (appCounts.get(a.job_post_id) || 0) + 1));

      jobList.forEach((j) => {
        j.viewCount = viewCounts.get(j.id) || 0;
        j.appCount = appCounts.get(j.id) || 0;
      });
    }

    setJobs(jobList);
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, [user]);

  const openNew = async () => {
    setEditingId(null);
    const { data } = await supabase
      .from("recruiter_companies" as any)
      .select("company_name")
      .eq("recruiter_id", user?.id)
      .maybeSingle();
    setForm({ ...emptyForm, company_name: (data as any)?.company_name || "" });
    setDialogOpen(true);
  };

  const openEdit = (job: JobPost) => {
    setEditingId(job.id);
    setForm({
      title: job.title,
      company_name: job.company_name,
      location: job.location ?? "",
      job_type: job.job_type,
      description: job.description ?? "",
      requirements: job.requirements ?? "",
      salary_min: job.salary_min?.toString() ?? "",
      salary_max: job.salary_max?.toString() ?? "",
      salary_currency: job.salary_currency ?? "USD",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user || !form.title || !form.company_name) return;
    setSaving(true);
    const payload: any = {
      title: form.title,
      company_name: form.company_name,
      location: form.location || null,
      job_type: form.job_type,
      description: form.description || null,
      requirements: form.requirements || null,
      salary_min: form.salary_min ? parseInt(form.salary_min) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      salary_currency: form.salary_currency,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("job_posts").update(payload).eq("id", editingId) as any);
    } else {
      payload.recruiter_id = user.id;
      ({ error } = await supabase.from("job_posts").insert(payload) as any);
    }

    if (error) {
      toast({ title: "Protocol Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Mission Updated" : "Mission Deployed" });
      setDialogOpen(false);
      fetchJobs();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("job_posts").delete().eq("id", id) as any;
    toast({ title: "Mission Terminated" });
    fetchJobs();
  };

  const toggleStatus = async (job: JobPost) => {
    const newStatus = job.status === "active" ? "closed" : "active";
    await supabase.from("job_posts").update({ status: newStatus }).eq("id", job.id) as any;
    fetchJobs();
  };

  const filteredJobs = tab === "all" ? jobs : jobs.filter((j) => j.status === tab);
  const totalViews = jobs.reduce((s, j) => s + (j.viewCount || 0), 0);
  const totalApps = jobs.reduce((s, j) => s + (j.appCount || 0), 0);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      <SEOHead title="Mission Control — ResumePro" description="Manage your job postings." noindex />
      
      <div className="container mx-auto px-8 pt-16 space-y-16 text-left">
         <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-600">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Mission Management</span>
               </div>
               <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  Active <br /> <span className="text-blue-600">Missions.</span>
               </h1>
            </div>
            <Button onClick={openNew} className="h-16 px-10 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] gap-3 shadow-2xl shadow-blue-600/30 hover:scale-105 transition-all">
               <Plus className="w-5 h-5" /> Deploy New Job
            </Button>
         </div>

         {/* Statistical Infrastructure */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
               { label: "Active Deployments", value: jobs.length, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
               { label: "Operational Reach", value: totalViews, icon: Eye, color: "text-indigo-600", bg: "bg-indigo-50" },
               { label: "Elite Candidates", value: totalApps, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" }
            ].map((stat, i) => (
               <Card key={i} className="rounded-[2.5rem] border-none bg-white dark:bg-slate-900 shadow-[0_15px_40px_rgba(0,0,0,0.02)] p-10 flex items-center gap-8 group">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6", stat.bg, stat.color)}>
                     <stat.icon className="w-8 h-8" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                     <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                  </div>
               </Card>
            ))}
         </div>

         <Tabs value={tab} onValueChange={setTab} className="w-full space-y-10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
               <TabsList className="bg-transparent h-auto p-0 gap-8">
                  {["all", "active", "closed"].map((t) => (
                     <TabsTrigger key={t} value={t} className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-0 py-4 text-[10px] font-black uppercase tracking-widest transition-all">
                        {t} ({t === "all" ? jobs.length : jobs.filter(j => j.status === t).length})
                     </TabsTrigger>
                  ))}
               </TabsList>
            </div>

            <TabsContent value={tab} className="mt-0">
               {loading ? (
                  <div className="flex flex-col items-center justify-center py-32 space-y-4">
                     <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronizing Job Data</p>
                  </div>
               ) : filteredJobs.length === 0 ? (
                  <Card className="rounded-[4rem] border-2 border-dashed border-slate-100 bg-white dark:bg-slate-900/50 py-32 text-center space-y-8">
                     <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300">
                        <Briefcase className="w-10 h-10" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Active Missions</h3>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto">Your operational queue is currently empty. Initialize a new mission to begin talent acquisition.</p>
                     </div>
                     <Button onClick={openNew} variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 text-blue-600 font-black uppercase tracking-widest text-[10px] gap-3">
                        <Plus className="w-4 h-4" /> Deploy Mission
                     </Button>
                  </Card>
               ) : (
                  <div className="grid grid-cols-1 gap-8">
                     {filteredJobs.map((job) => (
                        <Card key={job.id} className="rounded-[3.5rem] border-none bg-white dark:bg-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-12 hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-500 group relative overflow-hidden">
                           <div className="flex flex-col md:flex-row items-start justify-between gap-10 relative z-10">
                              <div className="space-y-6 flex-1">
                                 <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors">{job.title}</h3>
                                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">{job.company_name} <span className="mx-2 text-slate-200">|</span> {job.location || "Global Ops"}</p>
                                 </div>
                                 <div className="flex flex-wrap gap-3">
                                    <Badge className="rounded-xl px-4 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-black uppercase tracking-widest">{job.job_type}</Badge>
                                    {job.salary_min && (
                                       <Badge variant="outline" className="rounded-xl px-4 py-1.5 border-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-widest">
                                          {job.salary_currency} {job.salary_min.toLocaleString()} - {job.salary_max?.toLocaleString()}
                                       </Badge>
                                    )}
                                 </div>
                                 {job.description && <p className="text-slate-500 font-medium leading-relaxed line-clamp-2 max-w-3xl">{job.description}</p>}
                                 
                                 <div className="flex items-center gap-10 pt-4 border-t border-slate-50 mt-8">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Eye className="w-5 h-5" /></div>
                                       <div>
                                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Reach</p>
                                          <p className="text-sm font-black text-slate-900">{job.viewCount || 0} Views</p>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><Users className="w-5 h-5" /></div>
                                       <div>
                                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Applicants</p>
                                          <p className="text-sm font-black text-slate-900">{job.appCount || 0} Candidates</p>
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              <div className="flex md:flex-col items-center gap-3">
                                 <Button onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)} className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-900/10">Manage Pipeline</Button>
                                 <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" onClick={() => openEdit(job)} className="w-12 h-12 rounded-xl border-slate-100 hover:text-blue-600 transition-all"><Edit className="w-4 h-4" /></Button>
                                    <Button variant="outline" size="icon" onClick={() => handleDelete(job.id)} className="w-12 h-12 rounded-xl border-slate-100 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></Button>
                                    <Badge 
                                       className={cn("h-12 rounded-xl px-4 flex items-center cursor-pointer text-[9px] font-black uppercase tracking-widest transition-all", job.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200")}
                                       onClick={() => toggleStatus(job)}
                                    >
                                       {job.status}
                                    </Badge>
                                 </div>
                              </div>
                           </div>
                        </Card>
                     ))}
                  </div>
               )}
            </TabsContent>
         </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[3rem] p-12 border-none shadow-3xl bg-white dark:bg-slate-900 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="space-y-4 text-left pb-6 border-b border-slate-100 mb-8">
            <DialogTitle className="text-4xl font-black tracking-tighter uppercase">{editingId ? "Modify" : "Initialize"} Mission</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">Configure your operational parameters for talent acquisition.</DialogDescription>
          </DialogHeader>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Mission Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-16 rounded-2xl bg-white border-slate-100 font-bold px-6" placeholder="e.g. Lead System Architect" />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Operational Base</Label>
                  <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="h-16 rounded-2xl bg-white border-slate-100 font-bold px-6" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Geospatial Sector</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="h-16 rounded-2xl bg-white border-slate-100 font-bold px-6" placeholder="e.g. Remote, NY" />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Deployment Model</Label>
                  <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
                     <SelectTrigger className="h-16 rounded-2xl bg-white border-slate-100 font-bold px-6"><SelectValue /></SelectTrigger>
                     <SelectContent className="rounded-xl border-none shadow-2xl">
                        {["full-time", "part-time", "contract", "remote"].map(v => <SelectItem key={v} value={v} className="rounded-lg font-bold uppercase text-[10px] tracking-widest">{v}</SelectItem>)}
                     </SelectContent>
                  </Select>
               </div>
            </div>

            <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Core Description</Label>
               <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-[150px] rounded-2xl bg-white border-slate-100 font-medium p-6" />
            </div>

            <div className="grid grid-cols-3 gap-6">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Min Payload</Label>
                  <Input type="number" value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} className="h-16 rounded-2xl bg-white border-slate-100 font-bold px-6" />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Max Payload</Label>
                  <Input type="number" value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} className="h-16 rounded-2xl bg-white border-slate-100 font-bold px-6" />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Currency</Label>
                  <Select value={form.salary_currency} onValueChange={(v) => setForm({ ...form, salary_currency: v })}>
                     <SelectTrigger className="h-16 rounded-2xl bg-white border-slate-100 font-bold px-6"><SelectValue /></SelectTrigger>
                     <SelectContent className="rounded-xl border-none shadow-2xl h-64 overflow-y-auto">
                        {["USD", "EUR", "GBP", "INR", "AED", "SAR", "CAD", "AUD"].map(v => <SelectItem key={v} value={v} className="rounded-lg font-bold">{v}</SelectItem>)}
                     </SelectContent>
                  </Select>
               </div>
            </div>
          </div>
          <DialogFooter className="pt-10 flex-col sm:flex-row gap-4">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400">Abort Mission</Button>
            <Button onClick={handleSave} disabled={saving || !form.title || !form.company_name} className="h-16 px-12 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-600/30">
               {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : editingId ? "Update Parameters" : "Deploy Mission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

