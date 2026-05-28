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
import { cn } from "@/lib/utils";

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
  const [tab, setTab] = useState(() => sessionStorage.getItem("recruiterJobs_tab") || "all");

  useEffect(() => {
    sessionStorage.setItem("recruiterJobs_tab", tab);
  }, [tab]);

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Job Updated" : "Job Posted" });
      setDialogOpen(false);
      fetchJobs();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("job_posts").delete().eq("id", id) as any;
    toast({ title: "Job Deleted" });
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
    <div className="w-full bg-white pb-12">
      <SEOHead title="Manage Jobs — ResumePro" description="Manage your job postings." noindex />
      
      <div className="w-full max-w-6xl mx-auto space-y-10 text-left">
         <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-600">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Job Management</span>
               </div>
               <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">
                  Active <span className="text-blue-600">Jobs.</span>
               </h1>
            </div>
            <Button onClick={openNew} className="h-12 px-8 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] gap-3 shadow-xl hover:scale-105 transition-all">
               <Plus className="w-5 h-5" /> Post New Job
            </Button>
         </div>

         {/* Statistical Infrastructure */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
               { label: "Active Jobs", value: jobs.length, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
               { label: "Total Views", value: totalViews, icon: Eye, color: "text-indigo-600", bg: "bg-indigo-50" },
               { label: "Total Candidates", value: totalApps, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" }
            ].map((stat, i) => (
               <Card key={i} className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5 flex items-center gap-5 group hover:shadow-md transition-all">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                     <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                     <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                  </div>
               </Card>
            ))}
         </div>

         <Tabs value={tab} onValueChange={setTab} className="w-full space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100">
               <TabsList className="bg-transparent h-auto p-0 gap-8">
                  {["all", "active", "closed"].map((t) => (
                     <TabsTrigger key={t} value={t} className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all">
                        {t} ({t === "all" ? jobs.length : jobs.filter(j => j.status === t).length})
                     </TabsTrigger>
                  ))}
               </TabsList>
            </div>

            <TabsContent value={tab} className="mt-0">
               {loading ? (
                  <div className="flex flex-col items-center justify-center py-32 space-y-4">
                     <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Jobs</p>
                  </div>
               ) : filteredJobs.length === 0 ? (
                  <Card className="rounded-3xl border border-slate-200 bg-white py-24 text-center space-y-6">
                     <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                        <Briefcase className="w-8 h-8" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">No Active Jobs</h3>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto">You don't have any active jobs. Post a new job to start receiving applications.</p>
                     </div>
                     <Button onClick={openNew} variant="outline" className="h-12 px-8 rounded-xl border-slate-200 text-blue-600 font-black uppercase tracking-widest text-[10px] gap-3">
                        <Plus className="w-4 h-4" /> Post Job
                     </Button>
                  </Card>
               ) : (                    <div className="grid grid-cols-1 gap-6">
                      {filteredJobs.map((job) => (
                         <Card key={job.id} className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
                            <div className="flex flex-col md:flex-row items-start justify-between gap-6 relative z-10">
                               <div className="space-y-5 flex-1">
                                  <div className="space-y-2">
                                     <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform"><Briefcase className="w-5 h-5" /></div>
                                        <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase leading-none">{job.title}</h3>
                                     </div>
                                     <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] pl-14">{job.company_name} <span className="mx-2 text-slate-200">|</span> {job.location || "Global Ops"}</p>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-3 pl-14">
                                     <Badge className="rounded-xl px-4 py-1.5 bg-blue-600 text-white border-none text-[9px] font-black uppercase tracking-widest">{job.job_type}</Badge>
                                     {job.salary_min && (
                                        <Badge variant="outline" className="rounded-xl px-4 py-1.5 border-slate-200 text-slate-500 text-[9px] font-black uppercase tracking-widest">
                                           {job.salary_currency} {job.salary_min.toLocaleString()} - {job.salary_max?.toLocaleString()}
                                        </Badge>
                                     )}
                                  </div>

                                  {job.description && (
                                    <div className="pl-14 space-y-3">
                                       <p className="text-slate-500 font-medium leading-relaxed line-clamp-2 max-w-3xl text-sm italic border-l-2 border-slate-100 pl-4">{job.description}</p>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center gap-8 pt-5 border-t border-slate-50 mt-5 pl-14">
                                     <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all"><Eye className="w-4 h-4" /></div>
                                        <div>
                                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Views</p>
                                           <p className="text-base font-black text-slate-900">{job.viewCount || 0} Views</p>
                                        </div>
                                     </div>
                                     <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-all"><Users className="w-4 h-4" /></div>
                                        <div>
                                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Candidates</p>
                                           <p className="text-base font-black text-slate-900">{job.appCount || 0} Active</p>
                                        </div>
                                     </div>
                                  </div>
                               </div>

                               </div>

                               <div className="flex flex-col items-stretch gap-3 w-full md:w-48 mt-4 md:mt-0">
                                  <Button onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)} className="h-10 px-4 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-blue-600 transition-all">Pipeline</Button>
                                  <div className="grid grid-cols-2 gap-3">
                                     <Button variant="outline" size="icon" onClick={() => openEdit(job)} className="w-full h-10 rounded-xl border-slate-100 hover:text-blue-600 transition-all"><Edit className="w-4 h-4" /></Button>
                                     <Button variant="outline" size="icon" onClick={() => handleDelete(job.id)} className="w-full h-10 rounded-xl border-slate-100 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></Button>
                                  </div>
                                  <Badge 
                                     className={cn("h-10 rounded-xl px-4 flex items-center justify-center cursor-pointer text-[10px] font-black uppercase tracking-widest transition-all", job.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200")}
                                     onClick={() => toggleStatus(job)}
                                  >
                                     {job.status === "active" ? "Active" : "Closed"}
                                  </Badge>
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
        <DialogContent className="max-w-2xl rounded-[3rem] p-12 border-none shadow-3xl bg-white text-slate-900 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="space-y-4 text-left pb-6 border-b border-slate-100 mb-8">
            <DialogTitle className="text-2xl md:text-4xl font-black tracking-tighter uppercase text-slate-900">{editingId ? "Edit" : "Post"} Job</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">Enter the details for your job posting.</DialogDescription>
          </DialogHeader>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Job Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-16 rounded-2xl bg-white border-slate-100 font-bold px-6 text-slate-900 placeholder:text-slate-400" placeholder="e.g. Lead System Architect" />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Company Name</Label>
                  <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="h-16 rounded-2xl bg-white border-slate-100 font-bold px-6 text-slate-900 placeholder:text-slate-400" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Location</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="h-16 rounded-2xl bg-white border-slate-100 font-bold px-6 text-slate-900 placeholder:text-slate-400" placeholder="e.g. Remote, NY" />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Job Type</Label>
                  <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
                     <SelectTrigger className="h-16 rounded-2xl bg-white border-slate-100 font-bold px-6 text-slate-900"><SelectValue /></SelectTrigger>
                     <SelectContent className="rounded-xl border-none shadow-2xl">
                        {["full-time", "part-time", "contract", "remote"].map(v => <SelectItem key={v} value={v} className="rounded-lg font-bold uppercase text-[10px] tracking-widest">{v}</SelectItem>)}
                     </SelectContent>
                  </Select>
               </div>
            </div>

            <div className="space-y-2">
               <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Job Description</Label>
               <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-[150px] rounded-2xl bg-white border-slate-100 font-medium p-6 text-slate-900 placeholder:text-slate-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Min Salary</Label>
                  <Input type="number" value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} className="h-16 rounded-2xl bg-white border-slate-100 font-bold px-6 text-slate-900 placeholder:text-slate-400" />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Max Salary</Label>
                  <Input type="number" value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} className="h-16 rounded-2xl bg-white border-slate-100 font-bold px-6 text-slate-900 placeholder:text-slate-400" />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Currency</Label>
                  <Select value={form.salary_currency} onValueChange={(v) => setForm({ ...form, salary_currency: v })}>
                     <SelectTrigger className="h-16 rounded-2xl bg-white border-slate-100 font-bold px-6 text-slate-900"><SelectValue /></SelectTrigger>
                     <SelectContent className="rounded-xl border-none shadow-2xl h-64 overflow-y-auto">
                        {["USD", "EUR", "GBP", "INR", "AED", "SAR", "CAD", "AUD"].map(v => <SelectItem key={v} value={v} className="rounded-lg font-bold">{v}</SelectItem>)}
                     </SelectContent>
                  </Select>
               </div>
            </div>
          </div>
          <DialogFooter className="pt-10 flex-col sm:flex-row gap-4">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400">Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title || !form.company_name} className="h-16 px-12 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-600/30">
               {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : editingId ? "Update Job" : "Post Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

