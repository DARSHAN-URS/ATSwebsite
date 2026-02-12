import jsPDF from "jspdf";
import type { ResumeData } from "./types";

export type TemplateId = "classic" | "modern" | "minimal" | "executive" | "sidebar" | "twocolumn" | "creative" | "compact";

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
  { id: "sidebar", name: "Sidebar", description: "Two-column layout with a colored sidebar for contact details", preview: "📊" },
  { id: "twocolumn", name: "Two Column", description: "Balanced two-column design for maximum content density", preview: "📰" },
  { id: "creative", name: "Creative", description: "Bold headings with accent colors and modern typography", preview: "🎯" },
  { id: "compact", name: "Compact", description: "Dense single-column layout optimized for ATS scanners", preview: "📋" },
];

interface PdfContext {
  doc: jsPDF;
  y: number;
  margin: number;
  pageWidth: number;
  maxWidth: number;
}

function checkPageBreak(ctx: PdfContext, needed: number) {
  const pageBottom = ctx.doc.internal.pageSize.getHeight() - 12;
  if (ctx.y + needed > pageBottom) {
    ctx.doc.addPage();
    ctx.y = 20;
  }
}

/** Estimate mm height for wrapped text lines */
function textHeight(doc: jsPDF, text: string, maxWidth: number, fontSize: number, lineSpacing = 5): number {
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(text, maxWidth);
  return lines.length * lineSpacing;
}

function formatDateRangePdf(startDate?: string, endDate?: string): string {
  if (!startDate && !endDate) return "";
  return [startDate, endDate].filter(Boolean).join(" — ");
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

// ─── Sidebar ───────────────────────────────────────────
function renderSidebar(doc: jsPDF, data: ResumeData, title: string) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const ctx: PdfContext = { doc, y: 20, margin: 70, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin - 15;
  const pi = data.personalInfo || {};

  // Sidebar background
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, 60, pageHeight, "F");

  // Name in sidebar
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255);
  const nameLines = doc.splitTextToSize(pi.fullName || title || "Resume", 50);
  doc.text(nameLines, 5, 20);
  let sy = 20 + nameLines.length * 6 + 6;

  // Contact in sidebar
  const contactItems = [
    pi.email, pi.phone, pi.location, pi.linkedin, pi.portfolio
  ].filter(Boolean);
  if (contactItems.length) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 210, 255);
    doc.text("CONTACT", 5, sy);
    sy += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(220);
    contactItems.forEach((item) => {
      const lines = doc.splitTextToSize(item!, 50);
      doc.text(lines, 5, sy);
      sy += lines.length * 4 + 2;
    });
    sy += 3;
  }

  // Skills in sidebar
  if ((data.skills || []).length > 0) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 210, 255);
    doc.text("SKILLS", 5, sy);
    sy += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(220);
    doc.setFontSize(7);
    (data.skills || []).forEach((skill) => {
      if (sy > pageHeight - 10) return;
      doc.text(`• ${skill}`, 5, sy);
      sy += 4;
    });
  }

  // Main content area
  doc.setTextColor(0);
  const addSection = (label: string) => {
    checkPageBreak(ctx, 12);
    ctx.y += 4;
    doc.setFillColor(30, 58, 95);
    doc.rect(ctx.margin, ctx.y - 2, ctx.maxWidth, 7, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255);
    doc.text(label.toUpperCase(), ctx.margin + 3, ctx.y + 3);
    doc.setTextColor(0);
    ctx.y += 9;
  };

  // Render body without skills (already in sidebar)
  const dataWithoutSkills = { ...data, skills: [] };
  renderBody(ctx, dataWithoutSkills, addSection);
}

