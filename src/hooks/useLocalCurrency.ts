// Maps user locale/timezone to local currency with approximate Pro plan pricing
const CURRENCY_MAP: Record<string, { code: string; symbol: string; proPrices: { weekly: number; biweekly: number; monthly: number } }> = {
  IN: { code: "INR", symbol: "₹", proPrices: { weekly: 198, biweekly: 358, monthly: 598 } },
  US: { code: "USD", symbol: "$", proPrices: { weekly: 2.38, biweekly: 4.18, monthly: 6.98 } },
  GB: { code: "GBP", symbol: "£", proPrices: { weekly: 1.98, biweekly: 3.38, monthly: 5.58 } },
  EU: { code: "EUR", symbol: "€", proPrices: { weekly: 2.18, biweekly: 3.78, monthly: 6.38 } },
  CA: { code: "CAD", symbol: "CA$", proPrices: { weekly: 3.18, biweekly: 5.78, monthly: 9.58 } },
  AU: { code: "AUD", symbol: "A$", proPrices: { weekly: 3.58, biweekly: 6.58, monthly: 10.98 } },
  JP: { code: "JPY", symbol: "¥", proPrices: { weekly: 358, biweekly: 638, monthly: 1040 } },
  AE: { code: "AED", symbol: "AED ", proPrices: { weekly: 8.98, biweekly: 15.98, monthly: 25.98 } },
  SA: { code: "SAR", symbol: "SAR ", proPrices: { weekly: 8.98, biweekly: 15.98, monthly: 25.98 } },
  BR: { code: "BRL", symbol: "R$", proPrices: { weekly: 11.98, biweekly: 21.98, monthly: 35.98 } },
  MX: { code: "MXN", symbol: "MX$", proPrices: { weekly: 38, biweekly: 70, monthly: 118 } },
  NG: { code: "NGN", symbol: "₦", proPrices: { weekly: 3598, biweekly: 6598, monthly: 10998 } },
  ZA: { code: "ZAR", symbol: "R", proPrices: { weekly: 42, biweekly: 78, monthly: 128 } },
  PH: { code: "PHP", symbol: "₱", proPrices: { weekly: 138, biweekly: 238, monthly: 398 } },
  BD: { code: "BDT", symbol: "৳", proPrices: { weekly: 258, biweekly: 478, monthly: 798 } },
  PK: { code: "PKR", symbol: "Rs", proPrices: { weekly: 658, biweekly: 1198, monthly: 1998 } },
  LK: { code: "LKR", symbol: "Rs", proPrices: { weekly: 658, biweekly: 1198, monthly: 1998 } },
  KR: { code: "KRW", symbol: "₩", proPrices: { weekly: 3098, biweekly: 5598, monthly: 9380 } },
  SG: { code: "SGD", symbol: "S$", proPrices: { weekly: 3.18, biweekly: 5.58, monthly: 9.38 } },
  MY: { code: "MYR", symbol: "RM", proPrices: { weekly: 9.98, biweekly: 17.98, monthly: 29.98 } },
  ID: { code: "IDR", symbol: "Rp", proPrices: { weekly: 35800, biweekly: 65800, monthly: 109800 } },
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
