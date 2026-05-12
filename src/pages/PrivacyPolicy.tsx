import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { privacyTranslations } from "@/i18n/privacyTranslations";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  const { locale } = useLanguage();
  const tp = privacyTranslations[locale];

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-left pb-40">
      <SEOHead title="Privacy Policy — ResumePro" description="Learn how ResumePro protects your personal information." />
      
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm mb-12">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                   <ShieldCheck className="w-3.5 h-3.5" />
                   <span className="text-[10px] font-bold uppercase tracking-wider">Privacy Protocol Active</span>
                </div>
                <div className="space-y-1">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none uppercase">
                     {tp.title}.
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm max-w-xl">{tp.lastUpdated} {new Date().toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" })}</p>
                </div>
             </div>
         </div>
      </div>

      <div className="space-y-12 text-base leading-relaxed max-w-4xl">
        <section className="space-y-4">
           <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s1Title}</h2>
           <p className="font-medium text-slate-600 dark:text-slate-400">{tp.s1Content}</p>
        </section>
        <section className="space-y-4">
           <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s2Title}</h2>
           <ul className="list-disc pl-5 space-y-3 font-medium text-slate-600 dark:text-slate-400">
              {tp.s2Items.map((item, i) => <li key={i}>{item}</li>)}
           </ul>
        </section>
        <section className="space-y-4">
           <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s3Title}</h2>
           <p className="font-medium text-slate-600 dark:text-slate-400">{tp.s3Content}</p>
        </section>
        <section className="space-y-4">
           <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s4Title}</h2>
           <p className="font-medium text-slate-600 dark:text-slate-400">{tp.s4Content}</p>
        </section>
        <section className="space-y-4">
           <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s5Title}</h2>
           <p className="font-medium text-slate-600 dark:text-slate-400">{tp.s5Content}</p>
        </section>
        <section className="space-y-4">
           <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s6Title}</h2>
           <p className="font-medium text-slate-600 dark:text-slate-400">{tp.s6Content}</p>
        </section>
        <section className="p-10 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
           <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.s7Title}</h2>
           <p className="font-medium text-slate-600 dark:text-slate-400">{tp.s7Content} <span className="text-blue-600 font-bold">support@atsproresumebuilder.com</span>.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
