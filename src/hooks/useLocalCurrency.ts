// Maps user locale/timezone to local currency with approximate Pro plan pricing
const CURRENCY_MAP: Record<string, { code: string; symbol: string; proPrice: number }> = {
  IN: { code: "INR", symbol: "₹", proPrice: 299 },
  US: { code: "USD", symbol: "$", proPrice: 3.49 },
  GB: { code: "GBP", symbol: "£", proPrice: 2.79 },
  EU: { code: "EUR", symbol: "€", proPrice: 3.19 },
  CA: { code: "CAD", symbol: "CA$", proPrice: 4.79 },
  AU: { code: "AUD", symbol: "A$", proPrice: 5.49 },
  JP: { code: "JPY", symbol: "¥", proPrice: 520 },
  AE: { code: "AED", symbol: "AED ", proPrice: 12.99 },
  SA: { code: "SAR", symbol: "SAR ", proPrice: 12.99 },
  BR: { code: "BRL", symbol: "R$", proPrice: 17.99 },
  MX: { code: "MXN", symbol: "MX$", proPrice: 59 },
  NG: { code: "NGN", symbol: "₦", proPrice: 5499 },
  ZA: { code: "ZAR", symbol: "R", proPrice: 64 },
  PH: { code: "PHP", symbol: "₱", proPrice: 199 },
  BD: { code: "BDT", symbol: "৳", proPrice: 399 },
  PK: { code: "PKR", symbol: "Rs", proPrice: 999 },
  LK: { code: "LKR", symbol: "Rs", proPrice: 999 },
  KR: { code: "KRW", symbol: "₩", proPrice: 4690 },
  SG: { code: "SGD", symbol: "S$", proPrice: 4.69 },
  MY: { code: "MYR", symbol: "RM", proPrice: 14.99 },
  ID: { code: "IDR", symbol: "Rp", proPrice: 54900 },
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
    // No decimals for large values
    const formatted = price >= 100 ? Math.round(price).toLocaleString() : price.toFixed(2).replace(/\.00$/, "");
    return `${info.symbol}${formatted}`;
  };

  return {
    ...info,
    country,
    proPrice: info.proPrice,
    formatPrice,
    formatProPrice: () => formatPrice(info.proPrice),
  };
}
