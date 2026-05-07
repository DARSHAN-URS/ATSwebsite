import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Templates", path: "/resume-templates" },
    { name: "Interview Prep", path: "/interview-preparation" },
    { name: "Pricing", path: "/pricing" },
    { name: "Blog", path: "/blog" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-8",
        isScrolled ? "py-4" : "py-8"
      )}
    >
      <div className="container mx-auto max-w-7xl">
        <div
          className={cn(
            "flex items-center justify-between px-8 py-4 transition-all duration-500 rounded-[2rem]",
            isScrolled 
              ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-slate-200/50 dark:border-slate-800/50" 
              : "bg-transparent border-transparent"
          )}
        >
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/20 group-hover:rotate-12 transition-transform duration-500">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
              RESUME<span className="text-blue-600">PRO</span>
            </span>
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
            <Link to="/auth">
              <Button variant="ghost" className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600">
                Log in
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl px-8 h-12 shadow-xl shadow-blue-600/20 group">
                Join Now
                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-slate-900 dark:text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="lg:hidden absolute top-full left-0 right-0 mt-4 px-8"
          >
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 flex flex-col gap-6 shadow-2xl border border-slate-100 dark:border-slate-800">
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
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="text-lg font-black text-slate-900 dark:text-white">Log in</Link>
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-primary text-white font-black uppercase tracking-widest text-xs h-14 rounded-2xl">
                  Get Started
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
