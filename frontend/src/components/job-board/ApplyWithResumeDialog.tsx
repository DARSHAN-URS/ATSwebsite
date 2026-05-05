import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileText, SendHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Resume {
  id: string;
  title: string;
}

interface ApplyWithResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
  companyName: string;
  onSubmit: (resumeId: string | null, coverNote: string) => Promise<void>;
}

export default function ApplyWithResumeDialog({
  open,
  onOpenChange,
  jobTitle,
  companyName,
  onSubmit,
}: ApplyWithResumeDialogProps) {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [coverNote, setCoverNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingResumes, setFetchingResumes] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setFetchingResumes(true);
    supabase
      .from("resumes")
      .select("id, title")
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setResumes(data ?? []);
        if (data && data.length > 0) setSelectedResumeId(data[0].id);
        else setSelectedResumeId("");
        setFetchingResumes(false);
      });
  }, [open, user]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(selectedResumeId || null, coverNote);
      setCoverNote("");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply to {jobTitle}</DialogTitle>
          <DialogDescription>
            at {companyName} — attach your resume and optionally add a cover note.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" /> Resume
            </Label>
            {fetchingResumes ? (
              <p className="text-sm text-muted-foreground">Loading resumes...</p>
            ) : resumes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No resumes found. Create one in the Resumes section first.
              </p>
            ) : (
              <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a resume" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Cover Note (optional)</Label>
            <Textarea
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Write a brief message to the recruiter..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4 mr-1.5" />
            )}
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
