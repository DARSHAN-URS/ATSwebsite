export type Locale = "en" | "ar" | "es" | "fr" | "hi" | "pt" | "de" | "zh" | "ja" | "ko";

export const localeNames: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  es: "Español",
  fr: "Français",
  hi: "हिन्दी",
  pt: "Português",
  de: "Deutsch",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
};

export const rtlLocales: Locale[] = ["ar"];
