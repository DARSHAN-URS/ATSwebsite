import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Sparkles, BarChart3, Upload, Mail, Search, Briefcase, Building2, Users, Kanban, Star, Globe, Shield, Zap, Target, CheckCircle, TrendingUp, Clock, Award, Heart, Layers, MonitorSmartphone, Lock, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.webp";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { aboutTranslations } from "@/i18n/aboutTranslations";

export default function About() {
  const { locale } = useLanguage();
  const ta = aboutTranslations[locale];

  const jobSeekerFeatures = [
    { icon: FileText, title: ta.jsf1Title, desc: ta.jsf1Desc, bullets: ta.jsf1Bullets },
    { icon: Sparkles, title: ta.jsf2Title, desc: ta.jsf2Desc, bullets: ta.jsf2Bullets },
    { icon: Target, title: ta.jsf3Title, desc: ta.jsf3Desc, bullets: ta.jsf3Bullets },
    { icon: Upload, title: ta.jsf4Title, desc: ta.jsf4Desc, bullets: ta.jsf4Bullets },
    { icon: Mail, title: ta.jsf5Title, desc: ta.jsf5Desc, bullets: ta.jsf5Bullets },
    { icon: Search, title: ta.jsf6Title, desc: ta.jsf6Desc, bullets: ta.jsf6Bullets },
    { icon: Briefcase, title: ta.jsf7Title, desc: ta.jsf7Desc, bullets: ta.jsf7Bullets },
    { icon: BarChart3, title: ta.jsf8Title, desc: ta.jsf8Desc, bullets: ta.jsf8Bullets },
    { icon: Building2, title: ta.jsf9Title, desc: ta.jsf9Desc, bullets: ta.jsf9Bullets },
  ];

  const recruiterFeatures = [
    { icon: Building2, title: ta.rf1Title, desc: ta.rf1Desc, bullets: ta.rf1Bullets },
    { icon: Briefcase, title: ta.rf2Title, desc: ta.rf2Desc, bullets: ta.rf2Bullets },
    { icon: Kanban, title: ta.rf3Title, desc: ta.rf3Desc, bullets: ta.rf3Bullets },
    { icon: Users, title: ta.rf4Title, desc: ta.rf4Desc, bullets: ta.rf4Bullets },
    { icon: BarChart3, title: ta.rf5Title, desc: ta.rf5Desc, bullets: ta.rf5Bullets },
    { icon: Star, title: ta.rf6Title, desc: ta.rf6Desc, bullets: ta.rf6Bullets },
  ];

  const benefits = [
    { icon: TrendingUp, title: ta.benefit1Title, desc: ta.benefit1Desc },
    { icon: Clock, title: ta.benefit2Title, desc: ta.benefit2Desc },
    { icon: Award, title: ta.benefit3Title, desc: ta.benefit3Desc },
    { icon: Target, title: ta.benefit4Title, desc: ta.benefit4Desc },
    { icon: Layers, title: ta.benefit5Title, desc: ta.benefit5Desc },
    { icon: Heart, title: ta.benefit6Title, desc: ta.benefit6Desc },
  ];

  const platformHighlights = [
    { icon: Globe, title: ta.ph1Title, desc: ta.ph1Desc },
    { icon: Languages, title: ta.ph2Title, desc: ta.ph2Desc },
    { icon: Shield, title: ta.ph3Title, desc: ta.ph3Desc },
    { icon: Lock, title: ta.ph4Title, desc: ta.ph4Desc },
    { icon: Zap, title: ta.ph5Title, desc: ta.ph5Desc },
    { icon: MonitorSmartphone, title: ta.ph6Title, desc: ta.ph6Desc },
  ];

  const stats = [
    { value: "12", label: ta.statsTemplates },
    { value: "6", label: ta.statsLanguages },
    { value: "5", label: ta.statsPipeline },
    { value: "100%", label: ta.statsFree },
  ];

  const steps = [
    { step: "1", title: ta.step1Title, desc: ta.step1Desc },
    { step: "2", title: ta.step2Title, desc: ta.step2Desc },
    { step: "3", title: ta.step3Title, desc: ta.step3Desc },
    { step: "4", title: ta.step4Title, desc: ta.step4Desc },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="About — ATS Pro Resume Builder" description="Learn about ATS Pro Resume Builder: AI-powered resume building, grading, job search, and recruiter tools." canonical="https://atsproresumebuilder.com/about" keywords="about ATS Pro, resume builder features, AI resume tools" />

      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2"><img src={logo} alt="ATS Pro Resume Builder" className="h-[72px] dark:invert dark:brightness-200" width={72} height={72} /></Link>
          <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"><ArrowLeft className="h-4 w-4" /> {ta.backToHome}</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-6">{ta.tagline}</span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">{ta.heroTitle}<span className="block text-primary mt-1">{ta.heroHighlight}</span></h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">{ta.heroDesc1}</p>
          <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">{ta.heroDesc2}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-muted/20">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (<div key={s.label} className="text-center"><div className="text-3xl md:text-4xl font-bold text-primary font-mono">{s.value}</div><div className="mt-1 text-sm text-muted-foreground">{s.label}</div></div>))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-8">
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-3">{ta.missionTagline}</span>
            <h2 className="text-3xl font-bold tracking-tight">{ta.missionTitle}</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>{ta.missionP1}</p>
            <p><strong className="text-foreground">{ta.missionP2}</strong></p>
            <p>{ta.missionP3}</p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-3">{ta.benefitsTagline}</span>
            <h2 className="text-3xl font-bold tracking-tight">{ta.benefitsTitle}</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{ta.benefitsDesc}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (<div key={b.title} className="rounded-[0.625rem] border border-border bg-card p-6"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><b.icon className="h-5 w-5" /></div><h3 className="font-semibold text-foreground mb-2">{b.title}</h3><p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p></div>))}
          </div>
        </div>
      </section>

      {/* Job Seeker Features */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-3">{ta.jobSeekersTagline}</span>
            <h2 className="text-3xl font-bold tracking-tight">{ta.jobSeekersTitle}</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{ta.jobSeekersDesc}</p>
          </div>
          <div className="space-y-6">
            {jobSeekerFeatures.map((f) => (
              <div key={f.title} className="group rounded-[0.625rem] border border-border bg-card p-6 md:p-8 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"><f.icon className="h-6 w-6" /></div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{f.desc}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {f.bullets.map((b, i) => (<li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span>{b}</span></li>))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recruiter Features */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-3">{ta.recruitersTagline}</span>
            <h2 className="text-3xl font-bold tracking-tight">{ta.recruitersTitle}</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{ta.recruitersDesc}</p>
          </div>
          <div className="space-y-6">
            {recruiterFeatures.map((f) => (
              <div key={f.title} className="group rounded-[0.625rem] border border-border bg-card p-6 md:p-8 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"><f.icon className="h-6 w-6" /></div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{f.desc}</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {f.bullets.map((b, i) => (<li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 shrink-0 text-primary mt-0.5" /><span>{b}</span></li>))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Highlights */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-3">{ta.platformTagline}</span>
            <h2 className="text-3xl font-bold tracking-tight">{ta.platformTitle}</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{ta.platformDesc}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformHighlights.map((h) => (<div key={h.title} className="rounded-[0.625rem] border border-border bg-card p-6 text-center"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><h.icon className="h-6 w-6" /></div><h3 className="font-semibold text-foreground mb-2">{h.title}</h3><p className="text-sm text-muted-foreground leading-relaxed">{h.desc}</p></div>))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary mb-3">{ta.howItWorksTagline}</span>
            <h2 className="text-3xl font-bold tracking-tight">{ta.howItWorksTitle}</h2>
            <p className="mt-3 text-muted-foreground">{ta.howItWorksDesc}</p>
          </div>
          <div className="space-y-0">
            {steps.map((s, i) => (
              <div key={s.step} className="flex gap-5 py-6">
                <div className="shrink-0 flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold font-mono text-sm">{s.step}</div>
                  {i < 3 && <div className="w-px flex-1 bg-border mt-2" />}
                </div>
                <div className="pb-2"><h3 className="font-semibold text-foreground mb-1">{s.title}</h3><p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{ta.ctaTitle}</h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">{ta.ctaDesc}</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="px-8"><Link to="/">{ta.ctaBtn1}</Link></Button>
            <Button asChild variant="outline" size="lg" className="px-8"><Link to="/jobs">{ta.ctaBtn2}</Link></Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">{ta.ctaNote}</p>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-border py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h3 className="text-lg font-semibold mb-2">{ta.contactTitle}</h3>
          <p className="text-sm text-muted-foreground">{ta.contactDesc}{" "}<a href="mailto:support@atsproresumebuilder.com" className="text-primary font-medium hover:underline">support@atsproresumebuilder.com</a></p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ATS Pro Resume Builder. {ta.footerCopyright}</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-foreground transition">{privacyLabel(locale)}</Link>
            <Link to="/terms" className="hover:text-foreground transition">{termsLabel(locale)}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function privacyLabel(locale: string) {
  const map: Record<string, string> = { en: "Privacy Policy", ar: "سياسة الخصوصية", es: "Política de Privacidad", fr: "Politique de Confidentialité", hi: "गोपनीयता नीति", pt: "Política de Privacidade" };
  return map[locale] || map.en;
}

function termsLabel(locale: string) {
  const map: Record<string, string> = { en: "Terms of Service", ar: "شروط الخدمة", es: "Términos de Servicio", fr: "Conditions d'Utilisation", hi: "सेवा की शर्तें", pt: "Termos de Serviço" };
  return map[locale] || map.en;
}
