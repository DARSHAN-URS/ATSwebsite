import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, ExternalLink, Mail, Trash2 } from "lucide-react";
import EmailComposeDialog from "./EmailComposeDialog";
import type { Tables } from "@/integrations/supabase/types";

type JobApp = Tables<"job_applications">;

const statusConfig: Record<string, { label: string; className: string }> = {
  applied: { label: "Applied", className: "bg-blue-100 text-blue-800 border-blue-200" },
  screening: { label: "Screening", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  interview: { label: "Interview", className: "bg-purple-100 text-purple-800 border-purple-200" },
  offer: { label: "Offer", className: "bg-green-100 text-green-800 border-green-200" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800 border-red-200" },
};

export default function JobTrackerSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apps, setApps] = useState<JobApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailOpen, setEmailOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<JobApp | null>(null);

  const fetchApps = async () => {
    const { data } = await supabase
      .from("job_applications")
      .select("*")
      .order("created_at", { ascending: false });
    setApps(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchApps();
  }, [user]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("job_applications").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      fetchApps();
    }
  };

  const deleteApp = async (id: string) => {
    await supabase.from("job_applications").delete().eq("id", id);
    fetchApps();
  };

  const openEmail = (app: JobApp) => {
    setSelectedApp(app);
    setEmailOpen(true);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Job Tracker</h2>
        <p className="text-sm text-muted-foreground">Track your job applications in one place</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(statusConfig).map(([key, { label, className }]) => {
          const count = apps.filter((a) => a.status === key).length;
          return (
            <Card key={key}>
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <span className="text-sm font-medium">{label}</span>
                <Badge variant="outline" className={className}>{count}</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : apps.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No applications yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Save &amp; track jobs from the Find Jobs page</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <Card key={app.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{app.position}</p>
                    {app.notes?.startsWith("📧") && (
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5 gap-1 py-0">
                        <Mail className="h-3 w-3" /> Via Email
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{app.company}</p>
                  <p className="text-xs text-muted-foreground">Applied: {new Date(app.date_applied).toLocaleDateString()}</p>
                  {app.notes && !app.notes.startsWith("📧") && (
                    <p className="text-xs text-muted-foreground italic truncate max-w-xs">{app.notes}</p>
                  )}
                  {app.notes?.startsWith("📧") && (
                    <p className="text-xs text-muted-foreground truncate max-w-xs">{app.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Select value={app.status} onValueChange={(v) => updateStatus(app.id, v)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => openEmail(app)} title="Email HR">
                    <Mail className="h-4 w-4" />
                  </Button>
                  {app.url && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={app.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => deleteApp(app.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EmailComposeDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        app={selectedApp}
      />
    </div>
  );
}
