import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RoleSelection() {
  const { setUserRole } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = async (role: AppRole) => {
    setSubmitting(true);
    const error = await setUserRole(role);
    if (error) {
      toast({ title: "Error", description: "Failed to set role. Please try again.", variant: "destructive" });
      setSubmitting(false);
      return;
    }
    navigate(role === "recruiter" ? "/recruiter/jobs" : "/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome! How will you use the platform?</h1>
          <p className="text-muted-foreground">Choose your role to get started. This determines your experience.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card
            className="cursor-pointer border-2 hover:border-primary transition-colors"
            onClick={() => !submitting && handleSelect("job_seeker")}
          >
            <CardHeader className="text-center">
              <Search className="h-12 w-12 mx-auto text-primary" />
              <CardTitle>Job Seeker</CardTitle>
              <CardDescription>Browse jobs, build resumes, and track applications</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button disabled={submitting} variant="outline" className="w-full">
                I'm looking for a job
              </Button>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer border-2 hover:border-primary transition-colors"
            onClick={() => !submitting && handleSelect("recruiter")}
          >
            <CardHeader className="text-center">
              <Briefcase className="h-12 w-12 mx-auto text-primary" />
              <CardTitle>Recruiter</CardTitle>
              <CardDescription>Post job openings and find candidates</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button disabled={submitting} variant="outline" className="w-full">
                I'm hiring talent
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
