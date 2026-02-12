import { useEffect, useState, useRef } from "react";
import { generateResumePDFBlobUrl, type TemplateId } from "./pdfTemplates";
import type { ResumeData } from "./types";
import { Loader2 } from "lucide-react";

interface ResumePreviewProps {
  resumeData: ResumeData;
  title: string;
  templateId: TemplateId;
}

export default function ResumePreview({ resumeData, title, templateId }: ResumePreviewProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        const url = generateResumePDFBlobUrl(resumeData, title, templateId);
        setBlobUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } catch {
        // silently handle
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [resumeData, title, templateId]);

  return (
    <div className="h-full w-full flex flex-col rounded-lg border bg-muted/30 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <span className="text-sm font-medium text-muted-foreground">Live Preview</span>
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      </div>
      <div className="flex-1 min-h-0">
        {blobUrl ? (
          <iframe
            src={blobUrl}
            className="w-full h-full border-0"
            title="Resume preview"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Generating preview…
          </div>
        )}
      </div>
    </div>
  );
}
