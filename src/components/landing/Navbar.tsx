import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X, ChevronRight } from "lucide-react";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.resumeTemplates, path: "/resume-templates" },
    { name: t.nav.interviewPrep, path: "/interview-preparation" },
    { name: t.nav.pricing, path: "/pricing" },
    { name: t.nav.blog, path: "/blog" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 md:px-8",
        isScrolled ? "py-2 md:py-4" : "py-4 md:py-8"
      )}
    >
      <div className="container mx-auto max-w-7xl">
        <div
          className={cn(
            "flex items-center justify-between px-4 py-3 md:px-8 md:py-4 transition-all duration-500 rounded-2xl md:rounded-[2rem]",
            isScrolled 
              ? "bg-slate-950/95 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-slate-800/50" 
              : "bg-slate-950/95 backdrop-blur-xl border border-slate-800/30"
          )}
        >
          <Link to="/" className="flex items-center gap-2 md:gap-3 group text-white">
            <Logo variant="light" className="h-8 md:h-14" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.path} 
                className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <LanguageSwitcher />
            <Link to="/auth">
              <Button variant="ghost" className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600">
                {t.nav.logIn}
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-[1.5rem] px-10 h-14 shadow-2xl shadow-slate-900/20 group">
                {t.nav.getStarted}
                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-2 md:gap-4">
            <LanguageSwitcher className="h-8 md:h-9 px-2 md:px-3 text-[10px] md:text-sm" />
            <button
              className="text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="lg:hidden absolute top-full left-0 right-0 mt-2 md:mt-4 px-4 md:px-8"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 flex flex-col gap-4 md:gap-6 shadow-2xl border border-slate-100 dark:border-slate-800">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  to={link.path} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-black text-slate-900 dark:text-white hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="text-lg font-black text-slate-900 dark:text-white">{t.nav.logIn}</Link>
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-primary text-white font-black uppercase tracking-widest text-xs h-14 rounded-2xl">
                  {t.nav.getStarted}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
