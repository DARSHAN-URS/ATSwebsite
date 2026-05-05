import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, FileText, FileType, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
const logo = "/images/logo-main.png";
import Logo from "@/components/Logo";
import { useLanguage } from "@/i18n/LanguageContext";
import { seoTranslations } from "@/i18n/seoTranslations";

export default function ResumeDownloadFormats() {
  const { locale } = useLanguage();
  const t = seoTranslations[locale];
  const fmtIcons = [<FileText className="h-6 w-6" />, <FileType className="h-6 w-6" />, <FileCode className="h-6 w-6" />];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Resume Download — PDF, DOCX & TXT Export Options"
        description="Download your ATS-optimized resume in PDF, DOCX, or TXT format. Every format is tested for ATS compatibility. Free resume download with professional formatting."
        canonical="https://atsproresumebuilder.com/resume-download"
        keywords="resume download, download resume PDF, resume DOCX download, resume TXT format, ATS resume download free"
      />

      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2"><Logo className="h-10" /></Link>
          <div className="flex items-center gap-3">
            <Link to="/ats-resume-builder" className="text-sm text-muted-foreground hover:text-foreground transition">{t.nav.atsBuilder}</Link>
            <Link to="/resume-templates" className="text-sm text-muted-foreground hover:text-foreground transition">{t.nav.templates}</Link>
            <Button size="sm" asChild><Link to="/">{t.nav.getStarted}</Link></Button>
          </div>
        </div>
      </nav>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">{t.download.tag}</p>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">{t.download.h1}</h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">{t.download.subtitle}</p>
        </div>
      </section>

      <section className="border-t border-border/60 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="font-display text-2xl font-extrabold text-center mb-10">{t.download.formatsH2}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {t.download.formats.map((f, i) => (
              <div key={i} className="rounded-2xl border border-border/60 bg-card p-6 text-center bounce-hover">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">{fmtIcons[i]}</div>
                <h3 className="text-base font-bold mb-1">{f.title}</h3>
                <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{f.best}</span>
                <p className="text-sm text-muted-foreground mt-3">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-display text-2xl font-extrabold mb-6">{t.download.whichH2}</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            {t.download.whichItems.map((item, i) => (
              <p key={i}>{item}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-display text-2xl font-extrabold mb-6">{t.download.compatH2}</h2>
          <ul className="space-y-3">
            {t.download.compatList.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border/60 py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="font-display text-xl font-extrabold mb-6">{t.download.linksH2}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["/ats-resume-builder", "/resume-templates", "/interview-preparation", "/blog"].map((href, i) => (
              <Button key={href} variant="outline" size="sm" asChild><Link to={href}>{t.download.linkLabels[i]}</Link></Button>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/30 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-2xl font-extrabold mb-4">{t.download.finalH2}</h2>
          <p className="text-muted-foreground mb-6">{t.download.finalSub}</p>
          <Button size="lg" className="gap-2" asChild><Link to="/">{t.download.finalBtn} <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ATS Pro Resume Builder. <Link to="/privacy" className="underline">{t.nav.privacy}</Link> · <Link to="/terms" className="underline">{t.nav.terms}</Link></p>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": t.download.whichItems.map((item, i) => ({
          "@type": "Question",
          "name": i === 0 ? "Which resume format should I use for ATS?" : i === 1 ? "Can I download my resume as DOCX?" : "Is PDF a good format for resumes?",
          "acceptedAnswer": { "@type": "Answer", "text": item }
        }))
      }) }} />
    </div>
  );
}
