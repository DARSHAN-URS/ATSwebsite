import jsPDF from "jspdf";
import type { ResumeData } from "./types";

export type TemplateId = "classic" | "modern" | "minimal" | "executive";

export interface ResumeTemplate {
  id: TemplateId;
  name: string;
  description: string;
  preview: string; // emoji/icon hint
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  { id: "classic", name: "Classic", description: "Traditional layout with serif-style headers and clean dividers", preview: "📄" },
  { id: "modern", name: "Modern", description: "Bold accent bar with contemporary spacing and styling", preview: "🎨" },
  { id: "minimal", name: "Minimal", description: "Ultra-clean with generous whitespace and subtle typography", preview: "✨" },
  { id: "executive", name: "Executive", description: "Professional dark header block with structured sections", preview: "💼" },
];

interface PdfContext {
  doc: jsPDF;
  y: number;
  margin: number;
  pageWidth: number;
  maxWidth: number;
}

function checkPageBreak(ctx: PdfContext, needed: number) {
  if (ctx.y + needed > ctx.doc.internal.pageSize.getHeight() - 15) {
    ctx.doc.addPage();
    ctx.y = 20;
  }
}

// ─── Classic ───────────────────────────────────────────
function renderClassic(doc: jsPDF, data: ResumeData, title: string) {
  const ctx: PdfContext = { doc, y: 22, margin: 20, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};

  const addSection = (label: string) => {
    checkPageBreak(ctx, 12);
    ctx.y += 4;
    doc.setDrawColor(180);
    doc.line(ctx.margin, ctx.y, ctx.pageWidth - ctx.margin, ctx.y);
    ctx.y += 6;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(label, ctx.margin, ctx.y);
    ctx.y += 6;
  };

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(pi.fullName || title || "Resume", ctx.margin, ctx.y);
  ctx.y += 7;
  renderContactAndLinks(ctx, pi);
  renderBody(ctx, data, addSection);
}

// ─── Modern ────────────────────────────────────────────
function renderModern(doc: jsPDF, data: ResumeData, title: string) {
  const ctx: PdfContext = { doc, y: 20, margin: 20, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};

  // Accent bar
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 0, ctx.pageWidth, 4, "F");
  ctx.y = 18;

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text(pi.fullName || title || "Resume", ctx.margin, ctx.y);
  doc.setTextColor(0);
  ctx.y += 7;
  renderContactAndLinks(ctx, pi);

  const addSection = (label: string) => {
    checkPageBreak(ctx, 14);
    ctx.y += 6;
    doc.setFillColor(37, 99, 235);
    doc.rect(ctx.margin, ctx.y - 3, 3, 10, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text(label.toUpperCase(), ctx.margin + 6, ctx.y + 4);
    doc.setTextColor(0);
    ctx.y += 10;
  };

  renderBody(ctx, data, addSection);
}

// ─── Minimal ───────────────────────────────────────────
function renderMinimal(doc: jsPDF, data: ResumeData, title: string) {
  const ctx: PdfContext = { doc, y: 28, margin: 25, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};

  doc.setFontSize(18);
  doc.setFont("helvetica", "normal");
  doc.text(pi.fullName || title || "Resume", ctx.margin, ctx.y);
  ctx.y += 6;
  renderContactAndLinks(ctx, pi);

  const addSection = (label: string) => {
    checkPageBreak(ctx, 14);
    ctx.y += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(130);
    doc.text(label.toUpperCase(), ctx.margin, ctx.y);
    doc.setTextColor(0);
    ctx.y += 5;
  };

  renderBody(ctx, data, addSection);
}

// ─── Executive ─────────────────────────────────────────
function renderExecutive(doc: jsPDF, data: ResumeData, title: string) {
  const ctx: PdfContext = { doc, y: 20, margin: 20, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};

  // Dark header block
  doc.setFillColor(30, 30, 30);
  doc.rect(0, 0, ctx.pageWidth, 38, "F");

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255);
  doc.text(pi.fullName || title || "Resume", ctx.margin, 18);

  // Contact in header
  const parts: string[] = [];
  if (pi.email) parts.push(pi.email);
  if (pi.phone) parts.push(pi.phone);
  if (pi.location) parts.push(pi.location);
  if (pi.linkedin) parts.push(pi.linkedin);
  if (pi.portfolio) parts.push(pi.portfolio);
  if (parts.length) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200);
    doc.text(parts.join("   |   "), ctx.margin, 28);
  }
  doc.setTextColor(0);
  ctx.y = 48;

  const addSection = (label: string) => {
    checkPageBreak(ctx, 14);
    ctx.y += 5;
    doc.setFillColor(30, 30, 30);
    doc.rect(ctx.margin, ctx.y - 3, ctx.maxWidth, 8, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255);
    doc.text(label.toUpperCase(), ctx.margin + 3, ctx.y + 3);
    doc.setTextColor(0);
    ctx.y += 10;
  };

  renderBody(ctx, data, addSection);
}

