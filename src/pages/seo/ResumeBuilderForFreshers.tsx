import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, GraduationCap, Lightbulb, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEOHead from "@/components/SEOHead";
const logo = "/logo.webp";
import { useLanguage } from "@/i18n/LanguageContext";
import { seoTranslations } from "@/i18n/seoTranslations";

export default function ResumeBuilderForFreshers() {
  const { locale } = useLanguage();
  const t = seoTranslations[locale];
  const cardIcons = [<GraduationCap className="h-5 w-5" />, <Lightbulb className="h-5 w-5" />, <BookOpen className="h-5 w-5" />];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Resume Builder for Freshers — Free ATS-Friendly Templates"
        description="Build a professional resume as a fresher or recent graduate. Free ATS-optimized templates designed for entry-level candidates with limited work experience."
        canonical="https://atsproresumebuilder.com/resume-builder-for-freshers"
        keywords="resume builder for freshers, fresher resume, entry level resume builder, resume for fresh graduates, first job resume template"
      />

      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2"><img src={logo} alt="ATS Pro Resume Builder" className="h-12 dark:invert dark:brightness-200" width={48} height={48} /></Link>
          <div className="flex items-center gap-3">
            <Link to="/resume-templates" className="text-sm text-muted-foreground hover:text-foreground transition">{t.nav.templates}</Link>
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition">{t.nav.blog}</Link>
            <Button size="sm" asChild><Link to="/">{t.nav.getStarted}</Link></Button>
          </div>
        </div>
      </nav>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 font-mono">{t.fresher.tag}</p>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">{t.fresher.h1}</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">{t.fresher.subtitle}</p>
          <Button size="lg" className="gap-2 mt-8" asChild><Link to="/">{t.fresher.ctaBtn} <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-serif text-2xl font-bold mb-6">{t.fresher.whyH2}</h2>
          <p className="text-muted-foreground mb-4">{t.fresher.whyP1}</p>
          <p className="text-muted-foreground mb-4">{t.fresher.whyP2}</p>
          <h3 className="text-lg font-semibold mt-8 mb-4">{t.fresher.whatIncludeH3}</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {t.fresher.includeCards.map((card, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-card p-5">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">{cardIcons[i]}</div>
                <h4 className="text-sm font-semibold mb-1">{card.title}</h4>
                <p className="text-xs text-muted-foreground">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-serif text-2xl font-bold mb-6">{t.fresher.tipsH2}</h2>
          <ul className="space-y-3">
            {t.fresher.tips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-serif text-2xl font-bold text-center mb-8">{t.fresher.faqH2}</h2>
          <Accordion type="single" collapsible className="w-full">
            {t.fresher.faqs.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-serif text-xl font-bold mb-6">{t.fresher.linksH2}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["/ats-resume-builder", "/resume-templates", "/interview-preparation", "/blog"].map((href, i) => (
              <Button key={href} variant="outline" size="sm" asChild><Link to={href}>{t.fresher.linkLabels[i]}</Link></Button>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-serif text-2xl font-bold mb-4">{t.fresher.finalH2}</h2>
          <p className="text-muted-foreground mb-6">{t.fresher.finalSub}</p>
          <Button size="lg" className="gap-2" asChild><Link to="/">{t.fresher.finalBtn} <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ATS Pro Resume Builder. <Link to="/privacy" className="underline">{t.nav.privacy}</Link> · <Link to="/terms" className="underline">{t.nav.terms}</Link></p>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": t.fresher.faqs.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a }
        }))
      }) }} />
    </div>
  );
}
