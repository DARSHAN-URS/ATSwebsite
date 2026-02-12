import { RESUME_TEMPLATES, type TemplateId } from "./pdfTemplates";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  selected: TemplateId;
  onChange: (id: TemplateId) => void;
}

export default function TemplateSelector({ selected, onChange }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {RESUME_TEMPLATES.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-left transition-all hover:border-primary/60",
            selected === t.id
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-card"
          )}
        >
          <span className="text-2xl">{t.preview}</span>
          <span className="text-sm font-medium">{t.name}</span>
          <span className="text-[11px] text-muted-foreground text-center leading-tight">{t.description}</span>
        </button>
      ))}
    </div>
  );
}
