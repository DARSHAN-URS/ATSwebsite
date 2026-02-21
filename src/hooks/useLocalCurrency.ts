// Maps user locale/timezone to local currency with approximate Pro plan pricing
const CURRENCY_MAP: Record<string, { code: string; symbol: string; proPrices: { weekly: number; biweekly: number; monthly: number } }> = {
  IN: { code: "INR", symbol: "₹", proPrices: { weekly: 99, biweekly: 179, monthly: 299 } },
  US: { code: "USD", symbol: "$", proPrices: { weekly: 1.19, biweekly: 2.09, monthly: 3.49 } },
  GB: { code: "GBP", symbol: "£", proPrices: { weekly: 0.99, biweekly: 1.69, monthly: 2.79 } },
  EU: { code: "EUR", symbol: "€", proPrices: { weekly: 1.09, biweekly: 1.89, monthly: 3.19 } },
  CA: { code: "CAD", symbol: "CA$", proPrices: { weekly: 1.59, biweekly: 2.89, monthly: 4.79 } },
  AU: { code: "AUD", symbol: "A$", proPrices: { weekly: 1.79, biweekly: 3.29, monthly: 5.49 } },
  JP: { code: "JPY", symbol: "¥", proPrices: { weekly: 179, biweekly: 319, monthly: 520 } },
  AE: { code: "AED", symbol: "AED ", proPrices: { weekly: 4.49, biweekly: 7.99, monthly: 12.99 } },
  SA: { code: "SAR", symbol: "SAR ", proPrices: { weekly: 4.49, biweekly: 7.99, monthly: 12.99 } },
  BR: { code: "BRL", symbol: "R$", proPrices: { weekly: 5.99, biweekly: 10.99, monthly: 17.99 } },
  MX: { code: "MXN", symbol: "MX$", proPrices: { weekly: 19, biweekly: 35, monthly: 59 } },
  NG: { code: "NGN", symbol: "₦", proPrices: { weekly: 1799, biweekly: 3299, monthly: 5499 } },
  ZA: { code: "ZAR", symbol: "R", proPrices: { weekly: 21, biweekly: 39, monthly: 64 } },
  PH: { code: "PHP", symbol: "₱", proPrices: { weekly: 69, biweekly: 119, monthly: 199 } },
  BD: { code: "BDT", symbol: "৳", proPrices: { weekly: 129, biweekly: 239, monthly: 399 } },
  PK: { code: "PKR", symbol: "Rs", proPrices: { weekly: 329, biweekly: 599, monthly: 999 } },
  LK: { code: "LKR", symbol: "Rs", proPrices: { weekly: 329, biweekly: 599, monthly: 999 } },
  KR: { code: "KRW", symbol: "₩", proPrices: { weekly: 1549, biweekly: 2799, monthly: 4690 } },
  SG: { code: "SGD", symbol: "S$", proPrices: { weekly: 1.59, biweekly: 2.79, monthly: 4.69 } },
  MY: { code: "MYR", symbol: "RM", proPrices: { weekly: 4.99, biweekly: 8.99, monthly: 14.99 } },
  ID: { code: "IDR", symbol: "Rp", proPrices: { weekly: 17900, biweekly: 32900, monthly: 54900 } },
};

// Timezone → country code heuristic
const TZ_COUNTRY: Record<string, string> = {
  "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US", "America/Los_Angeles": "US",
  "America/Toronto": "CA", "America/Vancouver": "CA",
  "Europe/London": "GB",
  "Europe/Paris": "EU", "Europe/Berlin": "EU", "Europe/Madrid": "EU", "Europe/Rome": "EU", "Europe/Amsterdam": "EU",
  "Asia/Kolkata": "IN", "Asia/Calcutta": "IN",
  "Asia/Tokyo": "JP",
  "Asia/Dubai": "AE",
  "Asia/Riyadh": "SA",
  "America/Sao_Paulo": "BR",
  "America/Mexico_City": "MX",
  "Africa/Lagos": "NG",
  "Africa/Johannesburg": "ZA",
  "Asia/Manila": "PH",
  "Asia/Dhaka": "BD",
  "Asia/Karachi": "PK",
  "Asia/Colombo": "LK",
  "Asia/Seoul": "KR",
  "Asia/Singapore": "SG",
  "Asia/Kuala_Lumpur": "MY",
  "Asia/Jakarta": "ID",
  "Australia/Sydney": "AU", "Australia/Melbourne": "AU",
};

const EU_LANGUAGES = ["de", "fr", "es", "it", "nl", "pt", "el", "pl", "cs", "sv", "da", "fi", "ro", "hu", "bg", "hr", "sk", "sl", "et", "lv", "lt"];

function detectCountry(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TZ_COUNTRY[tz]) return TZ_COUNTRY[tz];

    const lang = navigator.language?.toLowerCase() || "";
    if (lang.includes("-in") || lang === "hi") return "IN";
    if (lang.includes("-us") || lang === "en") return "US";
    if (lang.includes("-gb")) return "GB";
    if (lang.includes("-au")) return "AU";
    if (lang.includes("-ca")) return "CA";
    if (lang.includes("-br") || lang === "pt-br") return "BR";
    if (lang.includes("-jp") || lang === "ja") return "JP";
    if (lang.includes("-kr") || lang === "ko") return "KR";
    if (lang.includes("-sa") || lang === "ar") return "SA";

    const primary = lang.split("-")[0];
    if (EU_LANGUAGES.includes(primary)) return "EU";
  } catch {}
  return "US"; // fallback
}

export function useLocalCurrency() {
  const country = detectCountry();
  const info = CURRENCY_MAP[country] || CURRENCY_MAP["US"];

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    const formatted = price >= 100 ? Math.round(price).toLocaleString() : price.toFixed(2).replace(/\.00$/, "");
    return `${info.symbol}${formatted}`;
  };

  return {
    ...info,
    country,
    proPrices: info.proPrices,
    formatPrice,
    formatProPrice: (duration: "weekly" | "biweekly" | "monthly" = "monthly") => formatPrice(info.proPrices[duration]),
  };
}
