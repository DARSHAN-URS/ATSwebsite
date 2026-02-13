import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowRight, Upload, BarChart3, Sparkles, LayoutTemplate, AlertTriangle, XCircle, FileWarning, CheckCircle, Star, Quote } from "lucide-react";
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

const Index = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
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
    // Navigation handled by useEffect watching auth state
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

  const openAuth = (tab: string = "login") => {
    setAuthTab(tab);
    setAuthOpen(true);
  };
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="JobFlow AI" className="h-[72px]" />
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link to="/resumes" className="text-sm text-muted-foreground transition hover:text-foreground">{t.landing.resumeTemplates}</Link>
            <Link to="/tracker" className="text-sm text-muted-foreground transition hover:text-foreground">{t.nav.jobTracker}</Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher className="w-[120px] h-8 text-xs" />
            <Button variant="ghost" size="sm" className="rounded-full font-semibold" onClick={() => openAuth("login")}>{t.nav.logIn}</Button>
            <Button size="sm" className="rounded-full font-semibold" onClick={() => openAuth("signup")}>{t.nav.getStarted}</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(221_83%_53%/0.08),transparent_60%)]" />
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Trusted by 10,000+ job seekers — Free to start
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            The Best AI Resume Builder for{" "}
            <span className="text-primary">Modern ATS Success.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
            Our free AI resume builder helps you create a professional, ATS-optimized resume in minutes. Use our <strong className="text-foreground">AI resume grader</strong> to scan your content, identify keyword gaps, and land 3× more interviews.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="gap-2 rounded-full px-8 font-semibold" onClick={() => openAuth("signup")}>
              Build Free ATS Resume <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="gap-2 rounded-full px-8 font-semibold" onClick={() => openAuth("signup")}>
              <Upload className="h-4 w-4" /> Upload Existing Resume
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-success" /> 100% ATS-Friendly</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-success" /> 2,400+ 5-Star Reviews</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-success" /> Over 1M Resumes Built</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-secondary/30 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Powerful AI Features to Beat the Bots</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Stop getting rejected by Applicant Tracking Systems (ATS). Our tools ensure your resume reaches real recruiters and humans.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: <BarChart3 className="h-6 w-6 text-primary" />,
                title: "AI Resume Grader",
                desc: "Instantly scan your resume against ATS criteria to find missing keywords, fix formatting, and improve readability.",
              },
              {
                icon: <Sparkles className="h-6 w-6 text-primary" />,
                title: "One-Click Tailoring",
                desc: "Paste a job description and our AI will tailor your resume to match the specific requirements of that role.",
              },
              {
                icon: <LayoutTemplate className="h-6 w-6 text-primary" />,
                title: "ATS Templates",
                desc: "Access a library of 8 professional, recruiter-approved resume templates designed specifically to be parsed by ATS software.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-6 transition hover:shadow-lg">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">{f.icon}</div>
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Resumes Fail */}
      <section className="py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-4 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Why 75% of Resumes Never Get Seen by a Recruiter
            </h2>
            <ul className="mt-8 space-y-5">
              {[
                { icon: <AlertTriangle className="h-5 w-5 text-warning" />, title: "Generic Keywords", desc: "Most resumes lack tailored ATS-friendly keywords, leading to instant rejection." },
                { icon: <XCircle className="h-5 w-5 text-destructive" />, title: "Missing Keywords", desc: "If your resume doesn't match the specific keywords in a job description, it's filtered out automatically." },
                { icon: <FileWarning className="h-5 w-5 text-destructive" />, title: "Poor Readability", desc: "Dense formatting and generic language block your resume from making it past initial filtering systems." },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">{item.icon}</div>
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="mt-0.5 text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Button className="gap-2 rounded-full font-semibold mt-8" onClick={() => openAuth("signup")}>
              Fix My Resume Now <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-border shadow-2xl">
              <img src={dashboardPreview} alt="JobFlow AI dashboard showing resume score, templates, and job application tracker" className="w-full" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border bg-secondary/30 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Loved by Job Seekers Worldwide</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Join thousands of professionals who landed their dream jobs with JobFlow AI.
            </p>
          </div>

          {/* Stats bar */}
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { value: "10,000+", label: "Active Users" },
              { value: "4.8/5", label: "Average Rating" },
              { value: "3×", label: "More Interviews" },
              { value: "1M+", label: "Resumes Built" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-5 text-center">
                <p className="text-2xl font-extrabold text-primary">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Review cards */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Sarah M.",
                role: "Software Engineer → Google",
                text: "I was applying for months with zero callbacks. After using JobFlow AI's resume grader and tailoring my resume, I got 5 interviews in 2 weeks — including one at Google. I start next month!",
                stars: 5,
              },
              {
                name: "James R.",
                role: "Marketing Manager → HubSpot",
                text: "The one-click tailoring feature is a game-changer. I used to spend hours customizing each resume. Now I paste the job description and get a perfectly optimized version in seconds.",
                stars: 5,
              },
              {
                name: "Priya K.",
                role: "Recent Graduate → Deloitte",
                text: "As a new grad with limited experience, I had no idea my resume was getting filtered by ATS. JobFlow AI helped me restructure everything and I landed my first consulting role within a month.",
                stars: 5,
              },
              {
                name: "David L.",
                role: "Data Analyst → Amazon",
                text: "The AI grader caught keyword gaps I never would have noticed. My resume score went from 45 to 92, and suddenly I was getting recruiter messages on LinkedIn every week.",
                stars: 5,
              },
              {
                name: "Emily T.",
                role: "Product Designer → Figma",
                text: "I love the templates — clean, professional, and they actually pass ATS scans. Combined with the cover letter generator, JobFlow AI is the only tool I recommend to my design friends.",
                stars: 5,
              },
              {
                name: "Carlos V.",
                role: "Career Changer → Salesforce",
                text: "Switching from teaching to tech felt impossible until I found JobFlow AI. The AI rewrote my bullet points to highlight transferable skills. Within 6 weeks, I had three offers on the table.",
                stars: 5,
              },
            ].map((t) => (
              <div key={t.name} className="group rounded-xl border border-border bg-card p-6 transition hover:shadow-lg hover:-translate-y-1 duration-300">
                <Quote className="mb-3 h-5 w-5 text-primary/40" />
                <p className="text-sm leading-relaxed text-muted-foreground">{t.text}</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold tracking-tight md:text-3xl">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "What is an ATS and why does it matter?", a: "An Applicant Tracking System (ATS) is software used by employers to filter resumes. Over 75% of resumes are rejected before a human ever sees them. JobFlow AI ensures your resume passes these filters." },
              { q: "Is this AI resume builder really free?", a: "Yes! You can create, edit, and download ATS-optimized resumes for free. Our AI-powered grading and tailoring features are also available at no cost." },
              { q: "How does the AI resume grader work?", a: "Our AI analyzes your resume against industry standards and specific job descriptions. It checks for keyword optimization, formatting, readability, and ATS compatibility, then provides an actionable score and suggestions." },
              { q: "Can I import my existing LinkedIn or resume?", a: "Absolutely. You can upload an existing PDF resume and our AI will parse it into an editable format, preserving your content while optimizing the structure for ATS compatibility." },
            ].map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-foreground text-background">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <img src={logo} alt="JobFlow AI" className="h-[72px] brightness-0 invert" />
            </div>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-background/70">
              The world's most accurate AI-powered resume builder and ATS optimization suite. Built for job seekers, by recruiters.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-background/60">Platform</h4>
            <ul className="space-y-2 text-sm text-background/80">
              <li><Link to="/resumes" className="transition hover:text-primary">Resume Templates</Link></li>
              <li><Link to="/resumes" className="transition hover:text-primary">AI Resume Grader</Link></li>
              <li><Link to="/tracker" className="transition hover:text-primary">Job Tracking</Link></li>
              <li><Link to="/cover-letters" className="transition hover:text-primary">Cover Letters</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-background/60">Legal</h4>
            <ul className="space-y-2 text-sm text-background/80">
              <li><Link to="/privacy" className="transition hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/terms" className="transition hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-background/10 px-4 py-4 pb-16">
          <p className="mx-auto max-w-5xl text-center text-xs text-background/50">
            © {new Date().getFullYear()} JobFlow AI. All rights reserved. Built with ❤️ for job seekers everywhere.
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
            name: "JobFlow AI",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description: "AI-powered ATS resume builder that helps job seekers create optimized resumes, track applications, and land more interviews.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "2400" },
          }),
        }}
      />

      {/* Auth Dialog */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img src={logo} alt="JobFlow AI" className="h-14" />
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
                  <Input id="lp-login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t.common.signingIn : t.common.signIn}
                </Button>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or</span></div>
                </div>
                <Button type="button" variant="outline" className="w-full gap-2" onClick={handleGoogleSignIn}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </Button>
                <Button type="button" variant="outline" className="w-full gap-2" onClick={handleAppleSignIn}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  Continue with Apple
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
                  <Input id="lp-signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t.common.creatingAccount : t.common.createAccount}
                </Button>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or</span></div>
                </div>
                <Button type="button" variant="outline" className="w-full gap-2" onClick={handleGoogleSignIn}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </Button>
                <Button type="button" variant="outline" className="w-full gap-2" onClick={handleAppleSignIn}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  Continue with Apple
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
