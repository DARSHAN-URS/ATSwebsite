import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: t.common.loginFailed, description: error.message, variant: "destructive" });
    } else {
      navigate("/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: displayName },
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: t.common.signupFailed, description: error.message, variant: "destructive" });
    } else {
      toast({ title: t.common.checkEmail, description: t.common.confirmationSent });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-primary">
            <Briefcase className="h-8 w-8" />
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t.auth.title}</h1>
          <p className="text-muted-foreground">{t.auth.subtitle}</p>
        </div>

        <Card>
          <Tabs defaultValue="login">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t.auth.login}</TabsTrigger>
                <TabsTrigger value="signup">{t.auth.signUp}</TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t.common.email}</Label>
                    <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t.common.password}</Label>
                    <Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline"
                      onClick={() => { setForgotEmail(email); setForgotOpen(true); }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t.common.signingIn : t.common.signIn}
                  </Button>
                </CardContent>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{t.common.displayName}</Label>
                    <Input id="signup-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t.common.email}</Label>
                    <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t.common.password}</Label>
                    <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t.common.creatingAccount : t.common.createAccount}
                  </Button>
                </CardContent>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>Enter your email and we'll send you a reset link.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setForgotLoading(true);
                const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
                  redirectTo: `${window.location.origin}/reset-password`,
                });
                setForgotLoading(false);
                if (error) {
                  toast({ title: "Error", description: error.message, variant: "destructive" });
                } else {
                  toast({ title: "Check your email", description: "We sent you a password reset link." });
                  setForgotOpen(false);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="forgot-email">{t.common.email}</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={forgotLoading}>
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
