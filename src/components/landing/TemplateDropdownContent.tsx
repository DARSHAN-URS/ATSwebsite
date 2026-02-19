import { RESUME_TEMPLATES } from "@/components/resume/pdfTemplates";
import TemplateThumbnail from "@/components/resume/TemplateThumbnail";

interface Props {
  onSelect: () => void;
}

export default function TemplateDropdownContent({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {RESUME_TEMPLATES.map((tmpl) => (
        <button
          key={tmpl.id}
          onClick={onSelect}
          className="group/item flex flex-col rounded-lg border border-border/40 bg-background overflow-hidden transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="p-1">
            <TemplateThumbnail templateId={tmpl.id} />
          </div>
          <div className="px-2 pb-2 pt-0.5">
            <span className="text-[11px] font-semibold">{tmpl.name}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
