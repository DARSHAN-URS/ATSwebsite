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
import { cn } from "@/lib/utils";

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
  const [search, setSearch] = useState(() => sessionStorage.getItem("recruiterCandidates_search") || "");

  useEffect(() => {
    sessionStorage.setItem("recruiterCandidates_search", search);
  }, [search]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
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
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <SEOHead title="Talent Matrix — ResumePro" description="Search candidates across all your job posts." noindex />
      
      <div className="container mx-auto px-8 pt-16 space-y-16 text-left">
         <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-600">
                  <Users className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Candidate Intelligence</span>
               </div>
               <h1 className="text-2xl md:text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                  Talent <br /> <span className="text-blue-600">Matrix.</span>
               </h1>
            </div>

            <div className="w-full max-w-xl group relative">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
               <Input
                  className="h-20 rounded-[2rem] bg-white border-slate-100 px-16 font-bold text-lg shadow-[0_10px_40px_rgba(0,0,0,0.02)] focus:ring-blue-600/10 transition-all"
                  placeholder="Search by name, role, or skill..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
               />
            </div>
         </div>

         {loading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-6">
               <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Initializing Talent Scan</p>
            </div>
         ) : filtered.length === 0 ? (
            <Card className="rounded-[4rem] border-2 border-dashed border-slate-200 bg-white py-32 text-center space-y-8">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                  <Users className="w-10 h-10" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Zero Matches Detected</h3>
                  <p className="text-slate-500 font-medium max-w-sm mx-auto">{candidates.length === 0 ? "No applications have been deployed to your active missions yet." : "Adjust your search parameters to re-scan the matrix."}</p>
               </div>
            </Card>
         ) : (
            <Card className="rounded-[4rem] border border-slate-100 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.03)] overflow-hidden">
               <div className="overflow-x-auto">
                  <Table>
                     <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                        <TableRow className="border-none hover:bg-transparent">
                           <TableHead className="h-20 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Candidate Identification</TableHead>
                           <TableHead className="h-20 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Assigned Mission</TableHead>
                           <TableHead className="h-20 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operational Status</TableHead>
                           <TableHead className="h-20 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Deployment Date</TableHead>
                           <TableHead className="h-20 px-10 w-20"></TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {filtered.map((c) => (
                           <TableRow
                              key={c.id}
                              className="border-b border-slate-100 cursor-pointer hover:bg-blue-50/30 transition-colors group"
                              onClick={() => navigate(`/recruiter/jobs/${c.job_post_id}/applicants`)}
                           >
                              <TableCell className="px-10 py-8">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-600/20">{c.display_name[0]}</div>
                                    <div>
                                       <p className="text-lg font-black text-slate-900 tracking-tight">{c.display_name}</p>
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Verified Profile</p>
                                    </div>
                                 </div>
                              </TableCell>
                              <TableCell className="px-10 py-8">
                                 <div className="space-y-1">
                                    <p className="font-bold text-slate-700">{c.job_title}</p>
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Mission</p>
                                 </div>
                              </TableCell>
                              <TableCell className="px-10 py-8">
                                 <Badge className={cn("rounded-xl px-4 py-1.5 text-[9px] font-black uppercase tracking-widest", c.status === "pending" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100")}>
                                    {c.status}
                                 </Badge>
                              </TableCell>
                              <TableCell className="px-10 py-8 text-slate-400 font-bold text-sm">
                                 {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </TableCell>
                              <TableCell className="px-10 py-8 text-right">
                                 <button 
                                    onClick={(e) => toggleShortlist(e, c)} 
                                    className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all", c.is_shortlisted ? "bg-amber-100 text-amber-500 shadow-lg shadow-amber-500/10 scale-110" : "text-slate-300 hover:text-amber-500 hover:bg-amber-50")}
                                 >
                                    {c.is_shortlisted ? <Star className="h-5 w-5 fill-current" /> : <StarOff className="h-5 w-5" />}
                                 </button>
                              </TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               </div>
            </Card>
         )}
      </div>
    </div>
  );
}

