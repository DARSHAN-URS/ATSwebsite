import { useState, useEffect, useRef, lazy, Suspense, useTransition, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowRight, Upload, BarChart3, Sparkles, LayoutTemplate, AlertTriangle, XCircle, FileWarning, CheckCircle, Star, Briefcase, Users, Menu, X, Crown, Zap, XIcon, Eye, EyeOff, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import logo from "@/assets/logo.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import dashboardPreview from "@/assets/dashboard-preview.png";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SEOHead from "@/components/SEOHead";
import { useLocalCurrency } from "@/hooks/useLocalCurrency";

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
  const { t } = useLanguage();
  const [, startTransition] = useTransition();

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
        data: { display_name: displayName },
      },
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
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: t.common.loginFailed, description: String(error), variant: "destructive" });
    }
  };

  const handleAppleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
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
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="ATS Pro Resume Builder — Free AI Resume Builder for ATS Success"
        description="Build ATS-optimized resumes in minutes with ATS Pro Resume Builder. Free AI resume grader, recruiter job board, one-click tailoring, and 8+ professional templates. Land 3× more interviews."
        canonical="https://atsproresumebuilder.com/"
        keywords="ATS resume builder, AI resume grader, free resume builder, ATS-friendly resume, resume templates, job application tracker, recruiter job board, cover letter generator"
      />

      {/* Navbar — clean minimal */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="ATS Pro Resume Builder" className="h-12 md:h-[64px] dark:invert dark:brightness-200" width={64} height={64} />
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
            <Link to="/blog" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">Blog</Link>
            <Link to="/about" className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">About</Link>
            <button onClick={() => pricingRef.current?.scrollIntoView({ behavior: "smooth" })} className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">Pricing</button>
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
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/60 bg-background px-3 py-2 space-y-0.5 slide-in-composited">
            <button onClick={() => { openAuth("signup"); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition">{t.landing.resumeTemplates}</button>
            <button onClick={() => { openAuth("login"); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition">{t.nav.jobTracker}</button>
            <button onClick={() => { openAuth("login"); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition">{t.nav.jobBoard}</button>
            <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition">Blog</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition">About</Link>
            <button onClick={() => { pricingRef.current?.scrollIntoView({ behavior: "smooth" }); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition">Pricing</button>
            <div className="pt-2 border-t border-border/60 flex items-center gap-2">
              <LanguageSwitcher className="w-[110px] h-8 text-xs" />
              <Button variant="ghost" size="sm" className="font-medium" onClick={() => { openAuth("login"); setMobileMenuOpen(false); }}>{t.nav.logIn}</Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero — geometric accent line */}
      <section className="relative overflow-hidden py-12 md:py-36">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(36_15%_88%/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(36_15%_88%/0.4)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full bg-primary/[0.04] blur-3xl" />
        <div className="mx-auto max-w-3xl px-5 text-center">
          <div className="mb-4 md:mb-7 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-[11px] md:text-xs font-medium text-muted-foreground shadow-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
            {t.landing.heroTagline}
          </div>
          <h1 className="font-serif text-[1.75rem] font-bold leading-[1.15] tracking-tight sm:text-[2rem] md:text-[3.5rem]">
            {t.landing.heroTitle}{" "}
            <span className="italic">{t.landing.heroHighlight}</span>
          </h1>
          <p className="mx-auto mt-4 md:mt-6 max-w-xl text-[13px] leading-relaxed text-muted-foreground md:text-base px-2 sm:px-0">
            {t.landing.heroDesc}
          </p>
          <div className="mt-6 md:mt-10 flex flex-col items-center justify-center gap-2.5 sm:flex-row px-1">
            <Button size="lg" className="gap-2 rounded-lg px-6 md:px-8 font-semibold w-full sm:w-auto shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-shadow text-sm md:text-base h-11 md:h-12" onClick={() => openAuth("signup")}>
              {t.landing.buildFreeResume} <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="gap-2 rounded-lg px-6 md:px-8 font-semibold w-full sm:w-auto text-sm md:text-base h-11 md:h-12" onClick={() => openAuth("signup")}>
              <Upload className="h-4 w-4" /> {t.landing.uploadResume}
            </Button>
          </div>
          <div className="mt-6 md:mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-8 text-[11px] md:text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 md:h-3.5 md:w-3.5 text-success" /> {t.landing.atsFriendly}</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 md:h-3.5 md:w-3.5 text-success" /> {t.landing.reviews}</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 md:h-3.5 md:w-3.5 text-success" /> {t.landing.resumesBuilt}</span>
          </div>
        </div>
      </section>

      {/* Features — clean cards with subtle left accent */}
      <section className="border-t border-border/60 py-12 md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-2 md:mb-3 font-mono">{t.landing.features}</p>
            <h2 className="font-serif text-lg font-bold tracking-tight md:text-3xl">{t.landing.featuresTitle}</h2>
            <p className="mx-auto mt-2 md:mt-3 max-w-lg text-[13px] md:text-sm text-muted-foreground">
              {t.landing.featuresDesc}
            </p>
          </div>
          <div className="mt-8 md:mt-12 grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <BarChart3 className="h-5 w-5" />, title: t.landing.aiGrader, desc: t.landing.aiGraderDesc },
              { icon: <Sparkles className="h-5 w-5" />, title: t.landing.oneClickTailor, desc: t.landing.oneClickTailorDesc },
              { icon: <LayoutTemplate className="h-5 w-5" />, title: t.landing.atsTemplates, desc: t.landing.atsTemplatesDesc },
              { icon: <Briefcase className="h-5 w-5" />, title: t.landing.recruiterPortal, desc: t.landing.recruiterPortalDesc },
            ].map((f) => (
              <div key={f.title} className="card-lift rounded-xl border border-border/60 bg-card p-4 md:p-5">
                <div className="mb-2 md:mb-3 flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">{f.icon}</div>
                <h3 className="mb-1 text-[13px] md:text-sm font-semibold">{f.title}</h3>
                <p className="text-[11px] md:text-[13px] leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Apply Feature Section */}
      <section className="border-t border-border/60 py-14 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            {/* Left: content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary text-xs font-semibold mb-4">
                <Sparkles className="h-3.5 w-3.5" /> New Feature
              </div>
              <h2 className="font-serif text-xl font-bold tracking-tight md:text-3xl mb-3">
                AI Apply — Let AI Apply to Jobs For You
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mb-6">
                Select a resume, hit <strong>AI Apply</strong>, and our AI instantly finds your top 10 job matches, tailors your resume, and generates a custom cover letter — all in one click.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  { label: "Finds your top 10 matching jobs automatically" },
                  { label: "Tailors your resume for each specific role" },
                  { label: "Generates a professional cover letter per job" },
                  { label: "One-click Apply & Track — logs status instantly" },
                  { label: "Real-time progress with live stage updates" },
                ].map((item) => (
                  <li key={item.label} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {item.label}
                  </li>
                ))}
              </ul>
              <Button className="gap-2 rounded-lg font-semibold shadow-md shadow-primary/20" onClick={() => openAuth("signup")}>
                Try AI Apply Free <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Right: visual cards */}
            <div className="flex flex-col gap-3">
              {/* Queue preview card */}
              <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold">AI Apply Queue</span>
                  <span className="ml-auto text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">10 matches</span>
                </div>
                {[
                  { title: "Senior Frontend Engineer", company: "Stripe", score: 94, status: "Tailored" },
                  { title: "React Developer", company: "Vercel", score: 91, status: "Cover Letter Ready" },
                  { title: "Full Stack Engineer", company: "Linear", score: 88, status: "Ready to Apply" },
                ].map((job) => (
                  <div key={job.title} className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold truncate">{job.title}</p>
                      <p className="text-[11px] text-muted-foreground">{job.company}</p>
                    </div>
                    <span className="text-[11px] font-bold text-primary font-mono">{job.score}%</span>
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium whitespace-nowrap">{job.status}</span>
                  </div>
                ))}
              </div>

              {/* Progress step card */}
              <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Live Progress</p>
                <div className="space-y-2">
                  {[
                    { step: "Searching jobs", done: true },
                    { step: "Matching to your resume", done: true },
                    { step: "Tailoring resume for each role", done: true },
                    { step: "Generating cover letters", done: false },
                  ].map((s) => (
                    <div key={s.step} className="flex items-center gap-2.5">
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${s.done ? "bg-primary" : "border-2 border-primary animate-pulse"}`}>
                        {s.done && <CheckCircle className="h-2.5 w-2.5 text-primary-foreground" />}
                      </div>
                      <span className={`text-[12px] ${s.done ? "text-foreground" : "text-primary font-medium"}`}>{s.step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Resumes Fail */}
      <section className="border-t border-border/60 bg-secondary/30 py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:gap-16 px-4 md:px-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-3 font-mono">{t.landing.theProblem}</p>
            <h2 className="font-serif text-xl font-bold tracking-tight md:text-3xl">
              {t.landing.whyFailTitle}
            </h2>
            <ul className="mt-8 space-y-5">
              {[
                { icon: <AlertTriangle className="h-4 w-4 text-warning" />, title: t.landing.genericKeywords, desc: t.landing.genericKeywordsDesc },
                { icon: <XCircle className="h-4 w-4 text-destructive" />, title: t.landing.missingKeywords, desc: t.landing.missingKeywordsDesc },
                { icon: <FileWarning className="h-4 w-4 text-destructive" />, title: t.landing.poorReadability, desc: t.landing.poorReadabilityDesc },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-destructive/10">{item.icon}</div>
                  <div>
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Button className="gap-2 rounded-lg font-semibold mt-8 shadow-md shadow-primary/20" onClick={() => openAuth("signup")}>
              {t.landing.fixResume} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-border/60 shadow-2xl shadow-foreground/5">
              <img src={dashboardPreview} alt="ATS Pro Resume Builder dashboard" className="w-full" loading="eager" fetchPriority="high" width={1200} height={675} />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border/60 py-12 md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-2 md:mb-3 font-mono">{t.landing.testimonials}</p>
            <h2 className="font-serif text-lg font-bold tracking-tight md:text-3xl">{t.landing.lovedBy}</h2>
          </div>

          {/* Stats */}
          <div className="mt-8 md:mt-10 grid grid-cols-2 gap-2.5 md:gap-3 md:grid-cols-4">
            {[
              { value: "10,000+", label: t.landing.activeUsers },
              { value: "4.8/5", label: t.landing.averageRating },
              { value: "3×", label: t.landing.moreInterviews },
              { value: "1M+", label: t.landing.resumesBuiltStat },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border/60 bg-card p-3 md:p-4 text-center">
                <p className="text-lg md:text-xl font-extrabold text-primary font-mono">{s.value}</p>
                <p className="mt-0.5 md:mt-1 text-[10px] md:text-[11px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Review cards */}
          <div className="mt-8 md:mt-10 grid gap-3 md:gap-4 md:grid-cols-3">
            {[
              { name: "Sarah M.", role: "Software Engineer → Google", text: "After using ATS Pro's resume grader, I got 5 interviews in 2 weeks — including one at Google.", stars: 5 },
              { name: "James R.", role: "Marketing Manager → HubSpot", text: "The one-click tailoring feature is a game-changer. I paste the job description and get a perfectly optimized version in seconds.", stars: 5 },
              { name: "Priya K.", role: "Recent Graduate → Deloitte", text: "ATS Pro helped me restructure everything and I landed my first consulting role within a month.", stars: 5 },
              { name: "David L.", role: "Data Analyst → Amazon", text: "My resume score went from 45 to 92, and suddenly I was getting recruiter messages on LinkedIn every week.", stars: 5 },
              { name: "Emily T.", role: "Product Designer → Figma", text: "Clean templates that actually pass ATS scans. Combined with the cover letter generator — the only tool I recommend.", stars: 5 },
              { name: "Carlos V.", role: "Career Changer → Salesforce", text: "The AI rewrote my bullet points to highlight transferable skills. Within 6 weeks, I had three offers on the table.", stars: 5 },
            ].map((review) => (
              <div key={review.name} className="card-lift rounded-xl border border-border/60 bg-card p-4 md:p-5">
                <div className="flex gap-0.5 mb-2 md:mb-3">
                  {Array.from({ length: review.stars }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 md:h-3.5 md:w-3.5 fill-warning text-warning" />
                  ))}
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
            ))}
          </div>
        </div>
      </section>

      {/* For Recruiters CTA */}
      <section className="border-t border-border/60 bg-secondary/30 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-10 md:grid-cols-2 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-3 font-mono">{t.landing.forRecruiters}</p>
              <h2 className="font-serif text-xl font-bold tracking-tight md:text-3xl">
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
                  t.landing.closeReopen,
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
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
                { value: t.landing.easy, label: t.landing.easyManagement, icon: <LayoutTemplate className="h-5 w-5" /> },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border/60 bg-card p-5 text-center">
                  <div className="flex justify-center mb-2 text-primary">{s.icon}</div>
                  <p className="text-lg font-extrabold text-primary font-mono">{s.value}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="border-t border-border/60 bg-secondary/30 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-3 font-mono">Pricing</p>
            <h2 className="font-serif text-xl font-bold tracking-tight md:text-3xl">Simple, Transparent Pricing</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Build and download resumes for free. Upgrade to Pro to unlock AI-powered features and supercharge your job search.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="rounded-xl border border-border/60 bg-card p-6 md:p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Free</h3>
                  <p className="text-xs text-muted-foreground">Forever free, no card required</p>
                </div>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">{localCurrency.formatPrice(0)}</span>
                <span className="text-sm text-muted-foreground ml-1">forever</span>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {[
                  { text: "Create & edit resumes", included: true },
                  { text: "All 8+ professional templates", included: true },
                  { text: "PDF download & upload", included: true },
                  { text: "Job tracker (up to 10 jobs)", included: true },
                  { text: "Browse job board", included: true },
                  { text: "Cover letter generator", included: true },
                  { text: "AI resume grading", included: false },
                  { text: "AI one-click tailoring", included: false },
                  { text: "AI-powered job search", included: false },
                  { text: "Pin & track companies", included: false },
                  { text: "LinkedIn import", included: false },
                  { text: "Unlimited job tracking", included: false },
                ].map((f) => (
                  <li key={f.text} className="flex items-center gap-2 text-[13px]">
                    {f.included ? (
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <XIcon className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className={f.included ? "text-foreground" : "text-muted-foreground"}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full rounded-lg font-semibold" onClick={() => openAuth("signup")}>
                Get Started Free
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="relative rounded-xl border-2 border-primary bg-card p-6 md:p-8 flex flex-col shadow-lg shadow-primary/10">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg rounded-tr-[10px]">
                Most Popular
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Pro</h3>
                  <p className="text-xs text-muted-foreground">Unlock all premium features</p>
                </div>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">{localCurrency.formatProPrice()}</span>
                <span className="text-sm text-muted-foreground ml-1">/month</span>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {[
                  "Unlimited resumes",
                  "All premium templates",
                  "PDF download & upload",
                  "AI resume grading & scoring",
                  "AI one-click resume tailoring",
                  "AI bullet point & summary generation",
                  "AI cover letter generator (with AI)",
                  "AI-powered job search & matching",
                  "Pin & track companies",
                  "LinkedIn profile import",
                  "Unlimited job tracking",
                  "Priority support",
                  "Early access to new features",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px]">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full rounded-lg font-semibold shadow-md shadow-primary/20" onClick={() => openAuth("signup")}>
                Start Pro Trial <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/60 bg-secondary/30 py-16 md:py-24">
        <div className="mx-auto max-w-2xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-3 font-mono text-center">{t.landing.faq}</p>
          <h2 className="font-serif mb-8 md:mb-10 text-center text-xl font-bold tracking-tight md:text-3xl">{t.landing.faqTitle}</h2>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: t.landing.faq1q, a: t.landing.faq1a },
              { q: t.landing.faq2q, a: t.landing.faq2a },
              { q: t.landing.faq3q, a: t.landing.faq3a },
              { q: t.landing.faq4q, a: t.landing.faq4a },
            ].map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">{item.q}</AccordionTrigger>
                <AccordionContent className="text-[13px] text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer with social media */}
      <footer className="border-t border-border/60 bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-5 md:px-6 py-10 md:py-14">
          <div className="grid gap-8 md:gap-10 md:grid-cols-12">
            <div className="md:col-span-5 text-center md:text-left">
              <img src={logo} alt="ATS Pro Resume Builder" className="h-14 md:h-[64px] invert brightness-200 mx-auto md:mx-0" width={64} height={64} />
              <p className="mt-3 md:mt-4 max-w-xs text-[12px] md:text-[13px] leading-relaxed text-background/60 mx-auto md:mx-0">
                {t.landing.footerDesc}
              </p>
              {/* Social Media Icons */}
              <div className="mt-5 md:mt-6 flex items-center justify-center md:justify-start gap-2.5 md:gap-3">
                <a href="https://www.facebook.com/share/18EkeUXY8P/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg bg-background/10 text-background/60 transition hover:bg-primary hover:text-primary-foreground">
                  <svg className="h-3.5 w-3.5 md:h-4 md:w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://www.instagram.com/atsproresumebuilder?igsh=eGg2M3FmaTF5NGRw" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg bg-background/10 text-background/60 transition hover:bg-primary hover:text-primary-foreground">
                  <svg className="h-3.5 w-3.5 md:h-4 md:w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C16.67.014 16.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="https://x.com/Atspro_official" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X" className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg bg-background/10 text-background/60 transition hover:bg-primary hover:text-primary-foreground">
                  <svg className="h-3.5 w-3.5 md:h-4 md:w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://www.linkedin.com/company/ats-pro-resume-builder/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg bg-background/10 text-background/60 transition hover:bg-primary hover:text-primary-foreground">
                  <svg className="h-3.5 w-3.5 md:h-4 md:w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://www.tiktok.com/@atsproresumebuilder?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg bg-background/10 text-background/60 transition hover:bg-primary hover:text-primary-foreground">
                  <svg className="h-3.5 w-3.5 md:h-4 md:w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                </a>
              </div>
            </div>
            <div className="md:col-span-3">
              <h4 className="mb-2.5 md:mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-background/60 font-mono">{t.landing.platform}</h4>
              <ul className="space-y-2 md:space-y-2.5 text-[13px] text-background/70">
                <li><Link to="/ats-resume-builder" className="transition hover:text-background">ATS Resume Builder</Link></li>
                <li><Link to="/resume-templates" className="transition hover:text-background">Resume Templates</Link></li>
                <li><Link to="/resume-builder-for-freshers" className="transition hover:text-background">Fresher Resume Builder</Link></li>
                <li><Link to="/software-engineer-resume" className="transition hover:text-background">Engineer Resume</Link></li>
                <li><Link to="/interview-preparation" className="transition hover:text-background">Interview Preparation</Link></li>
                <li><Link to="/resume-download" className="transition hover:text-background">Resume Download</Link></li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <h4 className="mb-2.5 md:mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-background/60 font-mono">{t.landing.company}</h4>
              <ul className="space-y-2 md:space-y-2.5 text-[13px] text-background/70">
                <li><Link to="/about" className="transition hover:text-background">About</Link></li>
                <li><Link to="/blog" className="transition hover:text-background">Blog</Link></li>
                <li><Link to="/pricing" className="transition hover:text-background">Pricing</Link></li>
                <li><Link to="/privacy" className="transition hover:text-background">{t.landing.privacyPolicy}</Link></li>
                <li><Link to="/terms" className="transition hover:text-background">{t.landing.termsOfService}</Link></li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <h4 className="mb-2.5 md:mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-background/60 font-mono">{t.landing.connect}</h4>
              <ul className="space-y-2 md:space-y-2.5 text-[13px] text-background/70">
                <li><a href="https://www.facebook.com/share/18EkeUXY8P/" target="_blank" rel="noopener noreferrer" className="transition hover:text-background">Facebook</a></li>
                <li><a href="https://www.instagram.com/atsproresumebuilder?igsh=eGg2M3FmaTF5NGRw" target="_blank" rel="noopener noreferrer" className="transition hover:text-background">Instagram</a></li>
                <li><a href="https://x.com/Atspro_official" target="_blank" rel="noopener noreferrer" className="transition hover:text-background">Twitter / X</a></li>
                <li><a href="https://www.linkedin.com/company/ats-pro-resume-builder/" target="_blank" rel="noopener noreferrer" className="transition hover:text-background">LinkedIn</a></li>
                <li><a href="https://www.tiktok.com/@atsproresumebuilder?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="transition hover:text-background">TikTok</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-background/10 px-4 py-4 pb-8 md:pb-16">
          <p className="mx-auto max-w-7xl text-center text-[11px] md:text-xs text-background/60">
            © {new Date().getFullYear()} ATS Pro Resume Builder. {t.landing.copyright}
          </p>
        </div>
      </footer>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "ATS Pro Resume Builder",
            url: "https://atsproresumebuilder.com",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description: "AI-powered ATS resume builder that helps job seekers create optimized resumes, track applications, and land more interviews.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "2400", bestRating: "5" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              { "@type": "Question", name: "What is an ATS and why does it matter?", acceptedAnswer: { "@type": "Answer", text: "An Applicant Tracking System (ATS) is software used by employers to filter resumes. Over 75% of resumes are rejected before a human ever sees them. ATS Pro Resume Builder ensures your resume passes these filters." } },
              { "@type": "Question", name: "Is this AI resume builder really free?", acceptedAnswer: { "@type": "Answer", text: "Yes! You can create, edit, and download ATS-optimized resumes for free. Our AI-powered grading and tailoring features are also available at no cost." } },
              { "@type": "Question", name: "How does the AI resume grader work?", acceptedAnswer: { "@type": "Answer", text: "Our AI analyzes your resume against industry standards and specific job descriptions. It checks for keyword optimization, formatting, readability, and ATS compatibility, then provides an actionable score and suggestions." } },
              { "@type": "Question", name: "Can I import my existing LinkedIn or resume?", acceptedAnswer: { "@type": "Answer", text: "Absolutely. You can upload an existing PDF resume and our AI will parse it into an editable format, preserving your content while optimizing the structure for ATS compatibility." } },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "ATS Pro Resume Builder",
            url: "https://atsproresumebuilder.com",
            logo: "https://atsproresumebuilder.com/favicon.png",
            sameAs: [
              "https://www.facebook.com/share/18EkeUXY8P/",
              "https://www.instagram.com/atsproresumebuilder",
              "https://x.com/Atspro_official",
              "https://www.linkedin.com/company/ats-pro-resume-builder/",
              "https://www.tiktok.com/@atsproresumebuilder"
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "ATS Pro Resume Builder",
            url: "https://atsproresumebuilder.com",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://atsproresumebuilder.com/?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      {/* Auth Dialog */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img src={logo} alt="ATS Pro Resume Builder" className="h-16 dark:invert dark:brightness-200" width={64} height={64} />
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
                    onClick={() => { setForgotEmail(email); setForgotOpen(true); }}
                  >
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
                  <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  {t.auth.continueWithGoogle}
                </Button>
                <Button type="button" variant="outline" className="w-full gap-2" onClick={handleAppleSignIn}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
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
                  <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  {t.auth.continueWithGoogle}
                </Button>
                <Button type="button" variant="outline" className="w-full gap-2" onClick={handleAppleSignIn}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
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
                    redirectTo: `${window.location.origin}/reset-password`,
                  },
                });
                if (res.error) throw res.error;
                toast({ title: "Check your email", description: "We sent you a password reset link." });
                setForgotOpen(false);
              } catch (err: any) {
                toast({ title: "Error", description: err.message || "Failed to send reset email", variant: "destructive" });
              }
              setForgotLoading(false);
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
  );
};

export default Index;
