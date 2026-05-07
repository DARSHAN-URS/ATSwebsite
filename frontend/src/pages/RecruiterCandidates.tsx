import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star, StarOff, Search, Users, Loader2 } from "lucide-react";
import SEOHead from "@/components/SEOHead";

interface CandidateRow {
  id: string;
  applicant_id: string;
  job_post_id: string;
  status: string;
  is_shortlisted: boolean;
  created_at: string;
  job_title: string;
  display_name: string;
}

export default function RecruiterCandidates() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      // Get all recruiter's job posts
      const { data: jobs } = await supabase
        .from("job_posts")
        .select("id, title")
        .eq("recruiter_id", user.id);

      if (!jobs || jobs.length === 0) {
        setCandidates([]);
        setLoading(false);
        return;
      }

      const jobIds = jobs.map((j) => j.id);
      const jobMap = new Map(jobs.map((j) => [j.id, j.title]));

      // Get all applications for those jobs
      const { data: apps } = await supabase
        .from("job_post_applications" as any)
        .select("*")
        .in("job_post_id", jobIds)
        .order("created_at", { ascending: false });

      if (!apps || (apps as any[]).length === 0) {
        setCandidates([]);
        setLoading(false);
        return;
      }

      const applicantIds = [...new Set((apps as any[]).map((a: any) => a.applicant_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("display_name, user_id")
        .in("user_id", applicantIds);

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p.display_name || "Unknown"]));

      const rows: CandidateRow[] = (apps as any[]).map((a: any) => ({
        id: a.id,
        applicant_id: a.applicant_id,
        job_post_id: a.job_post_id,
        status: a.status,
        is_shortlisted: a.is_shortlisted,
        created_at: a.created_at,
        job_title: jobMap.get(a.job_post_id) || "Unknown",
        display_name: profileMap.get(a.applicant_id) || "Unknown",
      }));

      setCandidates(rows);
      setLoading(false);
    })();
  }, [user]);

  const filtered = candidates.filter((c) => {
    const q = search.toLowerCase();
    return c.display_name.toLowerCase().includes(q) || c.job_title.toLowerCase().includes(q);
  });

  const toggleShortlist = async (e: React.MouseEvent, candidate: CandidateRow) => {
    e.stopPropagation();
    const newVal = !candidate.is_shortlisted;
    await supabase.from("job_post_applications" as any).update({ is_shortlisted: newVal } as any).eq("id", candidate.id);
    setCandidates((prev) => prev.map((c) => c.id === candidate.id ? { ...c, is_shortlisted: newVal } : c));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <SEOHead title="Candidates — ATS Pro" description="Search candidates across all your job posts." noindex />
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6" /> Candidate Search
        </h1>
        <p className="text-muted-foreground">Browse all applicants across your job posts.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name or job title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No candidates found</h3>
            <p className="text-muted-foreground">{candidates.length === 0 ? "No applications have been received yet." : "Try adjusting your search."}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/recruiter/jobs/${c.job_post_id}/applicants`)}
                >
                  <TableCell className="font-medium">{c.display_name}</TableCell>
                  <TableCell>{c.job_title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{c.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(c.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <button onClick={(e) => toggleShortlist(e, c)} className="text-yellow-500 hover:text-yellow-600">
                      {c.is_shortlisted ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
