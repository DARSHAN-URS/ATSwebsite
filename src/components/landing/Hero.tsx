import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, Star, ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="relative pt-40 pb-20 md:pt-60 md:pb-40 overflow-hidden bg-white dark:bg-slate-950">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4" />

      <div className="container mx-auto px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm mx-auto"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              The modern standard for professionals
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-7xl md:text-[10rem] font-black text-slate-900 dark:text-white leading-[0.85] tracking-tighter"
          >
            Build <br />
            <span className="text-primary italic">elite.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed"
          >
            High-performance resume engineering for ambitious professionals. 
            Optimized for ATS, handcrafted for design excellence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
          >
            <Link to="/auth">
              <Button className="bg-primary text-white font-black uppercase tracking-widest text-xs h-16 px-12 rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all group">
                Get Started Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="ghost" className="font-black uppercase tracking-widest text-xs h-16 px-10 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900">
              View Examples
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
