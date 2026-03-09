import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface Interview {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  zoom_join_url: string | null;
  zoom_start_url: string | null;
  zoom_password: string | null;
  zoom_meeting_id: string | null;
  status: string;
  notes: string | null;
  job_post_id: string;
  application_id: string;
  applicant_id: string;
  recruiter_id: string;
}

interface InterviewWithDetails extends Interview {
  job_title?: string;
  applicant_name?: string;
}

export default function ScheduledInterviewsList({ applicationId }: { applicationId?: string }) {
  const { user } = useAuth();
  const { role } = useUserRole();
  const [interviews, setInterviews] = useState<InterviewWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchInterviews = async () => {
      setLoading(true);
      
      let query = supabase
        .from("scheduled_interviews")
        .select("*")
        .order("scheduled_at", { ascending: true });

      if (applicationId) {
        query = query.eq("application_id", applicationId);
      } else if (role === "recruiter") {
        query = query.eq("recruiter_id", user.id);
      } else {
        query = query.eq("applicant_id", user.id);
      }

      const { data: interviewsData } = await query;

      if (interviewsData) {
        const enriched = await Promise.all(
          interviewsData.map(async (interview) => {
            const enrichedInterview: InterviewWithDetails = { ...interview };

            const { data: jobData } = await supabase
              .from("job_posts")
              .select("title")
              .eq("id", interview.job_post_id)
              .single();

            if (jobData) enrichedInterview.job_title = jobData.title;

            if (role === "recruiter") {
              const { data: profileData } = await supabase
                .from("profiles")
                .select("display_name")
                .eq("user_id", interview.applicant_id)
                .single();

              if (profileData) enrichedInterview.applicant_name = profileData.display_name;
            }

            return enrichedInterview;
          })
        );

        setInterviews(enriched);
      }

      setLoading(false);
    };

    fetchInterviews();
  }, [user, role, applicationId]);

  if (loading) {
    return (
      <Card className="border border-border/60 rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Video className="h-4 w-4 text-primary" /> Scheduled Interviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (interviews.length === 0) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-primary/10 text-primary";
      case "completed":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "cancelled":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="border border-border/60 rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Video className="h-4 w-4 text-primary" /> Scheduled Interviews
        </CardTitle>
        <CardDescription className="text-xs">
          {applicationId 
            ? "Upcoming interviews for this applicant" 
            : role === "recruiter" 
              ? "Your scheduled interviews with candidates"
              : "Your upcoming interviews"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {interviews.map((interview) => {
          const isPast = new Date(interview.scheduled_at) < new Date();
          const meetingUrl = role === "recruiter" ? interview.zoom_start_url : interview.zoom_join_url;

          return (
            <div
              key={interview.id}
              className="p-3 rounded-lg bg-muted/40 border border-border/40 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {interview.job_title || "Interview"}
                  </p>
                  {role === "recruiter" && interview.applicant_name && (
                    <p className="text-xs text-muted-foreground truncate">
                      with {interview.applicant_name}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className={`text-[10px] shrink-0 ${getStatusColor(interview.status)}`}>
                  {interview.status}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(interview.scheduled_at), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(interview.scheduled_at), "h:mm a")}</span>
                  <span className="text-muted-foreground/70">({interview.duration_minutes}m)</span>
                </div>
              </div>

              {interview.zoom_password && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Passcode: </span>
                  <span className="font-mono font-medium">{interview.zoom_password}</span>
                </div>
              )}

              {interview.notes && (
                <p className="text-xs text-muted-foreground italic line-clamp-2">
                  {interview.notes}
                </p>
              )}

              {meetingUrl && interview.status === "scheduled" && (
                <Button
                  size="sm"
                  variant={isPast ? "outline" : "default"}
                  className="w-full text-xs h-8"
                  onClick={() => window.open(meetingUrl, "_blank")}
                >
                  <Video className="h-3 w-3 mr-1.5" />
                  {role === "recruiter" ? "Start Meeting" : "Join Meeting"}
                  <ExternalLink className="h-3 w-3 ml-1.5" />
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