// ─── Shared helpers ────────────────────────────────────
function renderContactAndLinks(ctx: PdfContext, pi: ResumeData["personalInfo"]) {
  if (!pi) return;
  const { doc } = ctx;
  const contactParts: string[] = [];
  if (pi.email) contactParts.push(pi.email);
  if (pi.phone) contactParts.push(pi.phone);
  if (pi.location) contactParts.push(pi.location);
  if (contactParts.length) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(contactParts.join("  •  "), ctx.margin, ctx.y);
    ctx.y += 5;
  }
  const linkParts: string[] = [];
  if (pi.linkedin) linkParts.push(pi.linkedin);
  if (pi.portfolio) linkParts.push(pi.portfolio);
  if (linkParts.length) {
    doc.setFontSize(9);
    doc.setTextColor(0, 102, 204);
    doc.text(linkParts.join("  •  "), ctx.margin, ctx.y);
    doc.setTextColor(0);
    ctx.y += 5;
  }
}

function renderBody(ctx: PdfContext, data: ResumeData, addSection: (t: string) => void) {
  const { doc } = ctx;

  if (data.summary) {
    addSection("Summary");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(data.summary, ctx.maxWidth);
    checkPageBreak(ctx, lines.length * 5);
    doc.text(lines, ctx.margin, ctx.y);
    ctx.y += lines.length * 5;
  }

  if ((data.skills || []).length > 0) {
    addSection("Skills");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize((data.skills || []).join("  •  "), ctx.maxWidth);
    checkPageBreak(ctx, lines.length * 5);
    doc.text(lines, ctx.margin, ctx.y);
    ctx.y += lines.length * 5;
  }

  if ((data.experience || []).length > 0) {
    addSection("Experience");
    (data.experience || []).forEach((exp) => {
      checkPageBreak(ctx, 14);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${exp.title} — ${exp.company}`, ctx.margin, ctx.y);
      ctx.y += 5;
      doc.setFont("helvetica", "normal");
      if (exp.bullets?.length) {
        exp.bullets.forEach((bullet) => {
          const lines = doc.splitTextToSize(`•  ${bullet}`, ctx.maxWidth - 4);
          checkPageBreak(ctx, lines.length * 5);
          doc.text(lines, ctx.margin + 2, ctx.y);
          ctx.y += lines.length * 5;
        });
      } else if (exp.description) {
        const lines = doc.splitTextToSize(exp.description, ctx.maxWidth);
        checkPageBreak(ctx, lines.length * 5);
        doc.text(lines, ctx.margin, ctx.y);
        ctx.y += lines.length * 5;
      }
      ctx.y += 2;
    });
  }

  if ((data.education || []).length > 0) {
    addSection("Education");
    (data.education || []).forEach((edu) => {
      checkPageBreak(ctx, 7);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${edu.degree} — ${edu.school}${edu.year ? ` (${edu.year})` : ""}`, ctx.margin, ctx.y);
      ctx.y += 6;
    });
  }

  (data.customSections || []).filter((s) => s.title).forEach((section) => {
    addSection(section.title);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    section.items.filter(Boolean).forEach((item) => {
      const lines = doc.splitTextToSize(`•  ${item}`, ctx.maxWidth - 4);
      checkPageBreak(ctx, lines.length * 5);
      doc.text(lines, ctx.margin + 2, ctx.y);
      ctx.y += lines.length * 5;
    });
  });
}

// ─── Main export ───────────────────────────────────────
export function generateResumePDF(data: ResumeData, title: string, templateId: TemplateId = "classic") {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  switch (templateId) {
    case "modern":
      renderModern(doc, data, title);
      break;
    case "minimal":
      renderMinimal(doc, data, title);
      break;
    case "executive":
      renderExecutive(doc, data, title);
      break;
    default:
      renderClassic(doc, data, title);
  }

  const pi = data.personalInfo || {};
  const filename = `${(pi.fullName || title || "resume").replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
}
