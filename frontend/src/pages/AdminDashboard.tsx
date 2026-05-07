import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, FileText, ShieldAlert, Loader2, Search, MoreHorizontal, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, jobs: 0, resumes: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uStats, jStats, rStats, uList, jList] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("job_posts").select("id", { count: "exact", head: true }),
        supabase.from("resumes").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select(`*, user_roles(role)`).limit(50),
        supabase.from("job_posts").select("*").order("created_at", { ascending: false }).limit(50),
      ]);

      setStats({
        users: uStats.count || 0,
        jobs: jStats.count || 0,
        resumes: rStats.count || 0,
      });
      setUsers(uList.data || []);
      setJobs(jList.data || []);
    } catch (error) {
      toast.error("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole as any })
      .eq("user_id", userId);
    
    if (error) toast.error("Failed to update role");
    else {
      toast.success(`Role updated to ${newRole}`);
      fetchData();
    }
  };

  const handleUpdateJobStatus = async (jobId: string, status: string) => {
    const { error } = await supabase
      .from("job_posts")
      .update({ status })
      .eq("id", jobId);
    
    if (error) toast.error("Failed to update job status");
    else {
      toast.success(`Job status updated to ${status}`);
      fetchData();
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <SEOHead title="Admin Dashboard — ATS Pro" description="Administrative control panel." noindex />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display uppercase tracking-widest">Control Center</h1>
          <p className="text-muted-foreground mt-1 font-mono text-xs uppercase tracking-tighter">System-level moderation & platform metrics</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 shadow-lg shadow-destructive/5">
          <ShieldAlert className="h-5 w-5" />
          <span className="text-sm font-bold uppercase tracking-widest font-display">Priority Access</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={stats.users} icon={Users} color="text-blue-500" />
        <StatCard title="Job Posts" value={stats.jobs} icon={Briefcase} color="text-green-500" />
        <StatCard title="Resumes Generated" value={stats.resumes} icon={FileText} color="text-purple-500" />
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="users" className="rounded-lg">User Management</TabsTrigger>
          <TabsTrigger value="jobs" className="rounded-lg">Job Moderation</TabsTrigger>
          <TabsTrigger value="logs" className="rounded-lg">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display uppercase tracking-wider text-xl">Users</CardTitle>
                <CardDescription className="font-mono text-xs uppercase">Manage permissions and roles</CardDescription>
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Search by name or email..." 
                  className="w-64 bg-background/50 border-border/50" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline" size="icon"><Search className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter(u => u.display_name?.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{user.display_name || "Anonymous User"}</span>
                          <span className="text-xs text-muted-foreground font-mono">{user.user_id.substring(0, 15)}...</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase font-mono text-[10px]">
                          {user.user_roles?.[0]?.role || "none"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs font-mono">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUpdateRole(user.user_id, "admin")}>Make Admin</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateRole(user.user_id, "recruiter")}>Make Recruiter</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateRole(user.user_id, "job_seeker")}>Make Job Seeker</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-wider text-xl">Global Job Queue</CardTitle>
              <CardDescription className="font-mono text-xs uppercase">Approve or remove platform listings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-bold text-sm">{job.title}</TableCell>
                      <TableCell className="text-sm">{job.company_name}</TableCell>
                      <TableCell>
                        <Badge variant={job.status === 'active' ? 'default' : 'secondary'} className="uppercase font-mono text-[10px]">
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                            onClick={() => handleUpdateJobStatus(job.id, "active")}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleUpdateJobStatus(job.id, "suspended")}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
           <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-wider text-xl">System Activity</CardTitle>
              <CardDescription className="font-mono text-xs uppercase">Audit trail for administrative actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 py-8">
                <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono bg-muted/20 p-4 rounded-xl border border-border/30">
                  <Badge variant="outline">INFO</Badge>
                  <span>System heartbeat active. All services operational.</span>
                  <span className="ml-auto opacity-50">Just now</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono bg-muted/20 p-4 rounded-xl border border-border/30">
                  <Badge variant="outline" className="text-orange-500 border-orange-500/30">WARN</Badge>
                  <span>High traffic detected on 'AI Apply' edge function.</span>
                  <span className="ml-auto opacity-50">12m ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all group">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-mono">{title}</p>
            <p className="text-4xl font-bold mt-1 font-display tabular-nums tracking-tighter">{value}</p>
          </div>
          <div className={`p-4 rounded-2xl bg-muted/50 group-hover:bg-muted transition-colors ${color}`}>
            <Icon className="h-7 w-7" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