// ─── Two Column ────────────────────────────────────────
function renderTwoColumn(doc: jsPDF, data: ResumeData, title: string) {
  const ctx: PdfContext = { doc, y: 20, margin: 15, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};
  const colWidth = (ctx.pageWidth - 35) / 2;

  // Header
  doc.setFillColor(45, 55, 72);
  doc.rect(0, 0, ctx.pageWidth, 28, "F");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255);
  doc.text(pi.fullName || title || "Resume", ctx.margin, 14);
  const parts: string[] = [];
  if (pi.email) parts.push(pi.email);
  if (pi.phone) parts.push(pi.phone);
  if (pi.location) parts.push(pi.location);
  if (parts.length) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200);
    doc.text(parts.join("  |  "), ctx.margin, 22);
  }
  doc.setTextColor(0);

  let leftY = 36;
  let rightY = 36;

  const sectionLabel = (x: number, y: number, label: string): number => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(45, 55, 72);
    doc.text(label.toUpperCase(), x, y);
    doc.setDrawColor(45, 55, 72);
    doc.line(x, y + 1, x + colWidth, y + 1);
    doc.setTextColor(0);
    return y + 6;
  };

  // Left column: Summary + Experience
  if (data.summary) {
    leftY = sectionLabel(ctx.margin, leftY, "Summary");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(data.summary, colWidth);
    doc.text(lines, ctx.margin, leftY);
    leftY += lines.length * 4 + 4;
  }
  if ((data.experience || []).length > 0) {
    leftY = sectionLabel(ctx.margin, leftY, "Experience");
    (data.experience || []).forEach((exp) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${exp.title} — ${exp.company}`, ctx.margin, leftY);
      const expDate = formatDateRangePdf(exp.startDate, exp.endDate);
      if (expDate) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(expDate, ctx.margin, leftY + 4);
        leftY += 4;
      }
      leftY += 4;
      doc.setFont("helvetica", "normal");
      if (exp.bullets?.length) {
        exp.bullets.forEach((b) => {
          const lines = doc.splitTextToSize(`• ${b}`, colWidth - 2);
          doc.text(lines, ctx.margin + 2, leftY);
          leftY += lines.length * 4;
        });
      }
      leftY += 3;
    });
  }

  // Right column: Skills + Education + Custom
  const rightX = ctx.margin + colWidth + 5;
  if ((data.skills || []).length > 0) {
    rightY = sectionLabel(rightX, rightY, "Skills");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    (data.skills || []).forEach((skill) => {
      doc.text(`• ${skill}`, rightX, rightY);
      rightY += 4;
    });
    rightY += 3;
  }
  if ((data.education || []).length > 0) {
    rightY = sectionLabel(rightX, rightY, "Education");
    (data.education || []).forEach((edu) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(edu.degree, rightX, rightY);
      rightY += 4;
      doc.setFont("helvetica", "normal");
      const eduDate = formatDateRangePdf(edu.startDate, edu.endDate) || (edu.year || "");
      doc.text(`${edu.school}${eduDate ? ` (${eduDate})` : ""}`, rightX, rightY);
      rightY += 5;
    });
  }
  if ((data.customSections || []).length > 0) {
    (data.customSections || []).filter(s => s.title).forEach((section) => {
      rightY = sectionLabel(rightX, rightY, section.title);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      section.items.filter(Boolean).forEach((item) => {
        const lines = doc.splitTextToSize(`• ${item}`, colWidth - 2);
        doc.text(lines, rightX, rightY);
        rightY += lines.length * 4;
      });
      rightY += 3;
    });
  }
  // Links
  const linkParts: string[] = [];
  if (pi.linkedin) linkParts.push(pi.linkedin);
  if (pi.portfolio) linkParts.push(pi.portfolio);
  if (linkParts.length) {
    rightY += 2;
    doc.setFontSize(8);
    doc.setTextColor(0, 102, 204);
    linkParts.forEach((l) => { doc.text(l, rightX, rightY); rightY += 4; });
    doc.setTextColor(0);
  }
}

// ─── Creative ──────────────────────────────────────────
function renderCreative(doc: jsPDF, data: ResumeData, title: string) {
  const ctx: PdfContext = { doc, y: 20, margin: 20, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};

  // Accent line
  doc.setFillColor(220, 53, 69);
  doc.rect(ctx.margin, 14, 40, 3, "F");

  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(220, 53, 69);
  doc.text((pi.fullName || title || "Resume").toUpperCase(), ctx.margin, 28);
  doc.setTextColor(0);
  ctx.y = 33;
  renderContactAndLinks(ctx, pi);

  const addSection = (label: string) => {
    checkPageBreak(ctx, 14);
    ctx.y += 6;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 53, 69);
    doc.text(label.toUpperCase(), ctx.margin, ctx.y);
    doc.setDrawColor(220, 53, 69);
    doc.line(ctx.margin, ctx.y + 2, ctx.margin + 30, ctx.y + 2);
    doc.setTextColor(0);
    ctx.y += 7;
  };

  renderBody(ctx, data, addSection);
}

// ─── Compact ───────────────────────────────────────────
function renderCompact(doc: jsPDF, data: ResumeData, title: string) {
  const ctx: PdfContext = { doc, y: 14, margin: 12, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};

  // Name centered
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(pi.fullName || title || "Resume", ctx.pageWidth / 2, ctx.y, { align: "center" });
  ctx.y += 5;

  // Contact centered
  const parts: string[] = [];
  if (pi.email) parts.push(pi.email);
  if (pi.phone) parts.push(pi.phone);
  if (pi.location) parts.push(pi.location);
  if (pi.linkedin) parts.push(pi.linkedin);
  if (pi.portfolio) parts.push(pi.portfolio);
  if (parts.length) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(parts.join("  •  "), ctx.pageWidth / 2, ctx.y, { align: "center" });
    ctx.y += 4;
  }
  doc.setDrawColor(0);
  doc.line(ctx.margin, ctx.y, ctx.pageWidth - ctx.margin, ctx.y);
  ctx.y += 3;

  const addSection = (label: string) => {
    checkPageBreak(ctx, 10);
    ctx.y += 2;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(label.toUpperCase(), ctx.margin, ctx.y);
    doc.setDrawColor(180);
    doc.line(ctx.margin, ctx.y + 1, ctx.pageWidth - ctx.margin, ctx.y + 1);
    ctx.y += 5;
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
    const h = lines.length * 5;
    checkPageBreak(ctx, h);
    doc.text(lines, ctx.margin, ctx.y);
    ctx.y += h;
  }

  if ((data.skills || []).length > 0) {
    addSection("Skills");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize((data.skills || []).join("  •  "), ctx.maxWidth);
    const h = lines.length * 5;
    checkPageBreak(ctx, h);
    doc.text(lines, ctx.margin, ctx.y);
    ctx.y += h;
  }

  if ((data.experience || []).length > 0) {
    addSection("Experience");
    (data.experience || []).forEach((exp) => {
      // Estimate total height for this entry: title + bullets/description
      doc.setFontSize(10);
      let entryHeight = 7; // title line + gap
      if (exp.bullets?.length) {
        exp.bullets.forEach((bullet) => {
          const bLines = doc.splitTextToSize(`•  ${bullet}`, ctx.maxWidth - 4);
          entryHeight += bLines.length * 5;
        });
      } else if (exp.description) {
        const dLines = doc.splitTextToSize(exp.description, ctx.maxWidth);
        entryHeight += dLines.length * 5;
      }
      // If the whole entry fits, keep it together; otherwise at least keep the title on the page
      checkPageBreak(ctx, Math.min(entryHeight, 25));

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${exp.title} — ${exp.company}`, ctx.margin, ctx.y);
      // Date range on the right
      const dateRange = formatDateRangePdf(exp.startDate, exp.endDate);
      if (dateRange) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const dateWidth = doc.getTextWidth(dateRange);
        doc.text(dateRange, ctx.pageWidth - ctx.margin - dateWidth, ctx.y);
      }
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
      ctx.y += 3;
    });
  }

  if ((data.education || []).length > 0) {
    addSection("Education");
    (data.education || []).forEach((edu) => {
      doc.setFontSize(10);
      const dateStr = formatDateRangePdf(edu.startDate, edu.endDate) || (edu.year || "");
      const line = `${edu.degree} — ${edu.school}`;
      const lines = doc.splitTextToSize(line, ctx.maxWidth - (dateStr ? 50 : 0));
      checkPageBreak(ctx, lines.length * 5 + 2);
      doc.setFont("helvetica", "bold");
      doc.text(lines, ctx.margin, ctx.y);
      if (dateStr) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const dateWidth = doc.getTextWidth(dateStr);
        doc.text(dateStr, ctx.pageWidth - ctx.margin - dateWidth, ctx.y);
      }
      ctx.y += lines.length * 5 + 2;
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

// ─── Main exports ──────────────────────────────────────
function buildDoc(data: ResumeData, title: string, templateId: TemplateId = "classic"): jsPDF {
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
    case "sidebar":
      renderSidebar(doc, data, title);
      break;
    case "twocolumn":
      renderTwoColumn(doc, data, title);
      break;
    case "creative":
      renderCreative(doc, data, title);
      break;
    case "compact":
      renderCompact(doc, data, title);
      break;
    default:
      renderClassic(doc, data, title);
  }
  return doc;
}

export function generateResumePDF(data: ResumeData, title: string, templateId: TemplateId = "classic") {
  const doc = buildDoc(data, title, templateId);
  const pi = data.personalInfo || {};
  const filename = `${(pi.fullName || title || "resume").replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
}

export function generateResumePDFDataUrls(data: ResumeData, title: string, templateId: TemplateId = "classic"): string[] {
  const doc = buildDoc(data, title, templateId);
  const pageCount = doc.getNumberOfPages();
  const urls: string[] = [];
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    urls.push(doc.output("datauristring"));
  }
  return urls;
}
