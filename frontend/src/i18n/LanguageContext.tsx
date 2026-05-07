import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { rtlLocales, type Locale, type TranslationKeys } from "./translations";

// Import only English eagerly — it's the default and needed at startup.
// All other locales are dynamically imported to avoid a 135KB bundle hit on first load.
import { en } from "./translations";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  t: en,
  isRTL: false,
});

async function loadLocale(locale: Locale): Promise<TranslationKeys> {
  if (locale === "en") return en;
  // Dynamic import so non-English translations are code-split into separate chunks
  const { translations } = await import("./translations");
  return translations[locale];
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem("app-locale");
    return (saved as Locale) || "en";
  });
  const [t, setT] = useState<TranslationKeys>(en);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("app-locale", l);
  };

  useEffect(() => {
    loadLocale(locale).then(setT);
  }, [locale]);

  const isRTL = rtlLocales.includes(locale);

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale, isRTL]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
