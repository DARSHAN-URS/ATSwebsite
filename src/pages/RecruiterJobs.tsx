import { useEffect, useState } from "react";
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
import { Plus, Edit, Trash2, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchJobs = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("job_posts")
      .select("*")
      .eq("recruiter_id", user.id)
      .order("created_at", { ascending: false });
    setJobs((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, [user]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
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
      toast({ title: editingId ? "Job updated" : "Job posted" });
      setDialogOpen(false);
      fetchJobs();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("job_posts").delete().eq("id", id) as any;
    toast({ title: "Job deleted" });
    fetchJobs();
  };

  const toggleStatus = async (job: JobPost) => {
    const newStatus = job.status === "active" ? "closed" : "active";
    await supabase.from("job_posts").update({ status: newStatus }).eq("id", job.id) as any;
    fetchJobs();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Job Posts</h1>
          <p className="text-muted-foreground">Create and manage your job listings</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Post a Job</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No job posts yet</h3>
            <p className="text-muted-foreground mb-4">Create your first job listing to start finding candidates.</p>
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Post a Job</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{job.company_name} {job.location && `• ${job.location}`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={job.status === "active" ? "default" : "secondary"} className="cursor-pointer" onClick={() => toggleStatus(job)}>
                    {job.status}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(job)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(job.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{job.job_type}</Badge>
                  {job.salary_min && job.salary_max && (
                    <Badge variant="outline">{job.salary_currency} {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}</Badge>
                  )}
                </div>
                {job.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{job.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Job Post" : "Post a New Job"}</DialogTitle>
            <DialogDescription>Fill in the details below to {editingId ? "update" : "create"} your job listing.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Job Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Company Name *</Label><Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. New York, Remote" /></div>
            <div>
              <Label>Job Type</Label>
              <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} /></div>
            <div><Label>Requirements</Label><Textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>Min Salary</Label><Input type="number" value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} /></div>
              <div><Label>Max Salary</Label><Input type="number" value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} /></div>
              <div>
                <Label>Currency</Label>
                <Select value={form.salary_currency} onValueChange={(v) => setForm({ ...form, salary_currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title || !form.company_name}>
              {saving ? "Saving..." : editingId ? "Update" : "Post Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
