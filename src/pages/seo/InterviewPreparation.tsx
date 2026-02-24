import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Mic, Brain, Target, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEOHead from "@/components/SEOHead";
const logo = "/logo.webp";
import { useLanguage } from "@/i18n/LanguageContext";
import { seoTranslations } from "@/i18n/seoTranslations";

export default function InterviewPreparation() {
  const { locale } = useLanguage();
  const t = seoTranslations[locale];
  const featIcons = [<Mic className="h-5 w-5" />, <Brain className="h-5 w-5" />, <Target className="h-5 w-5" />, <BookOpen className="h-5 w-5" />];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Interview Preparation — AI Mock Interviews & Question Bank"
        description="Prepare for your next job interview with AI-powered mock interviews, resume-based question generation, STAR method coaching, and readiness scoring. Free interview prep tools."
        canonical="https://atsproresumebuilder.com/interview-preparation"
        keywords="interview preparation, mock interview, interview questions, STAR method, behavioral interview, technical interview preparation"
      />

      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2"><img src={logo} alt="ATS Pro Resume Builder" className="h-12 dark:invert dark:brightness-200" width={48} height={48} /></Link>
          <div className="flex items-center gap-3">
            <Link to="/ats-resume-builder" className="text-sm text-muted-foreground hover:text-foreground transition">{t.nav.resumeBuilder}</Link>
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition">{t.nav.blog}</Link>
            <Button size="sm" asChild><Link to="/">{t.nav.getStarted}</Link></Button>
          </div>
        </div>
      </nav>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">{t.interview.tag}</p>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">{t.interview.h1}</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">{t.interview.subtitle}</p>
          <Button size="lg" className="gap-2 mt-8" asChild><Link to="/">{t.interview.ctaBtn} <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-display text-2xl font-extrabold text-center mb-10">{t.interview.featuresH2}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {t.interview.features.map((f, i) => (
              <div key={i} className="rounded-2xl border border-border/60 bg-card p-6 bounce-hover">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{featIcons[i]}</div>
                <h3 className="text-sm font-bold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-display text-2xl font-extrabold mb-6">{t.interview.howH2}</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            {t.interview.howSections.map((s, i) => (
              <div key={i}>
                <h3 className="text-lg font-bold text-foreground">{s.heading}</h3>
                {s.text && <p>{s.text}</p>}
                {i === 3 && (
                  <ul className="space-y-2 mt-2">
                    {t.interview.questionTypes.map((qt, j) => (
                      <li key={j} className="flex gap-3"><CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />{qt}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-display text-2xl font-extrabold text-center mb-8">{t.interview.faqH2}</h2>
          <Accordion type="single" collapsible className="w-full">
            {t.interview.faqs.map((item, i) => (
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
          <h2 className="font-display text-xl font-extrabold mb-6">{t.interview.linksH2}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["/ats-resume-builder", "/resume-templates", "/software-engineer-resume", "/blog"].map((href, i) => (
              <Button key={href} variant="outline" size="sm" asChild><Link to={href}>{t.interview.linkLabels[i]}</Link></Button>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-2xl font-extrabold mb-4">{t.interview.finalH2}</h2>
          <p className="text-muted-foreground mb-6">{t.interview.finalSub}</p>
          <Button size="lg" className="gap-2" asChild><Link to="/">{t.interview.finalBtn} <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ATS Pro Resume Builder. <Link to="/privacy" className="underline">{t.nav.privacy}</Link> · <Link to="/terms" className="underline">{t.nav.terms}</Link></p>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: t.interview.faqs.slice(0, 3).map(f => ({
          "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a }
        })),
      }) }} />
    </div>
  );
}
