import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Code, Cpu, Database, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEOHead from "@/components/SEOHead";
const logo = "/images/logo-main.png";
import Logo from "@/components/Logo";
import { useLanguage } from "@/i18n/LanguageContext";
import { seoTranslations } from "@/i18n/seoTranslations";

export default function SoftwareEngineerResume() {
  const { locale } = useLanguage();
  const t = seoTranslations[locale];
  const catIcons = [<Code className="h-5 w-5" />, <Globe className="h-5 w-5" />, <Cpu className="h-5 w-5" />, <Database className="h-5 w-5" />];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-sans selection:bg-blue-600/10 selection:text-blue-600">
      <SEOHead
        title="Software Engineer Resume Builder — ATS-Optimized for Tech"
        description="Build an ATS-optimized software engineer resume with our free builder. Technical resume templates with grouped skills, project sections, and engineering-focused formatting."
        canonical="https://atsproresumebuilder.com/software-engineer-resume"
        keywords="software engineer resume builder, tech resume template, developer resume, programming resume, engineering resume ATS"
      />

      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2"><Logo className="h-10" /></Link>
          <div className="flex items-center gap-3">
            <Link to="/resume-templates" className="text-sm text-muted-foreground hover:text-foreground transition">{t.nav.templates}</Link>
            <Link to="/interview-preparation" className="text-sm text-muted-foreground hover:text-foreground transition">{t.nav.interviewPrep}</Link>
            <Button size="sm" asChild><Link to="/">{t.nav.getStarted}</Link></Button>
          </div>
        </div>
      </nav>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">{t.swe.tag}</p>
          <h1 className="text-2xl md:text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.85]">{t.swe.h1}</h1>
          <p className="mt-6 text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">{t.swe.subtitle}</p>
          <Button size="lg" className="gap-2 mt-8" asChild><Link to="/">{t.swe.ctaBtn} <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-8 text-center uppercase tracking-tight">{t.swe.skillsH2}</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">{t.swe.skillsSub}</p>
          <div className="grid md:grid-cols-4 gap-4">
            {t.swe.skillCats.map((cat, i) => (
              <div key={i} className="rounded-[2.5rem] border border-slate-100 bg-white dark:bg-slate-900 p-8 space-y-4 hover:shadow-xl transition-all group">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{catIcons[i]}</div>
                <h3 className="text-sm font-bold mb-1">{cat.title}</h3>
                <p className="text-xs text-muted-foreground">{cat.examples}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-12 uppercase tracking-tight">{t.swe.howH2}</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>{t.swe.howIntro}</p>
            {t.swe.howSections.map((s, i) => (
              <div key={i}>
                <h3 className="text-lg font-bold text-foreground mt-6">{s.heading}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-12 uppercase tracking-tight">{t.swe.checklistH2}</h2>
          <ul className="space-y-3">
            {t.swe.checklist.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white text-center mb-16 uppercase tracking-tight">{t.swe.faqH2}</h2>
          <Accordion type="single" collapsible className="w-full">
            {t.swe.faqs.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="border-t border-border/60 py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-display text-xl font-extrabold mb-6">{t.swe.linksH2}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["/ats-resume-builder", "/resume-templates", "/resume-builder-for-freshers", "/interview-preparation"].map((href, i) => (
              <Button key={href} variant="outline" size="sm" asChild><Link to={href}>{t.swe.linkLabels[i]}</Link></Button>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-900 py-32 rounded-[4rem] mx-8 overflow-hidden text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-2xl font-extrabold mb-4">{t.swe.finalH2}</h2>
          <p className="text-muted-foreground mb-6">{t.swe.finalSub}</p>
          <Button size="lg" className="gap-2" asChild><Link to="/">{t.swe.finalBtn} <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-12 text-center bg-white dark:bg-slate-900">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ATS Pro Resume Builder. <Link to="/privacy" className="underline">{t.nav.privacy}</Link> · <Link to="/terms" className="underline">{t.nav.terms}</Link></p>
      </footer>
    </div>
  );
}
