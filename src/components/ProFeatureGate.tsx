import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { accountTranslations } from "@/i18n/accountTranslations";

interface ProFeatureGateProps {
  children: React.ReactNode;
  inline?: boolean;
  message?: string;
}

export default function ProFeatureGate({ children, inline = false, message }: ProFeatureGateProps) {
  const { isPro, loading } = useSubscription();
  const navigate = useNavigate();
  const { locale } = useLanguage();
  const ta = accountTranslations[locale];

  if (loading || isPro) return <>{children}</>;

  if (inline) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-muted-foreground border-dashed"
        onClick={() => navigate("/pricing")}
      >
        <Lock className="h-3.5 w-3.5" />
        <span className="text-xs">{message || ta.proFeatureTitle}</span>
        <Crown className="h-3 w-3 text-primary" />
      </Button>
    );
  }

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-40 blur-[1px] select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
        <Crown className="h-8 w-8 text-primary mb-2" />
        <p className="text-sm font-semibold text-foreground mb-1">
          {message || ta.proFeatureTitle}
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          {ta.unlockFeature}
        </p>
        <Button size="sm" onClick={() => navigate("/pricing")} className="gap-1.5">
          <Crown className="h-3.5 w-3.5" /> {ta.upgradeToProBtn}
        </Button>
      </div>
    </div>
  );
}
