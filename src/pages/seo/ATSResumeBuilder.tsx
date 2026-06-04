import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, FileText, BarChart3, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEOHead from "@/components/SEOHead";
const logo = "/images/logo-main.png";
import Logo from "@/components/Logo";
import { useLanguage } from "@/i18n/LanguageContext";
import { seoTranslations } from "@/i18n/seoTranslations";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function ATSResumeBuilder() {
  const { locale } = useLanguage();
  const t = seoTranslations[locale];
  const icons = [<FileText className="h-5 w-5" />, <BarChart3 className="h-5 w-5" />, <Sparkles className="h-5 w-5" />, <Target className="h-5 w-5" />];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-sans">
      <SEOHead
        title="ATS Resume Builder — Build ATS-Friendly Resumes Free"
        description="Create ATS-optimized resumes that pass applicant tracking systems. Free AI resume builder with 8+ professional templates, instant grading, and one-click tailoring."
        canonical="https://atsproresumebuilder.com/ats-resume-builder"
        keywords="ATS resume builder, ATS-friendly resume, applicant tracking system resume, ATS optimized resume, free ATS resume builder"
      />

      <Navbar />

      <main className="pt-20">
        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-4xl px-8 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100 text-blue-600">
               <Sparkles className="w-3.5 h-3.5" />
               <span className="text-[10px] font-black uppercase tracking-widest">{t.ats.tag}</span>
            </div>
            <h1 className="text-2xl md:text-4xl md:text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">{t.ats.h1}</h1>
            <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">{t.ats.subtitle}</p>
            <div className="pt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" className="h-16 px-10 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] gap-3 shadow-2xl shadow-blue-600/20 hover:scale-105 transition-all" asChild><Link to="/">{t.ats.buildNow} <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button variant="outline" size="lg" className="h-16 px-10 rounded-2xl border-slate-200 dark:border-slate-800 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 dark:hover:bg-slate-800/40" asChild><Link to="/resume-templates">{t.ats.browseTemplates}</Link></Button>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-100 bg-slate-50/50 py-32">
          <div className="mx-auto max-w-4xl px-8 space-y-8 text-center">
            <h2 className="text-2xl md:text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.ats.whatIsH2}</h2>
            <div className="space-y-6 text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
               <p>{t.ats.whatIsP1}</p>
               <p>{t.ats.whatIsP2}</p>
               <p>{t.ats.whatIsP3}</p>
            </div>
          </div>
        </section>

        <section className="py-32">
          <div className="mx-auto max-w-6xl px-8">
            <h2 className="text-2xl md:text-4xl md:text-5xl font-black text-slate-900 dark:text-white text-center uppercase tracking-tight mb-20">{t.ats.howH2}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {t.ats.features.map((f, i) => (
                <div key={i} className="rounded-[3rem] border-none bg-slate-50 p-12 space-y-6 hover:bg-white hover:shadow-3xl transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm transition-colors">{icons[i]}</div>
                  <div className="space-y-3">
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{f.title}</h3>
                     <p className="text-base text-slate-600 font-medium leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-100 bg-slate-900 py-32 rounded-[4rem] mx-8 overflow-hidden">
          <div className="mx-auto max-w-4xl px-8 space-y-12">
            <h2 className="text-2xl md:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">{t.ats.tipsH2}</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {t.ats.tips.map((tip, i) => (
                <li key={i} className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/5">
                  <CheckCircle className="h-5 w-5 text-blue-500 shrink-0 mt-1" />
                  <p className="text-sm text-slate-300 font-medium leading-relaxed">{tip}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-40">
          <div className="mx-auto max-w-3xl px-8 space-y-16">
            <h2 className="text-2xl md:text-4xl md:text-5xl font-black text-slate-900 dark:text-white text-center uppercase tracking-tight">{t.ats.faqH2}</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {t.ats.faqs.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-none bg-slate-50 rounded-[2rem] px-8 overflow-hidden">
                  <AccordionTrigger className="text-left text-lg font-black uppercase tracking-tight py-8 hover:no-underline">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-base text-slate-600 font-medium leading-relaxed pb-8">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="border-y border-slate-100 bg-slate-50/50 py-32">
          <div className="mx-auto max-w-5xl px-8 text-center space-y-12">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.ats.linksH2}</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {["/resume-templates", "/resume-builder-for-freshers", "/software-engineer-resume", "/interview-preparation", "/blog"].map((href, i) => (
                <Button key={href} variant="outline" className="h-12 px-6 rounded-xl border-slate-200 dark:border-slate-800 font-black uppercase tracking-widest text-[9px] hover:bg-white" asChild><Link to={href}>{t.ats.linkLabels[i]}</Link></Button>
              ))}
            </div>
          </div>
        </section>

        <section className="py-40">
          <div className="mx-auto max-w-4xl px-8 text-center space-y-10">
            <h2 className="text-3xl md:text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{t.ats.ctaH2}</h2>
            <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">{t.ats.ctaSub}</p>
            <Button size="lg" className="h-20 px-12 rounded-[2rem] bg-blue-600 text-white font-black uppercase tracking-widest text-xs gap-4 shadow-3xl shadow-blue-600/30 hover:scale-105 transition-all" asChild><Link to="/">{t.ats.ctaBtn} <ArrowRight className="h-6 w-6" /></Link></Button>
          </div>
        </section>
      </main>

      <Footer />

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
