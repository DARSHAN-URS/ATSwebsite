import { useState, useEffect, useRef, lazy, Suspense, useTransition, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowRight, Upload, BarChart3, Sparkles, LayoutTemplate, AlertTriangle, XCircle, FileWarning, CheckCircle, Star, Briefcase, Users, Menu, X, Crown, Zap, Eye, EyeOff, ChevronDown, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SEOHead from "@/components/SEOHead";
import { useLocalCurrency } from "@/hooks/useLocalCurrency";
import { landingExtraTranslations } from "@/i18n/landingExtraTranslations";
import { pricingExtraTranslations } from "@/i18n/pricingExtraTranslations";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Lazy-load heavy template components (pulls in jsPDF & canvas only when dropdown is opened)
const TemplateDropdownContent = lazy(() => import("@/components/landing/TemplateDropdownContent"));

const Index = () => {
  const pricingRef = useRef<HTMLDivElement>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const localCurrency = useLocalCurrency();
  const { t, locale } = useLanguage();
  const lx = landingExtraTranslations[locale];
  const [, startTransition] = useTransition();
  const [pricingDuration, setPricingDuration] = useState<"weekly" | "biweekly" | "monthly">("monthly");

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
    // User Timing: measure from app-shell-start to first meaningful render
    if (window.performance && performance.mark) {
      performance.mark('index-render-start');
      performance.measure('app-shell-to-render', 'app-shell-start', 'index-render-start');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: t.common.loginFailed, description: error.message, variant: "destructive" });
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
        data: { display_name: displayName }
      }
    });
    setLoading(false);
    if (error) {
      toast({ title: t.common.signupFailed, description: error.message, variant: "destructive" });
    } else {
      toast({ title: t.common.checkEmail, description: t.common.confirmationSent });
      setAuthOpen(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin
    });
    if (error) {
      toast({ title: t.common.loginFailed, description: String(error), variant: "destructive" });
    }
  };

  const handleAppleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin
    });
    if (error) {
      toast({ title: t.common.loginFailed, description: String(error), variant: "destructive" });
    }
  };

  // INP fix: wrap non-urgent state updates in startTransition so they
  // don't block the next frame (keeps input latency < 200 ms)
  const openAuth = useCallback((tab: string = "login") => {
    startTransition(() => {
      setAuthTab(tab);
      setAuthOpen(true);
    });
  }, [startTransition]);
  return (
    <div className="min-h-screen bg-background text-foreground scan-line">
      <SEOHead
        title="ATS Pro Resume Builder — Free AI Resume Builder for ATS Success"
        description="Build ATS-optimized resumes in minutes with ATS Pro Resume Builder. Free AI resume grader, recruiter job board, one-click tailoring, and 8+ professional templates. Land 3× more interviews."
        canonical="https://atsproresumebuilder.com/"
        keywords="ATS resume builder, AI resume grader, free resume builder, ATS-friendly resume, resume templates, job application tracker, recruiter job board, cover letter generator" />


      {/* Navbar — clean minimal */}
      <nav className="sticky top-0 z-50 border-b border-primary/20 bg-background/95 backdrop-blur-xl glow-border">
        <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img alt="ATS Pro Resume Builder" className="h-12 md:h-[64px] dark:invert dark:brightness-200" width={64} height={64} src="/lovable-uploads/3547645a-93de-4a6f-b9b2-bea04540248d.png" fetchPriority="high" />
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <div className="relative group">
              <button className="flex items-center gap-1 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
                {t.landing.resumeTemplates} <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
              </button>
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                <div className="w-[560px] max-h-[70vh] overflow-y-auto rounded-xl border border-border/60 bg-card shadow-xl shadow-foreground/5 p-4">
                  <Suspense fallback={<div className="h-40 flex items-center justify-center text-xs text-muted-foreground">Loading templates…</div>}>
                    <TemplateDropdownContent onSelect={() => openAuth("signup")} />
                  </Suspense>
                </div>
              </div>
            </div>
            <button onClick={() => openAuth("login")} className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">{t.nav.jobTracker}</button>
            <button onClick={() => openAuth("login")} className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">{t.nav.jobBoard}</button>
            <Link to="/blog" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">{t.nav.blog}</Link>
            <Link to="/about" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">{t.nav.about}</Link>
            <button onClick={() => pricingRef.current?.scrollIntoView({ behavior: "smooth" })} className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">{t.nav.pricing}</button>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <LanguageSwitcher className="hidden md:inline-flex w-[110px] h-8 text-xs" />
            <Button variant="ghost" size="sm" className="hidden md:inline-flex font-medium text-[13px]" onClick={() => openAuth("login")}>{t.nav.logIn}</Button>
            <Button size="sm" className="font-semibold text-xs rounded-lg px-3 md:px-4 h-8 md:h-9 md:text-[13px]" onClick={() => openAuth("signup")}>{t.nav.getStarted}</Button>
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen &&
        <div className="md:hidden border-t border-border/60 bg-background px-3 py-2 space-y-0.5 slide-in-composited">
            <button onClick={() => {openAuth("signup");setMobileMenuOpen(false);}} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition">{t.landing.resumeTemplates}</button>
            <button onClick={() => {openAuth("login");setMobileMenuOpen(false);}} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition">{t.nav.jobTracker}</button>
            <button onClick={() => {openAuth("login");setMobileMenuOpen(false);}} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition">{t.nav.jobBoard}</button>
            <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition">{t.nav.blog}</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition">{t.nav.about}</Link>
            <button onClick={() => {pricingRef.current?.scrollIntoView({ behavior: "smooth" });setMobileMenuOpen(false);}} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition">{t.nav.pricing}</button>
            <div className="pt-2 border-t border-border/60 flex items-center gap-2">
              <LanguageSwitcher className="w-[110px] h-8 text-xs" />
              <Button variant="ghost" size="sm" className="font-medium" onClick={() => {openAuth("login");setMobileMenuOpen(false);}}>{t.nav.logIn}</Button>
            </div>
          </div>
        }
      </nav>

      {/* Hero — sci-fi grid bg */}
      <section className="relative overflow-hidden py-14 md:py-40 grid-bg">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        {/* Geometric hex decorations */}
        <div className="absolute top-20 left-10 -z-10 w-32 h-32 border border-primary/10 rotate-45 animate-hud-flicker" />
        <div className="absolute bottom-20 right-10 -z-10 w-24 h-24 border border-primary/10 rotate-12 animate-hud-flicker" />
        <div className="absolute top-1/2 left-1/4 -z-10 w-60 h-60 rounded-full bg-primary/5 blur-[80px]" />
        <div className="mx-auto max-w-3xl px-5 text-center">
          <div className="mb-5 md:mb-8 inline-flex items-center gap-2 border border-primary/30 bg-primary/5 px-4 py-2 text-[11px] md:text-xs font-semibold text-primary glow-border font-mono uppercase tracking-widest">
            <span className="inline-block h-2 w-2 rounded-full bg-success animate-pulse-dot" />
            {t.landing.heroTagline}
          </div>
          <h1 className="font-display text-[1.85rem] font-extrabold leading-[1.1] tracking-tight sm:text-[2.25rem] md:text-[3.75rem] neon-text">
            {t.landing.heroTitle}{" "}
            <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">{t.landing.heroHighlight}</span>
          </h1>
          <p className="mx-auto mt-5 md:mt-7 max-w-xl text-[13px] leading-relaxed text-muted-foreground md:text-base px-2 sm:px-0">
            {t.landing.heroDesc}
          </p>
          <div className="mt-7 md:mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row px-1">
            <Button size="lg" className="gap-2 px-7 md:px-9 font-bold w-full sm:w-auto text-sm md:text-base h-12 md:h-13 sci-fi-clip" onClick={() => openAuth("signup")}>
              {t.landing.buildFreeResume} <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="gap-2 px-7 md:px-9 font-bold w-full sm:w-auto text-sm md:text-base h-12 md:h-13 sci-fi-clip" onClick={() => openAuth("signup")}>
              <Upload className="h-4 w-4" /> {t.landing.uploadResume}
            </Button>
          </div>
          <div className="mt-7 md:mt-10 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-[11px] md:text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-success" /> {t.landing.atsFriendly}</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-success" /> {t.landing.reviews}</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-success" /> {t.landing.resumesBuilt}</span>
          </div>
        </div>
      </section>

      {/* Features — sci-fi cards */}
      <section className="py-14 md:py-28 grid-bg">
          <div className="mx-auto max-w-7xl px-5 md:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2 md:mb-3">{t.landing.features}</p>
            <h2 className="font-display text-xl font-extrabold tracking-tight md:text-4xl">{t.landing.featuresTitle}</h2>
            <p className="mx-auto mt-3 md:mt-4 max-w-lg text-[13px] md:text-sm text-muted-foreground">
              {t.landing.featuresDesc}
            </p>
          </div>
          <div className="mt-10 md:mt-14 grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
            { icon: <BarChart3 className="h-5 w-5" />, title: t.landing.aiGrader, desc: t.landing.aiGraderDesc, color: "bg-primary/10 text-primary" },
            { icon: <Sparkles className="h-5 w-5" />, title: t.landing.oneClickTailor, desc: t.landing.oneClickTailorDesc, color: "bg-accent/20 text-accent-foreground" },
            { icon: <LayoutTemplate className="h-5 w-5" />, title: t.landing.atsTemplates, desc: t.landing.atsTemplatesDesc, color: "bg-info/10 text-info" },
            { icon: <Briefcase className="h-5 w-5" />, title: t.landing.recruiterPortal, desc: t.landing.recruiterPortalDesc, color: "bg-success/10 text-success" }].
            map((f) =>
            <div key={f.title} className="sci-fi-hover border border-primary/20 bg-card p-5 md:p-6 sci-fi-clip glow-border corner-brackets">
                <div className={`mb-3 md:mb-4 flex h-10 w-10 md:h-11 md:w-11 items-center justify-center ${f.color}`}>{f.icon}</div>
                <h3 className="mb-1.5 text-sm md:text-base font-bold font-display tracking-wide">{f.title}</h3>
                <p className="text-[11px] md:text-[13px] leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* AI Apply Feature Section */}
      <section className="border-t border-primary/20 py-14 md:py-24 grid-bg">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            {/* Left: content */}
            <div>
              <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/10 px-3 py-1 text-primary text-xs font-semibold mb-4 font-mono uppercase tracking-wider glow-border">
                <Sparkles className="h-3.5 w-3.5" /> {lx.newFeature}
              </div>
              <h2 className="font-display text-xl font-extrabold tracking-tight md:text-3xl mb-3">
                {lx.aiApplyTitle}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mb-6" dangerouslySetInnerHTML={{ __html: lx.aiApplyDesc }} />
              <ul className="space-y-3 mb-8">
                {[lx.aiApplyF1, lx.aiApplyF2, lx.aiApplyF3, lx.aiApplyF4, lx.aiApplyF5].map((item) =>
                <li key={item} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                )}
              </ul>
              <Button className="gap-2 rounded-lg font-semibold shadow-md shadow-primary/20" onClick={() => openAuth("signup")}>
                {lx.tryAiApply} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Right: visual cards */}
            <div className="flex flex-col gap-3">
              {/* Queue preview card */}
              <div className="border border-primary/20 bg-card p-4 sci-fi-clip glow-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                   <span className="text-sm font-semibold">{lx.aiApplyQueue}</span>
                   <span className="ml-auto text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">{lx.matches}</span>
                </div>
                {[
                { title: "Senior Frontend Engineer", company: "Stripe", score: 94, status: lx.tailored },
                { title: "React Developer", company: "Vercel", score: 91, status: lx.coverLetterReady },
                { title: "Full Stack Engineer", company: "Linear", score: 88, status: lx.readyToApply }].
                map((job) =>
                <div key={job.title} className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold truncate">{job.title}</p>
                      <p className="text-[11px] text-muted-foreground">{job.company}</p>
                    </div>
                    <span className="text-[11px] font-bold text-primary font-mono">{job.score}%</span>
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium whitespace-nowrap">{job.status}</span>
                  </div>
                )}
              </div>

              {/* Progress step card */}
              <div className="border border-primary/20 bg-card p-4 sci-fi-clip glow-border">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 font-mono">{lx.liveProgress}</p>
                <div className="space-y-2">
                  {[
                  { step: lx.searchingJobs, done: true },
                  { step: lx.matchingResume, done: true },
                  { step: lx.tailoringResume, done: true },
                  { step: lx.generatingCoverLetters, done: false }].
                  map((s) =>
                  <div key={s.step} className="flex items-center gap-2.5">
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${s.done ? "bg-primary" : "border-2 border-primary animate-pulse"}`}>
                        {s.done && <CheckCircle className="h-2.5 w-2.5 text-primary-foreground" />}
                      </div>
                      <span className={`text-[12px] ${s.done ? "text-foreground" : "text-primary font-medium"}`}>{s.step}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Resumes Fail */}
      <section className="border-t border-primary/20 bg-secondary/30 py-16 md:py-24 grid-bg">
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:gap-16 px-4 md:px-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-3 font-mono neon-text">{t.landing.theProblem}</p>
            <h2 className="font-display text-xl font-extrabold tracking-tight md:text-3xl">
              {t.landing.whyFailTitle}
            </h2>
            <ul className="mt-8 space-y-5">
              {[
              { icon: <AlertTriangle className="h-4 w-4 text-warning" />, title: t.landing.genericKeywords, desc: t.landing.genericKeywordsDesc },
              { icon: <XCircle className="h-4 w-4 text-destructive" />, title: t.landing.missingKeywords, desc: t.landing.missingKeywordsDesc },
              { icon: <FileWarning className="h-4 w-4 text-destructive" />, title: t.landing.poorReadability, desc: t.landing.poorReadabilityDesc }].
              map((item) =>
              <li key={item.title} className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-destructive/10">{item.icon}</div>
                  <div>
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">{item.desc}</p>
                  </div>
                </li>
              )}
            </ul>
            <Button className="gap-2 rounded-lg font-semibold mt-8 shadow-md shadow-primary/20" onClick={() => openAuth("signup")}>
              {t.landing.fixResume} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-primary/20 py-12 md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-2 md:mb-3 font-mono neon-text">{t.landing.testimonials}</p>
            <h2 className="font-display text-xl font-extrabold tracking-tight md:text-3xl">{t.landing.lovedBy}</h2>
          </div>

          {/* Stats */}
          <div className="mt-8 md:mt-10 grid grid-cols-2 gap-2.5 md:gap-3 md:grid-cols-4">
            {[
            { value: "10,000+", label: t.landing.activeUsers },
            { value: "4.8/5", label: t.landing.averageRating },
            { value: "3×", label: t.landing.moreInterviews },
            { value: "1M+", label: t.landing.resumesBuiltStat }].
            map((s) =>
            <div key={s.label} className="border border-primary/20 bg-card p-3 md:p-4 text-center sci-fi-clip glow-border corner-brackets">
                <p className="text-lg md:text-xl font-extrabold text-primary font-mono neon-text">{s.value}</p>
                <p className="mt-0.5 md:mt-1 text-[10px] md:text-[11px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            )}
          </div>

          {/* Review cards */}
          <div className="mt-8 md:mt-10 grid gap-3 md:gap-4 md:grid-cols-3">
            {[
            { name: "Sarah M.", role: "Software Engineer → Google", text: "After using ATS Pro's resume grader, I got 5 interviews in 2 weeks — including one at Google.", stars: 5 },
            { name: "James R.", role: "Marketing Manager → HubSpot", text: "The one-click tailoring feature is a game-changer. I paste the job description and get a perfectly optimized version in seconds.", stars: 5 },
            { name: "Priya K.", role: "Recent Graduate → Deloitte", text: "ATS Pro helped me restructure everything and I landed my first consulting role within a month.", stars: 5 },
            { name: "David L.", role: "Data Analyst → Amazon", text: "My resume score went from 45 to 92, and suddenly I was getting recruiter messages on LinkedIn every week.", stars: 5 },
            { name: "Emily T.", role: "Product Designer → Figma", text: "Clean templates that actually pass ATS scans. Combined with the cover letter generator — the only tool I recommend.", stars: 5 },
            { name: "Carlos V.", role: "Career Changer → Salesforce", text: "The AI rewrote my bullet points to highlight transferable skills. Within 6 weeks, I had three offers on the table.", stars: 5 }].
            map((review) =>
            <div key={review.name} className="sci-fi-hover border border-primary/20 bg-card p-4 md:p-5 sci-fi-clip glow-border">
                <div className="flex gap-0.5 mb-2 md:mb-3">
                  {Array.from({ length: review.stars }).map((_, i) =>
                <Star key={i} className="h-3 w-3 md:h-3.5 md:w-3.5 fill-warning text-warning" />
                )}
                </div>
                <p className="text-[12px] md:text-[13px] leading-relaxed text-muted-foreground">{review.text}</p>
                <div className="mt-3 md:mt-4 flex items-center gap-2.5 md:gap-3">
                  <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-md bg-primary/10 text-[11px] md:text-xs font-bold text-primary">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[12px] md:text-[13px] font-semibold">{review.name}</p>
                    <p className="text-[10px] md:text-[11px] text-muted-foreground">{review.role}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* For Recruiters CTA */}
      <section className="border-t border-primary/20 bg-secondary/30 py-16 md:py-24 grid-bg">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-3 font-mono neon-text">{t.landing.forRecruiters}</p>
              <h2 className="font-display text-xl font-extrabold tracking-tight md:text-3xl">
                {t.landing.postJobsTitle}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md">
                {t.landing.postJobsDesc}
              </p>
              <ul className="mt-6 space-y-3">
                {[
                t.landing.postUnlimited,
                t.landing.reachSeekers,
                t.landing.manageFromDashboard,
                t.landing.closeReopen].
                map((item) =>
                <li key={item} className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                    {item}
                  </li>
                )}
              </ul>
              <Button className="gap-2 rounded-lg font-semibold mt-8 shadow-md shadow-primary/20" onClick={() => openAuth("signup")}>
                {t.landing.startHiring} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
              { value: "10K+", label: t.landing.activeJobSeekers, icon: <Users className="h-5 w-5" /> },
              { value: t.landing.free, label: t.landing.freeToPost, icon: <Briefcase className="h-5 w-5" /> },
              { value: t.landing.instant, label: t.landing.instantVisibility, icon: <Sparkles className="h-5 w-5" /> },
              { value: t.landing.easy, label: t.landing.easyManagement, icon: <LayoutTemplate className="h-5 w-5" /> }].
              map((s) =>
              <div key={s.label} className="border border-primary/20 bg-card p-5 text-center sci-fi-clip glow-border corner-brackets">
                  <div className="flex justify-center mb-2 text-primary">{s.icon}</div>
                  <p className="text-lg font-extrabold text-primary font-mono">{s.value}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="border-t border-primary/20 bg-secondary/30 py-16 md:py-24 grid-bg">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{pricingExtraTranslations[locale].launchOffer}</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-3 font-mono">{lx.pricingTag}</p>
            <h2 className="font-display text-xl font-extrabold tracking-tight md:text-3xl">{lx.pricingTitle}</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">{lx.pricingDesc}</p>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-start">
            {/* FREE PLAN */}
            <div className="border border-primary/20 bg-card p-6 md:p-8 flex flex-col h-full sci-fi-clip glow-border">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{lx.freePlan}</p>
              <div className="mb-1">
                <span className="text-4xl font-extrabold">{localCurrency.formatPrice(0)}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">{lx.freeDesc}</p>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  { text: lx.createEditResumes, included: true },
                  { text: lx.allTemplates, included: true },
                  { text: lx.pdfDownloadUpload, included: true },
                  { text: lx.jobTrackerLimit, included: true },
                  { text: lx.coverLetterGen, included: false },
                  { text: lx.emailOutreach, included: false },
                  { text: lx.aiGradingScoring, included: false },
                  { text: lx.aiOneClickTailoring, included: false },
                ].map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5 text-sm">
                    {f.included ? (
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                    )}
                    <span className={!f.included ? "text-muted-foreground/50 line-through" : ""}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Button variant="outline" className="w-full" onClick={() => openAuth("signup")}>
                {lx.getStartedFree}
              </Button>
            </div>

            {/* PRO PLAN */}
            <div className="border-2 border-primary bg-card p-6 md:p-8 flex flex-col relative h-full sci-fi-clip glow-border-strong corner-brackets">
              <div className="absolute -top-3 right-4 bg-destructive text-destructive-foreground px-3 py-1 text-xs font-bold rounded-full">
                {pricingExtraTranslations[locale].launchBadge}
              </div>

              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-5 w-5 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{lx.proPlan}</p>
              </div>

              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold">{localCurrency.formatProPrice(pricingDuration)}</span>
                <span className="text-base text-muted-foreground line-through">{localCurrency.formatOriginalPrice(pricingDuration)}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                {pricingDuration === "weekly" ? pricingExtraTranslations[locale].per7Days : pricingDuration === "biweekly" ? pricingExtraTranslations[locale].per14Days : lx.perMonth}
              </p>

              {/* Duration tabs */}
              <div className="flex rounded-lg bg-muted p-1 mb-6">
                {([
                  { key: "weekly" as const, label: pricingExtraTranslations[locale].weeklyPlan },
                  { key: "biweekly" as const, label: pricingExtraTranslations[locale].biweeklyPlan },
                  { key: "monthly" as const, label: lx.proPlan },
                ]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setPricingDuration(tab.key)}
                    className={`flex-1 text-xs font-semibold py-2 px-2 rounded-md transition-all ${
                      pricingDuration === tab.key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {[
                  lx.unlimitedResumes,
                  lx.allPremiumTemplates,
                  lx.aiGradingScoring,
                  lx.aiOneClickTailoring,
                  lx.aiCoverLetter,
                  lx.unlimitedJobTracking,
                  lx.emailOutreach,
                  lx.interviewPrepFeature,
                  lx.pinTrackCompanies,
                  lx.aiJobSearchMatching,
                  ...(pricingDuration === "monthly" ? [lx.prioritySupport] : []),
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-start gap-2 rounded-lg bg-accent/50 border border-accent p-3 mb-4">
                <Gift className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-foreground">{pricingExtraTranslations[locale].bonusFeatures}</p>
                  <p className="text-[11px] text-muted-foreground">{pricingExtraTranslations[locale].bonusDesc}</p>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  const links: Record<string, string> = {
                    weekly: "https://nas.io/muzamils-business-2/zerolink/7day-pro",
                    biweekly: "https://nas.io/muzamils-business-2/zerolink/14day-pro",
                    monthly: "https://nas.io/muzamils-business-2/zerolink/monthly-pro",
                  };
                  window.open(links[pricingDuration], "_blank");
                }}
              >
                Subscribe Now
              </Button>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-xs text-muted-foreground">We accept: Visa, Mastercard, UPI, PayPal & more</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-primary/20 bg-secondary/30 py-16 md:py-24">
        <div className="mx-auto max-w-2xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-3 font-mono text-center neon-text">{t.landing.faq}</p>
          <h2 className="font-display mb-8 md:mb-10 text-center text-xl font-extrabold tracking-tight md:text-3xl">{t.landing.faqTitle}</h2>
          <Accordion type="single" collapsible className="w-full">
            {[
            { q: t.landing.faq1q, a: t.landing.faq1a },
            { q: t.landing.faq2q, a: t.landing.faq2a },
            { q: t.landing.faq3q, a: t.landing.faq3a },
            { q: t.landing.faq4q, a: t.landing.faq4a },
            { q: t.landing.faq5q, a: t.landing.faq5a },
            { q: t.landing.faq6q, a: t.landing.faq6a },
            { q: t.landing.faq7q, a: t.landing.faq7a },
            { q: t.landing.faq8q, a: t.landing.faq8a }].
            map((item, i) =>
            <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">{item.q}</AccordionTrigger>
                <AccordionContent className="text-[13px] text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </section>


      {/* Auth Dialog — only mount when opened to reduce DOM nodes */}
      {(authOpen || forgotOpen) && <>
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img src="/lovable-uploads/3547645a-93de-4a6f-b9b2-bea04540248d.png" alt="ATS Pro Resume Builder" className="h-16 dark:invert dark:brightness-200" width={64} height={64} />
            </DialogTitle>
          </DialogHeader>
          <Tabs value={authTab} onValueChange={setAuthTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t.nav.logIn}</TabsTrigger>
              <TabsTrigger value="signup">{t.nav.signUp}</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="lp-login-email">{t.common.email}</Label>
                  <Input id="lp-login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lp-login-password">{t.common.password}</Label>
                  <div className="relative">
                    <Input id="lp-login-password" type={showLoginPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" />
                    <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => {setForgotEmail(email);setForgotOpen(true);}}>

                    Forgot password?
                  </button>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t.common.signingIn : t.common.signIn}
                </Button>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">{t.auth.orContinueWith}</span></div>
                </div>
                <Button type="button" variant="outline" className="w-full gap-2" onClick={handleGoogleSignIn}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                  {t.auth.continueWithGoogle}
                </Button>
                <Button type="button" variant="outline" className="w-full gap-2" onClick={handleAppleSignIn}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                  {t.auth.continueWithApple}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="lp-signup-name">{t.common.displayName}</Label>
                  <Input id="lp-signup-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lp-signup-email">{t.common.email}</Label>
                  <Input id="lp-signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lp-signup-password">{t.common.password}</Label>
                  <div className="relative">
                    <Input id="lp-signup-password" type={showSignupPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="pr-10" />
                    <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <ul className="mt-1.5 space-y-1 text-[11px] text-muted-foreground">
                    <li className={`flex items-center gap-1 ${password.length >= 6 ? "text-primary" : ""}`}>
                      {password.length >= 6 ? <CheckCircle className="h-3 w-3" /> : <span className="h-3 w-3 rounded-full border border-muted-foreground/40 inline-block" />} At least 6 characters
                    </li>
                    <li className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? "text-primary" : ""}`}>
                      {/[A-Z]/.test(password) ? <CheckCircle className="h-3 w-3" /> : <span className="h-3 w-3 rounded-full border border-muted-foreground/40 inline-block" />} One uppercase letter
                    </li>
                    <li className={`flex items-center gap-1 ${/[0-9]/.test(password) ? "text-primary" : ""}`}>
                      {/[0-9]/.test(password) ? <CheckCircle className="h-3 w-3" /> : <span className="h-3 w-3 rounded-full border border-muted-foreground/40 inline-block" />} One number
                    </li>
                  </ul>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t.common.creatingAccount : t.common.createAccount}
                </Button>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">{t.auth.orContinueWith}</span></div>
                </div>
                <Button type="button" variant="outline" className="w-full gap-2" onClick={handleGoogleSignIn}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                  {t.auth.continueWithGoogle}
                </Button>
                <Button type="button" variant="outline" className="w-full gap-2" onClick={handleAppleSignIn}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                  {t.auth.continueWithApple}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setForgotLoading(true);
              try {
                const res = await supabase.functions.invoke("send-email", {
                  body: {
                    type: "password_reset",
                    email: forgotEmail,
                    redirectTo: `${window.location.origin}/reset-password`
                  }
                });
                if (res.error) throw res.error;
                toast({ title: "Check your email", description: "We sent you a password reset link." });
                setForgotOpen(false);
              } catch (err: any) {
                toast({ title: "Error", description: err.message || "Failed to send reset email", variant: "destructive" });
              }
              setForgotLoading(false);
            }}
            className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="forgot-email">{t.common.email}</Label>
              <Input
                id="forgot-email"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required />

            </div>
            <Button type="submit" className="w-full" disabled={forgotLoading}>
              {forgotLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      </>}
    </div>);

};

export default Index;