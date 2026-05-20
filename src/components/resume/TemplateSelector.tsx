import { useState, useMemo } from "react";
import { RESUME_TEMPLATES, type TemplateId } from "./pdfTemplates";
import { recommendATSTemplate } from "./atsTemplateConfig";
import { cn } from "@/lib/utils";
import TemplateThumbnail from "./TemplateThumbnail";
import { LayoutGrid, FileText, Sparkles, Briefcase, Palette, BookOpen, ScanLine, Shield, Lightbulb } from "lucide-react";

interface TemplateSelectorProps {
  selected: TemplateId;
  onChange: (id: TemplateId) => void;
  jobTitle?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "All Templates": <LayoutGrid className="w-4 h-4" />,
  "Simple": <FileText className="w-4 h-4" />,
  "Modern": <Sparkles className="w-4 h-4" />,
  "Professional": <Briefcase className="w-4 h-4" />,
  "Creative": <Palette className="w-4 h-4" />,
  "Traditional": <BookOpen className="w-4 h-4" />,
  "ATS": <ScanLine className="w-4 h-4" />,
};

export default function TemplateSelector({ selected, onChange, jobTitle }: TemplateSelectorProps) {
  const categories = Array.from(new Set(RESUME_TEMPLATES.map(t => t.category || "Other")));
  const allTabs = ["All Templates", ...categories];
  const [activeTab, setActiveTab] = useState("All Templates");

  const filtered = activeTab === "All Templates"
    ? RESUME_TEMPLATES
    : RESUME_TEMPLATES.filter(t => (t.category || "Other") === activeTab);

  const recommendedId = useMemo(() => {
    if (!jobTitle) return null;
    return recommendATSTemplate(jobTitle);
  }, [jobTitle]);

  return (
    <div className="space-y-4">
      {/* Auto-recommendation banner */}
      {recommendedId && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-2.5">
          <Lightbulb className="h-4 w-4 text-primary shrink-0" />
          <p className="text-xs text-primary">
            <span className="font-medium">Suggested for "{jobTitle}":</span>{" "}
            {RESUME_TEMPLATES.find(t => t.id === recommendedId)?.name || recommendedId}
            <button
              onClick={() => onChange(recommendedId as TemplateId)}
              className="ml-2 underline font-medium hover:no-underline"
            >
              Use this
            </button>
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {allTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
              activeTab === tab
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
            )}
          >
            {CATEGORY_ICONS[tab] || <FileText className="w-4 h-4" />}
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "group relative flex flex-col rounded-xl border-2 overflow-hidden transition-all hover:border-primary/60 hover:shadow-md",
              selected === t.id
                ? "border-primary shadow-sm ring-1 ring-primary/20"
                : "border-border bg-card hover:bg-accent/30"
            )}
          >
            <div className="p-1.5">
              <TemplateThumbnail templateId={t.id} />
            </div>
            <div className="px-3 pb-2.5 pt-1 text-left">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold leading-tight">{t.name}</span>
                {t.isBestForATS && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider">
                    <Shield className="w-2.5 h-2.5" />
                    Best
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 mt-0.5">{t.description}</p>
              {t.recommendedFor && (
                <p className="text-[10px] text-primary/70 mt-0.5">{t.recommendedFor}</p>
              )}
            </div>
            {selected === t.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
