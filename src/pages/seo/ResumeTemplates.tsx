import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
const logo = "/images/logo-main.png";
import Logo from "@/components/Logo";
import { useLanguage } from "@/i18n/LanguageContext";
import { seoTranslations } from "@/i18n/seoTranslations";

export default function ResumeTemplates() {
  const { locale } = useLanguage();
  const t = seoTranslations[locale];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-blue-600/10 selection:text-blue-600">
      <SEOHead
        title="ATS-Friendly Resume Templates — Free Professional Layouts"
        description="Browse 8+ free ATS-friendly resume templates designed to pass applicant tracking systems. Professional layouts for engineers, freshers, seniors, and career changers."
        canonical="https://atsproresumebuilder.com/resume-templates"
        keywords="ATS resume templates, free resume templates, ATS-friendly resume templates, professional resume layouts, resume templates for freshers"
      />

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-2xl">
        <div className="container mx-auto px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo variant="auto" className="h-10" />
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/ats-resume-builder" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">{t.nav.atsBuilder}</Link>
            <Link to="/blog" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">{t.nav.blog}</Link>
            <Button className="bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl hover:scale-105 transition-all shadow-lg shadow-blue-600/20" asChild>
               <Link to="/">{t.nav.getStarted}</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-8 pt-40 pb-20 space-y-32 text-left">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-12">
           <div className="space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                    <Layout className="w-5 h-5" />
                 </div>
                 <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">{t.tpl.tag}</span>
              </motion.div>
              <h1 className="text-6xl md:text-[8rem] font-black text-slate-900 dark:text-white tracking-tighter leading-[0.8] uppercase">
                 Layout <br /> <span className="text-blue-600">Dynamics.</span>
              </h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
                 {t.tpl.subtitle}
              </p>
           </div>
        </div>

        {/* Template Grid */}
        <section className="space-y-16">
           <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-8">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{t.tpl.browseH2}</h2>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Library v2.4</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {t.tpl.templates.map((tp, i) => (
               <motion.div 
                  key={tp.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
               >
                  <Card className="group relative rounded-[3rem] border-none bg-slate-50 dark:bg-slate-900 p-10 space-y-8 hover:bg-white dark:hover:bg-slate-800 transition-all duration-500 hover:shadow-3xl hover:-translate-y-4">
                     <div className="aspect-[3/4] rounded-3xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 overflow-hidden relative shadow-inner">
                        {/* Blueprint Placeholder */}
                        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                           <div className="absolute inset-0 grid grid-cols-8 gap-2 p-4">
                              {[...Array(64)].map((_, j) => <div key={j} className="h-4 bg-blue-600 rounded-sm" />)}
                           </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                              <Sparkles className="w-8 h-8" />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{tp.name}</h3>
                           <Badge className="bg-blue-600/10 text-blue-600 border-none text-[9px] font-black uppercase tracking-widest px-3">{tp.best}</Badge>
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{tp.desc}</p>
                     </div>

                     <Button className="w-full h-16 rounded-2xl bg-slate-900 dark:bg-white/5 text-white font-black uppercase tracking-widest text-[10px] group-hover:bg-blue-600 transition-colors" asChild>
                        <Link to="/">{t.tpl.ctaBtn}</Link>
                     </Button>
                  </Card>
               </motion.div>
             ))}
           </div>
        </section>

        {/* Feature Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20">
           <Card className="rounded-[4rem] border-none bg-slate-900 p-16 text-white space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5"><ShieldCheck className="w-64 h-64" /></div>
              <div className="relative z-10 space-y-8">
                 <h2 className="text-5xl font-black tracking-tighter leading-none uppercase">{t.tpl.whatMakesH2}</h2>
                 <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">{t.tpl.whatMakesIntro}</p>
                 <div className="space-y-6 pt-6">
                    {t.tpl.whatMakesList.map((item, i) => (
                       <div key={i} className="flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:rotate-12 transition-transform">
                             <CheckCircle className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{item}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </Card>

           <div className="space-y-12 py-10">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">{t.tpl.chooseH2}</h2>
              <div className="space-y-8">
                 {t.tpl.chooseItems.map((item, i) => (
                    <div key={i} className="flex gap-6 group">
                       <span className="text-4xl font-black text-slate-100 dark:text-white/5 group-hover:text-blue-600/20 transition-colors">{String(i + 1).padStart(2, '0')}</span>
                       <p className="text-lg font-medium text-slate-600 dark:text-slate-400 leading-relaxed pt-2">{item}</p>
                    </div>
                 ))}
              </div>
              <div className="pt-8">
                 <Button className="h-20 px-16 rounded-[2rem] bg-blue-600 text-white font-black uppercase tracking-widest text-xs gap-4 shadow-3xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all" asChild>
                    <Link to="/">{t.tpl.ctaBtn} <ArrowRight className="w-5 h-5" /></Link>
                 </Button>
              </div>
           </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 dark:border-slate-800 py-12">
        <div className="container mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© {new Date().getFullYear()} ResumePro Dynamics Engine</p>
           <div className="flex items-center gap-8">
              <Link to="/privacy" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">{t.nav.privacy}</Link>
              <Link to="/terms" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">{t.nav.terms}</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
