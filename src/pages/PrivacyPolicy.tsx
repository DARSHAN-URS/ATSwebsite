import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { privacyTranslations } from "@/i18n/privacyTranslations";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  const { locale } = useLanguage();
  const tp = privacyTranslations[locale];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400">
      <SEOHead title="Privacy Policy — ResumePro" description="Learn how ResumePro protects your personal information." />
      
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto flex h-20 items-center justify-between px-8">
          <Link to="/"><Logo className="h-10" /></Link>
          <Button asChild variant="ghost" className="rounded-xl font-bold text-slate-500 hover:text-primary">
             <Link to="/" className="flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Home</Link>
          </Button>
        </div>
      </nav>

      <main className="container mx-auto max-w-4xl px-8 pt-40 pb-32">
        <div className="space-y-4 mb-16">
           <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{tp.title}</h1>
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{tp.lastUpdated} {new Date().toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" })}</p>
        </div>

        <div className="space-y-12 text-base leading-relaxed">
          <section className="space-y-4">
             <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s1Title}</h2>
             <p className="font-medium">{tp.s1Content}</p>
          </section>
          <section className="space-y-4">
             <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s2Title}</h2>
             <ul className="list-disc pl-5 space-y-3 font-medium">
                {tp.s2Items.map((item, i) => <li key={i}>{item}</li>)}
             </ul>
          </section>
          <section className="space-y-4">
             <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s3Title}</h2>
             <p className="font-medium">{tp.s3Content}</p>
          </section>
          <section className="space-y-4">
             <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s4Title}</h2>
             <p className="font-medium">{tp.s4Content}</p>
          </section>
          <section className="space-y-4">
             <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s5Title}</h2>
             <p className="font-medium">{tp.s5Content}</p>
          </section>
          <section className="space-y-4">
             <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s6Title}</h2>
             <p className="font-medium">{tp.s6Content}</p>
          </section>
          <section className="p-10 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
             <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s7Title}</h2>
             <p className="font-medium">{tp.s7Content} <span className="text-primary font-bold">support@atsproresumebuilder.com</span>.</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
