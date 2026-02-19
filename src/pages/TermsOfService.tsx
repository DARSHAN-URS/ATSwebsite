import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { termsTranslations } from "@/i18n/termsTranslations";

const TermsOfService = () => {
  const { locale } = useLanguage();
  const tt = termsTranslations[locale];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="Terms of Service — ATS Pro Resume Builder" description="Read the Terms of Service for ATS Pro Resume Builder." canonical="https://atsproresumebuilder.com/terms" keywords="terms of service, user agreement" />
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2"><img src={logo} alt="ATS Pro Resume Builder" className="h-[72px] dark:invert dark:brightness-200" width={72} height={72} /></Link>
          <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"><ArrowLeft className="h-4 w-4" /> {tt.backToHome}</Link>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{tt.title}</h1>
        <p className="text-sm text-muted-foreground mb-10">{tt.lastUpdated} {new Date().toLocaleDateString(locale === "ar" ? "ar-EG" : locale === "hi" ? "hi-IN" : locale, { month: "long", day: "numeric", year: "numeric" })}</p>
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section><h2 className="text-lg font-semibold text-foreground mb-3">{tt.s1Title}</h2><p>{tt.s1Content}</p></section>
          <section><h2 className="text-lg font-semibold text-foreground mb-3">{tt.s2Title}</h2><p>{tt.s2Content}</p></section>
          <section><h2 className="text-lg font-semibold text-foreground mb-3">{tt.s3Title}</h2><ul className="list-disc pl-5 space-y-2">{tt.s3Items.map((item, i) => <li key={i}>{item}</li>)}</ul></section>
          <section><h2 className="text-lg font-semibold text-foreground mb-3">{tt.s4Title}</h2><p>{tt.s4Content}</p></section>
          <section><h2 className="text-lg font-semibold text-foreground mb-3">{tt.s5Title}</h2><p>{tt.s5Content}</p></section>
          <section><h2 className="text-lg font-semibold text-foreground mb-3">{tt.s6Title}</h2><p>{tt.s6Content}</p></section>
          <section><h2 className="text-lg font-semibold text-foreground mb-3">{tt.s7Title}</h2><p>{tt.s7Content}</p></section>
          <section><h2 className="text-lg font-semibold text-foreground mb-3">{tt.s8Title}</h2><p>{tt.s8Content}</p></section>
          <section><h2 className="text-lg font-semibold text-foreground mb-3">{tt.s9Title}</h2><p>{tt.s9Content} <span className="text-primary font-medium">support@atsproresumebuilder.com</span>.</p></section>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
