import { RESUME_TEMPLATES, type TemplateId } from "./pdfTemplates";
import { cn } from "@/lib/utils";
import TemplateThumbnail from "./TemplateThumbnail";

interface TemplateSelectorProps {
  selected: TemplateId;
  onChange: (id: TemplateId) => void;
}

export default function TemplateSelector({ selected, onChange }: TemplateSelectorProps) {
  const categories = Array.from(new Set(RESUME_TEMPLATES.map(t => t.category || "Other")));

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category}>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{category}</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {RESUME_TEMPLATES.filter(t => (t.category || "Other") === category).map((t) => (
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
                  <span className="text-sm font-semibold leading-tight">{t.name}</span>
                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 mt-0.5">{t.description}</p>
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
      ))}
    </div>
  );
}
