import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const PrivacyPolicy = () => {
  const { t, locale } = useLanguage();
  const tp = t.privacy;
  const tm = t.misc;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-sans">
      <SEOHead title={`${tp.title} — ResumePro`} description="Learn how ResumePro protects your personal information." />
      
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 pt-48 pb-40 space-y-20">
        <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] p-12 md:p-20 overflow-hidden border border-slate-100 shadow-sm">
           <div className="absolute top-0 right-0 w-full lg:w-[400px] h-auto lg:h-[400px] bg-blue-600/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
           
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100 text-blue-600">
                     <ShieldCheck className="w-3.5 h-3.5" />
                     <span className="text-[10px] font-black uppercase tracking-wider">{tm.legal.privacyProtocol}</span>
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-4xl md:text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">
                       {tp.title}.
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-xl">{tp.lastUpdated} {new Date().toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" })}</p>
                  </div>
               </div>
           </div>
        </div>

        <div className="space-y-20 text-lg leading-relaxed max-w-4xl mx-auto">
          <section className="space-y-6">
             <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s1Title}</h2>
             <p className="font-medium text-slate-600">{tp.s1Content}</p>
          </section>
          <section className="space-y-6">
             <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s2Title}</h2>
             <ul className="list-disc pl-8 space-y-4 font-medium text-slate-600">
                {tp.s2Items.map((item, i) => <li key={i}>{item}</li>)}
             </ul>
          </section>
          <section className="space-y-6">
             <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s3Title}</h2>
             <p className="font-medium text-slate-600">{tp.s3Content}</p>
          </section>
          <section className="space-y-6">
             <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s4Title}</h2>
             <p className="font-medium text-slate-600">{tp.s4Content}</p>
          </section>
          <section className="space-y-6">
             <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s5Title}</h2>
             <p className="font-medium text-slate-600">{tp.s5Content}</p>
          </section>
          <section className="space-y-6">
             <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s6Title}</h2>
             <p className="font-medium text-slate-600">{tp.s6Content}</p>
          </section>
          <section className="p-16 rounded-[3.5rem] bg-slate-50 border border-slate-100 space-y-6">
             <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s7Title}</h2>
             <p className="font-medium text-slate-600 text-xl leading-relaxed">{tp.s7Content} <span className="text-blue-600 font-black">support@atsproresumebuilder.com</span>.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
