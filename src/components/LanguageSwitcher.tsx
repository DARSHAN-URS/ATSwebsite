import { useLanguage } from "@/i18n/LanguageContext";
import { localeNames, type Locale } from "@/i18n/translations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
      <SelectTrigger className={className || "w-[140px] h-8 text-xs bg-background text-foreground border-border"}>
        <Globe className="h-3.5 w-3.5 mr-1 shrink-0" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="z-50 bg-popover border border-border shadow-lg">
        {(Object.entries(localeNames) as [Locale, string][]).map(([code, name]) => (
          <SelectItem key={code} value={code} className="text-sm">
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
