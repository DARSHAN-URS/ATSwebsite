import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, FileText, BarChart3, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEOHead from "@/components/SEOHead";
const logo = "/images/logo-main.png";
import { useLanguage } from "@/i18n/LanguageContext";
import { seoTranslations } from "@/i18n/seoTranslations";

export default function ATSResumeBuilder() {
  const { locale } = useLanguage();
  const t = seoTranslations[locale];
  const icons = [<FileText className="h-5 w-5" />, <BarChart3 className="h-5 w-5" />, <Sparkles className="h-5 w-5" />, <Target className="h-5 w-5" />];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="ATS Resume Builder — Build ATS-Friendly Resumes Free"
        description="Create ATS-optimized resumes that pass applicant tracking systems. Free AI resume builder with 8+ professional templates, instant grading, and one-click tailoring."
        canonical="https://atsproresumebuilder.com/ats-resume-builder"
        keywords="ATS resume builder, ATS-friendly resume, applicant tracking system resume, ATS optimized resume, free ATS resume builder"
      />

      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="ATS Pro Resume Builder" className="h-12 dark:brightness-0 dark:invert" width={48} height={48} />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition">{t.nav.blog}</Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition">{t.nav.about}</Link>
            <Button size="sm" asChild><Link to="/">{t.nav.getStartedFree}</Link></Button>
          </div>
        </div>
      </nav>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">{t.ats.tag}</p>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">{t.ats.h1}</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">{t.ats.subtitle}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" className="gap-2" asChild><Link to="/">{t.ats.buildNow} <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button variant="outline" size="lg" asChild><Link to="/resume-templates">{t.ats.browseTemplates}</Link></Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold mb-6">{t.ats.whatIsH2}</h2>
          <p className="text-muted-foreground mb-4">{t.ats.whatIsP1}</p>
          <p className="text-muted-foreground mb-4">{t.ats.whatIsP2}</p>
          <p className="text-muted-foreground">{t.ats.whatIsP3}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-center mb-10">{t.ats.howH2}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {t.ats.features.map((f, i) => (
              <div key={i} className="rounded-2xl border border-border/60 bg-card p-6 bounce-hover">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{icons[i]}</div>
                <h3 className="text-sm font-bold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold mb-6">{t.ats.tipsH2}</h2>
          <ul className="space-y-4">
            {t.ats.tips.map((tip, i) => (
              <li key={i} className="flex gap-3">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-center mb-8">{t.ats.faqH2}</h2>
          <Accordion type="single" collapsible className="w-full">
            {t.ats.faqs.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-display text-xl font-extrabold mb-6">{t.ats.linksH2}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["/resume-templates", "/resume-builder-for-freshers", "/software-engineer-resume", "/interview-preparation", "/blog"].map((href, i) => (
              <Button key={href} variant="outline" size="sm" asChild><Link to={href}>{t.ats.linkLabels[i]}</Link></Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold mb-4">{t.ats.ctaH2}</h2>
          <p className="text-muted-foreground mb-6">{t.ats.ctaSub}</p>
          <Button size="lg" className="gap-2" asChild><Link to="/">{t.ats.ctaBtn} <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ATS Pro Resume Builder. <Link to="/privacy" className="underline">{t.nav.privacy}</Link> · <Link to="/terms" className="underline">{t.nav.terms}</Link></p>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: t.ats.faqs.slice(0, 3).map(f => ({
          "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a }
        })),
      }) }} />
    </div>
  );
}
