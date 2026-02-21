import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import logo from "@/assets/logo.png";
import { useLanguage } from "@/i18n/LanguageContext";
import { seoTranslations } from "@/i18n/seoTranslations";

export default function ResumeTemplates() {
  const { locale } = useLanguage();
  const t = seoTranslations[locale];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="ATS-Friendly Resume Templates — Free Professional Layouts"
        description="Browse 8+ free ATS-friendly resume templates designed to pass applicant tracking systems. Professional layouts for engineers, freshers, seniors, and career changers."
        canonical="https://atsproresumebuilder.com/resume-templates"
        keywords="ATS resume templates, free resume templates, ATS-friendly resume templates, professional resume layouts, resume templates for freshers"
      />

      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2"><img src={logo} alt="ATS Pro Resume Builder" className="h-12 dark:invert dark:brightness-200" width={48} height={48} /></Link>
          <div className="flex items-center gap-3">
            <Link to="/ats-resume-builder" className="text-sm text-muted-foreground hover:text-foreground transition">{t.nav.atsBuilder}</Link>
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition">{t.nav.blog}</Link>
            <Button size="sm" asChild><Link to="/">{t.nav.getStarted}</Link></Button>
          </div>
        </div>
      </nav>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 font-mono">{t.tpl.tag}</p>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">{t.tpl.h1}</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">{t.tpl.subtitle}</p>
        </div>
      </section>

      <section className="border-t border-border/60 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-serif text-2xl font-bold mb-8 text-center">{t.tpl.browseH2}</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {t.tpl.templates.map((tp) => (
              <div key={tp.name} className="rounded-xl border border-border/60 bg-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold">{tp.name}</h3>
                  <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{tp.best}</span>
                </div>
                <p className="text-sm text-muted-foreground">{tp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-serif text-2xl font-bold mb-6">{t.tpl.whatMakesH2}</h2>
          <p className="text-muted-foreground mb-4">{t.tpl.whatMakesIntro}</p>
          <ul className="space-y-3">
            {t.tpl.whatMakesList.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-serif text-2xl font-bold mb-6">{t.tpl.chooseH2}</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            {t.tpl.chooseItems.map((item, i) => (
              <p key={i}>{item}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-serif text-2xl font-bold mb-4">{t.tpl.ctaH2}</h2>
          <p className="text-muted-foreground mb-6">{t.tpl.ctaSub}</p>
          <Button size="lg" className="gap-2" asChild><Link to="/">{t.tpl.ctaBtn} <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ATS Pro Resume Builder. <Link to="/privacy" className="underline">{t.nav.privacy}</Link> · <Link to="/terms" className="underline">{t.nav.terms}</Link></p>
      </footer>
    </div>
  );
}
