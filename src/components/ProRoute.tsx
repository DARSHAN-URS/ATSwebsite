import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";

export default function ProRoute({ children }: { children: React.ReactNode }) {
  const { isPro, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <Lock className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Pro Feature</h2>
        <p className="text-muted-foreground max-w-md">
          This page is available exclusively for Pro subscribers. Upgrade your plan to unlock full access.
        </p>
        <Button onClick={() => navigate("/pricing")} className="gap-2 mt-2">
          <Crown className="h-4 w-4" /> Upgrade to Pro
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
