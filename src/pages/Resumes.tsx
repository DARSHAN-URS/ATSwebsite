import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Resume = Tables<"resumes">;

interface ResumeData {
  summary?: string;
  skills?: string[];
  experience?: { title: string; company: string; description: string }[];
  education?: { degree: string; school: string }[];
}

export default function Resumes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");

  const fetchResumes = async () => {
    const { data } = await supabase.from("resumes").select("*").order("created_at", { ascending: false });
    setResumes(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchResumes();
  }, [user]);

  const handleCreate = async () => {
    if (!user || !title) return;
    const resumeData: ResumeData = {
      summary,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      experience: experience ? [{ title: experience, company: "", description: "" }] : [],
    };
    const { error } = await supabase.from("resumes").insert({
      user_id: user.id,
      title,
      resume_data: resumeData as any,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Resume created" });
      setOpen(false);
      setTitle("");
      setSummary("");
      setSkills("");
      setExperience("");
      fetchResumes();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("resumes").delete().eq("id", id);
    fetchResumes();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resumes</h1>
          <p className="text-muted-foreground mt-1">Manage your resumes for job matching</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Resume</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Resume</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Full Stack Developer" />
              </div>
              <div className="space-y-2">
                <Label>Professional Summary</Label>
                <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief summary of your experience..." />
              </div>
              <div className="space-y-2">
                <Label>Skills (comma-separated)</Label>
                <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, TypeScript, Node.js..." />
              </div>
              <div className="space-y-2">
                <Label>Current/Latest Job Title</Label>
                <Input value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. Senior Developer" />
              </div>
              <Button onClick={handleCreate} className="w-full">Create Resume</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : resumes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No resumes yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first resume to start finding matching jobs</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => {
            const data = resume.resume_data as ResumeData | null;
            return (
              <Card key={resume.id}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{resume.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(resume.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {data?.skills && data.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {data.skills.slice(0, 5).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                      {data.skills.length > 5 && (
                        <span className="px-2 py-0.5 text-muted-foreground text-xs">+{data.skills.length - 5} more</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
