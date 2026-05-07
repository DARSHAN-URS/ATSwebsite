import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FileText, Sparkles, ArrowLeft, Loader2, Mail, Lock, User } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { miscTranslations } from "@/i18n/miscTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

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
  const { t, locale } = useLanguage();
  const mt = miscTranslations[locale].authExtra;

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
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col md:flex-row overflow-hidden">
      {/* Left Side: Brand & Visuals */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-12" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40">
              <FileText className="text-white w-7 h-7" />
            </div>
            <span className="text-3xl font-black tracking-tight text-white">
              RESUME<span className="text-primary">PRO</span>
            </span>
          </div>
          
          <h2 className="text-5xl font-black text-white leading-tight mb-8">
            The future of <span className="text-primary italic">career growth</span> is here.
          </h2>
          
          <div className="space-y-6">
            {[
              { icon: Sparkles, text: "AI-powered resume optimization in seconds" },
              { icon: Lock, text: "Bank-grade security for your professional data" },
              { icon: User, text: "Handcrafted templates for every industry" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="flex items-center gap-4 text-slate-400 font-bold"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                {item.text}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex flex-col p-8 md:p-12 lg:p-24 justify-center items-center relative">
        <div className="md:hidden absolute top-8 left-8">
           <div className="flex items-center gap-2" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              RESUME<span className="text-primary">PRO</span>
            </span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Get started <span className="text-primary">now.</span>
            </h1>
            <p className="text-slate-500 font-medium">Join 10,000+ professionals building better careers.</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1.5 bg-slate-50 dark:bg-slate-900 rounded-2xl mb-8 border border-slate-100 dark:border-slate-800">
              <TabsTrigger value="login" className="rounded-xl font-black text-xs uppercase tracking-widest py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary">
                {t.auth.login}
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-xl font-black text-xs uppercase tracking-widest py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary">
                {t.auth.signUp}
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="login" className="mt-0">
                <motion.form 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleLogin} 
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          required 
                          placeholder="name@company.com"
                          className="pl-11 h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-transparent focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</Label>
                        <button
                          type="button"
                          className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                          onClick={() => { setForgotEmail(email); setForgotOpen(true); }}
                        >
                          {mt.forgotPassword}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          type="password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          required 
                          placeholder="••••••••"
                          className="pl-11 h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-transparent focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20" disabled={loading}>
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t.common.signingIn}</> : t.common.signIn}
                  </Button>
                </motion.form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <motion.form 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSignup} 
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          value={displayName} 
                          onChange={(e) => setDisplayName(e.target.value)} 
                          required 
                          placeholder="Jane Doe"
                          className="pl-11 h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-transparent"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          required 
                          placeholder="name@company.com"
                          className="pl-11 h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-transparent"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          type="password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          required 
                          placeholder="••••••••"
                          className="pl-11 h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-transparent"
                          minLength={6}
                        />
                      </div>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20" disabled={loading}>
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t.common.creatingAccount}</> : t.common.createAccount}
                  </Button>
                </motion.form>
              </TabsContent>
            </AnimatePresence>
          </Tabs>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
             <Button variant="ghost" onClick={() => navigate("/")} className="w-full text-slate-400 hover:text-slate-900 font-bold gap-2">
               <ArrowLeft className="w-4 h-4" /> Back to Home
             </Button>
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-w-md">
           <div className="bg-slate-900 p-8 text-white relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />
             <div className="relative z-10">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-6">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <DialogTitle className="text-2xl font-black tracking-tight">{mt.resetTitle}</DialogTitle>
                <p className="text-slate-400 text-sm font-medium mt-2">{mt.resetDesc}</p>
             </div>
          </div>
          <div className="p-8 space-y-6 bg-white dark:bg-slate-950">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setForgotLoading(true);
                try {
                  const res = await invokeFunction("send-email", {
                    body: {
                      type: "password_reset",
                      email: forgotEmail,
                      redirectTo: `${window.location.origin}/reset-password`
                    }
                  });
                  if (res.error) throw res.error;
                  toast({ title: mt.checkEmail, description: mt.checkEmailDesc });
                  setForgotOpen(false);
                } catch (err: any) {
                  toast({ title: t.common.loginFailed, description: err.message || "Failed to send reset email", variant: "destructive" });
                }
                setForgotLoading(false);
              }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</Label>
                <Input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required className="rounded-xl h-11 border-slate-200" />
              </div>
              <Button type="submit" className="w-full h-11 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-primary/20" disabled={forgotLoading}>
                {forgotLoading ? mt.sending : mt.sendReset}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
