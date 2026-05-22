import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

declare global {
  interface Window {
    grantCookieConsent?: () => void;
  }
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay so it doesn't pop up too aggressively immediately
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setIsVisible(false);
    if (window.grantCookieConsent) {
      window.grantCookieConsent();
    } else {
      localStorage.setItem("cookie-consent", "true");
    }
  };

  const handleDecline = () => {
    setIsVisible(false);
    localStorage.setItem("cookie-consent", "false");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 z-[100] md:max-w-sm"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">We value your privacy</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies.
                    <br />
                    <Link to="/privacy-policy" className="text-blue-600 hover:underline">Learn more</Link>
                  </p>
                </div>
              </div>
              <button onClick={() => setIsVisible(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={handleDecline}
                className="flex-1 h-9 text-xs font-bold"
              >
                Decline
              </Button>
              <Button 
                onClick={handleAccept}
                className="flex-1 h-9 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
              >
                Accept All
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
