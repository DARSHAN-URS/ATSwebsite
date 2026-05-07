import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { accountTranslations } from "@/i18n/accountTranslations";

export default function ProRoute({ children }: { children: React.ReactNode }) {
  const { isPro, loading } = useSubscription();
  const navigate = useNavigate();
  const { locale } = useLanguage();
  const ta = accountTranslations[locale];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        {ta.loading}
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <Lock className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">{ta.proFeatureTitle}</h2>
        <p className="text-muted-foreground max-w-md">
          {ta.proFeaturePageDesc}
        </p>
        <Button onClick={() => navigate("/pricing")} className="gap-2 mt-2">
          <Crown className="h-4 w-4" /> {ta.upgradeToProBtn}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
