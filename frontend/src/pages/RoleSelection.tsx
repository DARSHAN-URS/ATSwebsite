import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { miscTranslations } from "@/i18n/miscTranslations";

export default function RoleSelection() {
  const { setUserRole } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const { locale } = useLanguage();
  const mt = miscTranslations[locale].role;

  const handleSelect = async (role: AppRole) => {
    setSubmitting(true);
    const error = await setUserRole(role);
    if (error) {
      toast({ title: mt.errorTitle, description: mt.errorDesc, variant: "destructive" });
      setSubmitting(false);
      return;
    }
    navigate(role === "recruiter" ? "/recruiter/jobs" : "/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <SEOHead title="Select Your Role — ATS Pro Resume Builder" description="Choose your role to get started." noindex />
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">{mt.title}</h1>
          <p className="text-muted-foreground">{mt.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="cursor-pointer border-2 hover:border-primary transition-colors" onClick={() => !submitting && handleSelect("job_seeker")}>
            <CardHeader className="text-center">
              <Search className="h-12 w-12 mx-auto text-primary" />
              <CardTitle>{mt.jobSeekerTitle}</CardTitle>
              <CardDescription>{mt.jobSeekerDesc}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button disabled={submitting} variant="outline" className="w-full">{mt.jobSeekerBtn}</Button>
            </CardContent>
          </Card>
          <Card className="cursor-pointer border-2 hover:border-primary transition-colors" onClick={() => !submitting && handleSelect("recruiter")}>
            <CardHeader className="text-center">
              <Briefcase className="h-12 w-12 mx-auto text-primary" />
              <CardTitle>{mt.recruiterTitle}</CardTitle>
              <CardDescription>{mt.recruiterDesc}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button disabled={submitting} variant="outline" className="w-full">{mt.recruiterBtn}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
