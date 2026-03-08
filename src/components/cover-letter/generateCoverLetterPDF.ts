import jsPDF from "jspdf";
import type { CoverLetterData } from "@/pages/CoverLetters";

interface GenerateCoverLetterPdfArgs {
  title: string;
  data: CoverLetterData;
  isLegacy: boolean;
}

const PAGE_MARGIN = 56;
const TOP_MARGIN = 56;
const BOTTOM_MARGIN = 56;
const DEFAULT_LINE_HEIGHT = 16;

const cleanFilename = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || "cover-letter";

export function generateCoverLetterPDF({ title, data, isLegacy }: GenerateCoverLetterPdfArgs) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - PAGE_MARGIN * 2;

  let y = TOP_MARGIN;

  const ensureSpace = (needed = DEFAULT_LINE_HEIGHT) => {
    if (y + needed > pageHeight - BOTTOM_MARGIN) {
      doc.addPage();
      y = TOP_MARGIN;
    }
  };

  const writeLine = (
    text?: string,
    options: { bold?: boolean; size?: number; lineHeight?: number } = {},
  ) => {
    if (!text?.trim()) return;
    const lineHeight = options.lineHeight ?? DEFAULT_LINE_HEIGHT;
    ensureSpace(lineHeight);
    doc.setFont("times", options.bold ? "bold" : "normal");
    doc.setFontSize(options.size ?? 12);
    doc.text(text.trim(), PAGE_MARGIN, y);
    y += lineHeight;
  };

  const writeParagraph = (text?: string) => {
    if (!text?.trim()) return;
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(text.trim(), maxWidth) as string[];
    lines.forEach((line) => {
      ensureSpace(DEFAULT_LINE_HEIGHT);
      doc.text(line, PAGE_MARGIN, y);
      y += DEFAULT_LINE_HEIGHT;
    });
    y += 8;
  };

  const addRule = () => {
    ensureSpace(18);
    doc.setDrawColor(200);
    doc.line(PAGE_MARGIN, y, pageWidth - PAGE_MARGIN, y);
    y += 14;
  };

  if (isLegacy) {
    writeParagraph(data.greeting);
    writeParagraph(data.opening);
    writeParagraph(data.body);
    writeParagraph(data.closing);
  } else {
    writeLine(data.applicant_name, { bold: true, size: 14, lineHeight: 18 });
    writeLine(data.applicant_address, { size: 11, lineHeight: 14 });
    writeLine(data.applicant_phone, { size: 11, lineHeight: 14 });
    writeLine(data.applicant_email, { size: 11, lineHeight: 14 });
    writeLine(data.applicant_linkedin, { size: 11, lineHeight: 14 });

    y += 10;
    writeLine(data.date, { size: 11, lineHeight: 14 });
    y += 10;

    writeLine(data.recipient_name, { bold: true, size: 12, lineHeight: 15 });
    writeLine(data.recipient_title, { size: 11, lineHeight: 14 });
    writeLine(data.company_name, { size: 11, lineHeight: 14 });
    writeLine(data.company_address, { size: 11, lineHeight: 14 });

    y += 6;
    addRule();

    if (data.subject_line?.trim()) {
      writeLine(data.subject_line, { bold: true, size: 12, lineHeight: 16 });
      addRule();
    }

    writeParagraph(data.greeting);
    writeParagraph(data.opening);
    writeParagraph(data.value_experience);
    writeParagraph(data.why_company);
    writeParagraph(data.closing);

    y += 8;
    writeLine(data.sign_off || "Sincerely,", { size: 12, lineHeight: 16 });
    y += 20;
    writeLine(data.applicant_name, { bold: true, size: 12, lineHeight: 16 });
  }

  doc.save(`${cleanFilename(title)}.pdf`);
}
