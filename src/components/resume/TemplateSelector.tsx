import { RESUME_TEMPLATES, type TemplateId } from "./pdfTemplates";
import { cn } from "@/lib/utils";
import { FileText, Palette, Sparkles, Briefcase, LayoutDashboard, Columns2, Target, ListChecks, Building2, Bot, PenLine, GemIcon } from "lucide-react";

const templateIcons: Record<TemplateId, React.ReactNode> = {
  classic: <FileText className="h-5 w-5" />,
  modern: <Palette className="h-5 w-5" />,
  minimal: <Sparkles className="h-5 w-5" />,
  executive: <Briefcase className="h-5 w-5" />,
  sidebar: <LayoutDashboard className="h-5 w-5" />,
  twocolumn: <Columns2 className="h-5 w-5" />,
  creative: <Target className="h-5 w-5" />,
  compact: <ListChecks className="h-5 w-5" />,
  professional: <Building2 className="h-5 w-5" />,
  ats: <Bot className="h-5 w-5" />,
  simple: <PenLine className="h-5 w-5" />,
  elegant: <GemIcon className="h-5 w-5" />,
};

interface TemplateSelectorProps {
  selected: TemplateId;
  onChange: (id: TemplateId) => void;
}

export default function TemplateSelector({ selected, onChange }: TemplateSelectorProps) {
  // Group templates by category
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
                  "group relative flex flex-col items-start gap-1.5 rounded-xl border-2 p-3 text-left transition-all hover:border-primary/60 hover:shadow-md",
                  selected === t.id
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                    : "border-border bg-card hover:bg-accent/30"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
                  selected === t.id
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/5"
                )}>
                  {templateIcons[t.id]}
                </div>
                <span className="text-sm font-semibold leading-tight">{t.name}</span>
                <span className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{t.description}</span>
                {selected === t.id && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
