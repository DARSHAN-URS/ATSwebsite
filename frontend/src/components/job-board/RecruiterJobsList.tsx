import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, DollarSign, SendHorizontal, CheckCircle } from "lucide-react";

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
  created_at: string;
}

interface RecruiterJobsListProps {
  jobs: JobPost[];
  loading: boolean;
  appliedIds: Set<string>;
  expandedId: string | null;
  onExpand: (jobId: string) => void;
  onApply: (e: React.MouseEvent, jobId: string) => void;
}

export default function RecruiterJobsList({ jobs, loading, appliedIds, expandedId, onExpand, onApply }: RecruiterJobsListProps) {
  if (loading) {
    return <p className="text-muted-foreground">Loading jobs...</p>;
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No jobs found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{jobs.length} job{jobs.length !== 1 ? "s" : ""} found</p>
      {jobs.map((job) => (
        <Card
          key={job.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onExpand(job.id)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{job.company_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(job.created_at).toLocaleDateString()}
                </span>
                {appliedIds.has(job.id) ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Applied
                  </Badge>
                ) : (
                  <Button size="sm" variant="default" className="gap-1" onClick={(e) => onApply(e, job.id)}>
                    <SendHorizontal className="h-3 w-3" /> Apply
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap mb-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />{job.job_type}
              </Badge>
              {job.location && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{job.location}
                </Badge>
              )}
              {job.salary_min && job.salary_max && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />{job.salary_currency} {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                </Badge>
              )}
            </div>
            {expandedId === job.id && (
              <div className="mt-4 space-y-3 border-t pt-3">
                {job.description && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                  </div>
                )}
                {job.requirements && (
                  <div>
                    <h4 className="font-medium text-sm mb-1">Requirements</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.requirements}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
