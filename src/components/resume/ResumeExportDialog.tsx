import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileType, FileCode, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/api-client";
import { generateResumePDF, type TemplateId } from "./pdfTemplates";
import { getATSConfig, isATSTemplateId } from "./atsTemplateConfig";
import { buildPdfRgbMap } from "./resumeColorMap";
import { DEFAULT_COLORS, type ResumeColors } from "@/hooks/useResumeColors";
import type { ResumeData } from "./types";

interface ResumeExportDialogProps {
  resumeData: ResumeData;
  title: string;
  templateId: TemplateId;
  colors?: ResumeColors;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

type ExportFormat = "pdf" | "docx" | "txt";

interface FormatOption {
  id: ExportFormat;
  label: string;
  description: string;
  icon: typeof FileText;
  atsNote: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: "pdf",
    label: "PDF",
    description: "Formatted resume with your selected template",
    icon: FileText,
    atsNote: "ATS-safe with clean text layers",
  },
  {
    id: "docx",
    label: "DOCX",
    description: "Microsoft Word format, widely accepted",
    icon: FileType,
    atsNote: "Best ATS compatibility — most parsers prefer DOCX",
  },
  {
    id: "txt",
    label: "Plain Text",
    description: "No formatting, maximum compatibility",
    icon: FileCode,
    atsNote: "100% parseable by all ATS systems",
  },
];

function validateResume(data: ResumeData): string[] {
  const errors: string[] = [];
  const pi = data.personalInfo || {};
  if (!pi.fullName?.trim()) errors.push("Full name is missing");
  if (!pi.email?.trim()) errors.push("Email is missing");
  if ((!data.experience || data.experience.length === 0) && (!data.education || data.education.length === 0)) {
    errors.push("Add at least one experience or education entry");
  }
  return errors;
}

function cleanFilename(name: string): string {
  return (name || "resume").replace(/[^a-zA-Z0-9\s_-]/g, "").replace(/\s+/g, "_").substring(0, 60);
}

export default function ResumeExportDialog({ 
  resumeData, 
  title, 
  templateId, 
  colors = DEFAULT_COLORS,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showTrigger = true
}: ResumeExportDialogProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setLocalOpen;
  
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  const { toast } = useToast();

  const validationErrors = validateResume(resumeData);
  const isValid = validationErrors.length === 0;
  const filename = cleanFilename(resumeData.personalInfo?.fullName || title);

  const handleExport = async (format: ExportFormat) => {
    if (!isValid) return;
    setExporting(format);

    try {
      if (format === "pdf") {
        const rgbMap = buildPdfRgbMap(templateId, colors);
        await generateResumePDF(resumeData, title, templateId, { rgbMap });
        toast({ title: "PDF downloaded successfully" });
        setExportSuccess(true);
      } else {
        const atsConfig = isATSTemplateId(templateId) ? getATSConfig(templateId) : undefined;
        const sectionOrder = atsConfig?.sectionOrder;
        const { data, error } = await invokeFunction("export-resume", {
          body: { resumeData, format, sectionOrder },
        });

        if (error) throw error;
        if (data?.error) {
          if (data.validationErrors) {
            toast({
              title: "Validation Error",
              description: data.validationErrors.join(", "),
              variant: "destructive",
            });
            return;
          }
          throw new Error(data.error);
        }

        // Decode base64 and trigger download
        const binaryStr = atob(data.data);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: data.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({ title: `${format.toUpperCase()} downloaded successfully` });
        setExportSuccess(true);
      }
    } catch (err: any) {
      console.error("Export error:", err);
      toast({
        title: "Export failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setExportSuccess(false); }}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Resume
          </DialogTitle>
          <DialogDescription>
            Choose a format optimized for ATS compatibility
          </DialogDescription>
        </DialogHeader>

        {/* Validation status */}
        {!isValid && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Fix before exporting:
            </div>
            <ul className="text-xs text-destructive/80 space-y-0.5 ml-6">
              {validationErrors.map((err, i) => (
                <li key={i}>• {err}</li>
              ))}
            </ul>
          </div>
        )}

        {isValid && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary">
              Resume is ready for export
            </span>
          </div>
        )}

        {/* Format options */}
        <div className="space-y-2">
          {FORMAT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isLoading = exporting === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleExport(opt.id)}
                disabled={!isValid || exporting !== null}
                className="w-full flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <Icon className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{opt.description}</div>
                  <div className="text-xs text-primary/70 mt-0.5">{opt.atsNote}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Trustpilot review nudge after successful export */}
        {exportSuccess && (
          <a
            href="https://www.trustpilot.com/evaluate/atsproresumebuilder.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border border-[#00b67a]/30 bg-[#00b67a]/5 hover:bg-[#00b67a]/10 transition-colors"
          >
            <div className="flex gap-0.5 shrink-0">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-3.5 w-3.5 text-[#00b67a]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Enjoying ATS Pro?</p>
              <p className="text-xs text-muted-foreground">Leave a review on Trustpilot ⭐</p>
            </div>
          </a>
        )}

        <p className="text-xs text-muted-foreground text-center">
          File will be saved as <span className="font-mono">{filename}.[format]</span>
        </p>
      </DialogContent>
    </Dialog>
  );
}
