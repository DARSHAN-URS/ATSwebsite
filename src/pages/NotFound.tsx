import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { miscTranslations } from "@/i18n/miscTranslations";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SearchX, Zap, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const mt = t.misc.notFound;

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-8 text-center font-sans">
      <SEOHead
        title={mt.seoTitle}
        description={mt.seoDesc}
        noindex
      />
      
      <div className="relative max-w-2xl w-full">
         {/* Background Elements */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full lg:w-[500px] h-auto lg:h-[500px] bg-blue-600/5 rounded-full blur-[100px] -z-10" />
         
         <div className="space-y-12">
            <motion.div 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-3 px-5 py-2 bg-slate-900 text-white rounded-full"
            >
               <ShieldAlert className="w-4 h-4 text-blue-400" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">{mt.anomalyDetected}</span>
            </motion.div>

            <div className="space-y-6">
               <motion.h1 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.1 }}
                  className="text-9xl md:text-[12rem] font-black text-slate-900 dark:text-white tracking-tighter leading-none"
               >
                  {mt.title}<span className="text-blue-600">.</span>
               </motion.h1>
               <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
               >
                  <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{mt.subtitle}</h2>
                  <p className="text-slate-500 font-medium text-lg max-w-md mx-auto leading-relaxed">
                     {mt.resourceDecommissioned} <code className="px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded text-blue-600 font-bold">{location.pathname}</code>
                  </p>
               </motion.div>
            </div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }} 
               transition={{ delay: 0.3 }}
               className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12"
            >
               <Button asChild className="h-16 px-10 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl shadow-blue-600/20 hover:scale-105 transition-all">
                  <Link to="/" className="flex items-center gap-3">
                     <ArrowLeft className="w-4 h-4" /> {mt.returnHome}
                  </Link>
               </Button>
               <Button asChild variant="outline" className="h-16 px-10 border-slate-200 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900">
                  <Link to="/contact">{mt.reportAnomaly}</Link>
               </Button>
            </motion.div>
         </div>

         {/* Technical Decoration */}
         <div className="mt-24 pt-12 border-t border-slate-100 dark:border-slate-900 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-30">
            <div className="text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{mt.status}</p>
               <p className="text-xs font-black text-rose-600">{mt.terminated}</p>
            </div>
            <div className="text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{mt.traceId}</p>
               <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{Math.random().toString(36).substring(7)}</p>
            </div>
            <div className="text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{mt.module}</p>
               <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{mt.routingEngine}</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default NotFound;
