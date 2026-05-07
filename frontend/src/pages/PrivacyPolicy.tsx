import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
const logo = "/images/logo-main.png";
import Logo from "@/components/Logo";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { privacyTranslations } from "@/i18n/privacyTranslations";

const PrivacyPolicy = () => {
  const { locale } = useLanguage();
  const tp = privacyTranslations[locale];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="Privacy Policy — ATS Pro Resume Builder" description="Learn how ATS Pro Resume Builder collects, uses, and protects your personal information." canonical="https://atsproresumebuilder.com/privacy" keywords="privacy policy, data protection, resume data security" />
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2"><Logo className="h-10" /></Link>
          <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"><ArrowLeft className="h-4 w-4" /> {tp.backToHome}</Link>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{tp.title}</h1>
        <p className="text-sm text-muted-foreground mb-10">{tp.lastUpdated} {new Date().toLocaleDateString(locale === "ar" ? "ar-EG" : locale === "hi" ? "hi-IN" : locale, { month: "long", day: "numeric", year: "numeric" })}</p>
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section><h2 className="text-lg font-semibold text-foreground mb-3">{tp.s1Title}</h2><p>{tp.s1Content}</p></section>
          <section><h2 className="text-lg font-semibold text-foreground mb-3">{tp.s2Title}</h2><ul className="list-disc pl-5 space-y-2">{tp.s2Items.map((item, i) => <li key={i}>{item}</li>)}</ul></section>
          <section><h2 className="text-lg font-semibold text-foreground mb-3">{tp.s3Title}</h2><p>{tp.s3Content}</p></section>
          <section><h2 className="text-lg font-semibold text-foreground mb-3">{tp.s4Title}</h2><p>{tp.s4Content}</p></section>
          <section><h2 className="text-lg font-semibold text-foreground mb-3">{tp.s5Title}</h2><p>{tp.s5Content}</p></section>
          <section><h2 className="text-lg font-semibold text-foreground mb-3">{tp.s6Title}</h2><p>{tp.s6Content}</p></section>
          <section><h2 className="text-lg font-semibold text-foreground mb-3">{tp.s7Title}</h2><p>{tp.s7Content} <span className="text-primary font-medium">support@atsproresumebuilder.com</span>.</p></section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
