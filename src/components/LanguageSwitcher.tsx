import { useLanguage } from "@/i18n/LanguageContext";
import { localeNames, type Locale } from "@/i18n/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-10 px-4 rounded-full border border-slate-200/50 bg-white/50 backdrop-blur-md hover:bg-white transition-all duration-300 gap-2 text-slate-600",
            className
          )}
        >
          <Globe className="h-4 w-4" />
          <span className="text-xs font-bold">{localeNames[locale]}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[180px] p-2 rounded-[24px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] border-slate-100 mt-2"
      >
        {(Object.entries(localeNames) as [Locale, string][]).map(([code, name]) => {
          const isActive = locale === code;
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => setLocale(code)}
              className={cn(
                "flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 mb-0.5 last:mb-0",
                isActive 
                  ? "bg-yellow-400 text-slate-900 font-bold hover:bg-yellow-500 focus:bg-yellow-400" 
                  : "text-slate-600 hover:bg-slate-50 focus:bg-slate-50"
              )}
            >
              <span className="text-sm">{name}</span>
              {isActive && <Check className="h-4 w-4 ml-2" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
