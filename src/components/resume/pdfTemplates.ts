import jsPDF from "jspdf";
import type { ResumeData } from "./types";

/** Load an image URL and return a base64 data URL for jsPDF */
async function loadImageAsBase64(url: string): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Draw a circular-clipped photo in the PDF */
function addCircularPhoto(doc: jsPDF, imgData: string, cx: number, cy: number, radius: number, bgColor?: { r: number; g: number; b: number }) {
  // Draw white circle background first
  if (bgColor) {
    doc.setFillColor(bgColor.r, bgColor.g, bgColor.b);
  } else {
    doc.setFillColor(255, 255, 255);
  }
  doc.circle(cx, cy, radius + 0.5, "F");
  // jsPDF doesn't support clip paths, so we add a square image and rely on the circle bg blending
  // We'll use addImage with the image cropped to a square region
  const imgSize = radius * 2;
  doc.addImage(imgData, "JPEG", cx - radius, cy - radius, imgSize, imgSize);
}

import { ATS_TEMPLATES, getATSConfig, isATSTemplateId, type ATSTemplateConfig, type ATSSection } from "./atsTemplateConfig";
import { ALL_DYNAMIC_TEMPLATES } from "../../data/templates/index";

export type TemplateId = string;

export interface ResumeTemplate {
  id: TemplateId;
  name: string;
  description: string;
  preview: string; // emoji/icon hint
  category?: string;
  isBestForATS?: boolean;
  recommendedFor?: string;
  isPremium?: boolean;
}

export const RESUME_TEMPLATES: ResumeTemplate[] = ALL_DYNAMIC_TEMPLATES.map(t => ({
  id: t.template_id,
  name: t.template_name,
  description: t.description,
  preview: "✨",
  category: t.category,
  isPremium: false,
}));

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
function renderSidebar(doc: jsPDF, data: ResumeData, title: string, photoData?: string | null) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const ctx: PdfContext = { doc, y: 20, margin: 70, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin - 15;
  const pi = data.personalInfo || {};

  // Draw sidebar background on current page
  const drawSidebarBg = () => {
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, 60, pageHeight, "F");
  };

  drawSidebarBg();

  let sy = 16;

  // Photo in sidebar
  if (photoData) {
    addCircularPhoto(doc, photoData, 30, sy + 10, 10, { r: 30, g: 58, b: 95 });
    sy += 24;
  }

  // Name in sidebar
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255);
  const nameLines = doc.splitTextToSize(pi.fullName || title || "Resume", 50);
  doc.text(nameLines, 5, sy);
  sy += nameLines.length * 6 + 6;

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

  // Main content area - override checkPageBreak to also draw sidebar bg on new pages
  const originalCheckPageBreak = (needed: number) => {
    const pageBottom = doc.internal.pageSize.getHeight() - 12;
    if (ctx.y + needed > pageBottom) {
      doc.addPage();
      drawSidebarBg();
      ctx.y = 20;
    }
  };

  doc.setTextColor(0);
  const addSection = (label: string) => {
    originalCheckPageBreak(12);
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
  // We need to monkey-patch the page break to draw sidebar bg
  const dataWithoutSkills = { ...data, skills: [] };
  renderBody(ctx, dataWithoutSkills, addSection);
  
  // Draw sidebar bg on any additional pages that renderBody may have created
  const totalPages = doc.getNumberOfPages();
  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);
    drawSidebarBg();
  }
  // Reset to last page
  doc.setPage(totalPages);
}

// ─── Two Column ────────────────────────────────────────
function renderTwoColumn(doc: jsPDF, data: ResumeData, title: string) {
  const ctx: PdfContext = { doc, y: 20, margin: 15, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};
  const colWidth = (ctx.pageWidth - 35) / 2;
  const pageBottom = doc.internal.pageSize.getHeight() - 12;

  const checkY = (y: number, needed: number): number => {
    if (y + needed > pageBottom) {
      doc.addPage();
      return 20;
    }
    return y;
  };

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
    y = checkY(y, 10);
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
    leftY = checkY(leftY, lines.length * 4);
    doc.text(lines, ctx.margin, leftY);
    leftY += lines.length * 4 + 4;
  }
  if ((data.experience || []).length > 0) {
    leftY = sectionLabel(ctx.margin, leftY, "Experience");
    (data.experience || []).forEach((exp) => {
      leftY = checkY(leftY, 12);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      const titleLines = doc.splitTextToSize(`${exp.title} — ${exp.company}`, colWidth);
      doc.text(titleLines, ctx.margin, leftY);
      leftY += titleLines.length * 4;
      const expDate = formatDateRangePdf(exp.startDate, exp.endDate);
      if (expDate) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(expDate, ctx.margin, leftY);
        leftY += 4;
      }
      doc.setFont("helvetica", "normal");
      if (exp.bullets?.length) {
        exp.bullets.forEach((b) => {
          const lines = doc.splitTextToSize(`• ${b}`, colWidth - 2);
          leftY = checkY(leftY, lines.length * 4);
          doc.text(lines, ctx.margin + 2, leftY);
          leftY += lines.length * 4;
        });
      }
      leftY += 3;
    });
  }

  // Right column: Skills + Education + Languages + Custom + Links
  const rightX = ctx.margin + colWidth + 5;
  if ((data.skills || []).length > 0) {
    rightY = sectionLabel(rightX, rightY, "Skills");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    (data.skills || []).forEach((skill) => {
      rightY = checkY(rightY, 4);
      doc.text(`• ${skill}`, rightX, rightY);
      rightY += 4;
    });
    rightY += 3;
  }
  if ((data.education || []).length > 0) {
    rightY = sectionLabel(rightX, rightY, "Education");
    (data.education || []).forEach((edu) => {
      rightY = checkY(rightY, 9);
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
  // Languages
  const langs = (data.languages || []).filter(l => l.name);
  if (langs.length > 0) {
    rightY = sectionLabel(rightX, rightY, "Languages");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    langs.forEach((l) => {
      rightY = checkY(rightY, 4);
      doc.text(`• ${l.name}${l.proficiency ? ` (${l.proficiency})` : ""}`, rightX, rightY);
      rightY += 4;
    });
    rightY += 3;
  }
  if ((data.customSections || []).length > 0) {
    (data.customSections || []).filter(s => s.title).forEach((section) => {
      rightY = sectionLabel(rightX, rightY, section.title);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      section.items.filter(Boolean).forEach((item) => {
        const lines = doc.splitTextToSize(`• ${item}`, colWidth - 2);
        rightY = checkY(rightY, lines.length * 4);
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
    linkParts.forEach((l) => {
      rightY = checkY(rightY, 4);
      doc.text(l, rightX, rightY);
      rightY += 4;
    });
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
    const h = lines.length * 6; // Increased from 5 for better readability
    checkPageBreak(ctx, h);
    doc.text(lines, ctx.margin, ctx.y);
    ctx.y += h + 4; // Extra padding
  }

  if ((data.skills || []).length > 0) {
    addSection("Skills");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize((data.skills || []).join("  •  "), ctx.maxWidth);
    const h = lines.length * 6;
    checkPageBreak(ctx, h);
    doc.text(lines, ctx.margin, ctx.y);
    ctx.y += h + 4;
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
          checkPageBreak(ctx, lines.length * 6);
          doc.text(lines, ctx.margin + 2, ctx.y);
          ctx.y += lines.length * 6;
        });
      } else if (exp.description) {
        const lines = doc.splitTextToSize(exp.description, ctx.maxWidth);
        checkPageBreak(ctx, lines.length * 6);
        doc.text(lines, ctx.margin, ctx.y);
        ctx.y += lines.length * 6;
      }
      ctx.y += 5; // Added extra padding between entries
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

  // Languages section
  if ((data.languages || []).length > 0) {
    const langs = (data.languages || []).filter(l => l.name);
    if (langs.length > 0) {
      addSection("Languages");
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const langText = langs.map(l => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ""}`).join("  •  ");
      const lines = doc.splitTextToSize(langText, ctx.maxWidth);
      checkPageBreak(ctx, lines.length * 5);
      doc.text(lines, ctx.margin, ctx.y);
      ctx.y += lines.length * 5;
    }
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


// ─── Config-driven ATS renderer ───────────────────────
function getRatingDotsText(proficiency: string): string {
  const clean = (proficiency || "").toLowerCase();
  let active = 3;
  if (clean.includes("5") || clean.includes("native") || clean.includes("fluent") || clean.includes("expert") || clean.includes("bilingual")) active = 5;
  else if (clean.includes("4") || clean.includes("proficient") || clean.includes("advanced") || clean.includes("full")) active = 4;
  else if (clean.includes("3") || clean.includes("conversational") || clean.includes("intermediate") || clean.includes("working")) active = 3;
  else if (clean.includes("2") || clean.includes("basic") || clean.includes("elementary") || clean.includes("limited")) active = 2;
  else if (clean.includes("1") || clean.includes("beginner") || clean.includes("novice")) active = 1;
  return "\u25cf".repeat(active) + "\u25cb".repeat(5 - active);
}

function renderATSFromConfig(doc: jsPDF, data: ResumeData, title: string, config: ATSTemplateConfig) {
  if (config.id === "ats-classic-serif") {
    renderClassicSerifPdf(doc, data, title, config);
    return;
  }
  if (config.id === "ats-modern-blue") {
    renderModernBluePdf(doc, data, title, config);
    return;
  }
  if (config.id === "ats-executive-dots") {
    renderExecutiveDotsPdf(doc, data, title, config);
    return;
  }
  if (config.id === "ats-two-column-icon") {
    renderTwoColumnIconPdf(doc, data, title, config);
    return;
  }
  if (config.id === "ats-olivia") {
    renderOliviaBennettPdf(doc, data, title, config);
    return;
  }

  // Fallback to standard config-driven ATS renderer
  const ctx: PdfContext = {
    doc, y: config.marginSize + 2,
    margin: config.marginSize,
    pageWidth: doc.internal.pageSize.getWidth(),
    maxWidth: 0,
  };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};
  const primaryRgb = config.primaryColor ? hexToRgb(config.primaryColor) : { r: 0, g: 0, b: 0 };

  // Name
  doc.setFontSize(config.nameFontSize);
  doc.setFont(config.fontFamily, "bold");
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text(pi.fullName || title || "Resume", ctx.margin, ctx.y);
  doc.setTextColor(0);
  ctx.y += config.nameFontSize * 0.35 + 2;

  // Contact line
  const contactParts: string[] = [];
  if (pi.email) contactParts.push(pi.email);
  if (pi.phone) contactParts.push(pi.phone);
  if (pi.location) contactParts.push(pi.location);
  if (contactParts.length) {
    doc.setFontSize(config.baseFontSize - 1);
    doc.setFont(config.fontFamily, "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(contactParts.join("  |  "), ctx.margin, ctx.y);
    doc.setTextColor(0);
    ctx.y += config.lineSpacing;
  }
  const linkParts: string[] = [];
  if (pi.linkedin) linkParts.push(pi.linkedin);
  if (pi.portfolio) linkParts.push(pi.portfolio);
  if (linkParts.length) {
    doc.setFontSize(config.baseFontSize - 1);
    doc.setFont(config.fontFamily, "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(linkParts.join("  |  "), ctx.margin, ctx.y);
    doc.setTextColor(0);
    ctx.y += config.lineSpacing;
  }

  // Divider under header
  doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.setLineWidth(0.5);
  doc.line(ctx.margin, ctx.y, ctx.pageWidth - ctx.margin, ctx.y);
  ctx.y += 4;

  const addSection = (label: string) => {
    checkPageBreak(ctx, config.headingFontSize + 4);
    ctx.y += 4;
    doc.setFontSize(config.headingFontSize);
    doc.setFont(config.fontFamily, "bold");
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text(label.toUpperCase(), ctx.margin, ctx.y);
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(0.4);
    doc.line(ctx.margin, ctx.y + 1.5, ctx.pageWidth - ctx.margin, ctx.y + 1.5);
    doc.setTextColor(0);
    ctx.y += config.headingFontSize * 0.4 + 3;
  };

  renderBodyOrdered(ctx, data, addSection, config);
}

function renderClassicSerifPdf(doc: jsPDF, data: ResumeData, title: string, config: ATSTemplateConfig) {
  const ctx: PdfContext = { doc, y: config.marginSize, margin: config.marginSize, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};
  const fs = config.baseFontSize;
  const ls = config.lineSpacing;

  // 1. Centered Header
  doc.setFont("times", "bold");
  doc.setFontSize(config.nameFontSize);
  const name = pi.fullName || title || "Resume";
  const nameWidth = doc.getTextWidth(name);
  doc.text(name, (ctx.pageWidth - nameWidth) / 2, ctx.y);
  ctx.y += config.nameFontSize * 0.35 + 2;

  // Title
  doc.setFont("times", "italic");
  doc.setFontSize(fs + 2);
  const pTitle = "Project Manager";
  doc.text(pTitle, (ctx.pageWidth - doc.getTextWidth(pTitle)) / 2, ctx.y);
  ctx.y += 6;

  // Contact info row centered
  const contacts: string[] = [];
  if (pi.location) contacts.push(pi.location);
  if (pi.email) contacts.push(pi.email);
  if (pi.phone) contacts.push(pi.phone);
  if (pi.linkedin) contacts.push(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''));
  
  if (contacts.length) {
    doc.setFont("times", "normal");
    doc.setFontSize(fs - 0.5);
    doc.setTextColor(60, 60, 60);
    const contactsStr = contacts.join("   •   ");
    const contactsWidth = doc.getTextWidth(contactsStr);
    doc.text(contactsStr, (ctx.pageWidth - contactsWidth) / 2, ctx.y);
    doc.setTextColor(0);
    ctx.y += ls + 2;
  }

  // Divider lines function
  const addSection = (label: string) => {
    checkPageBreak(ctx, config.headingFontSize + 6);
    ctx.y += 4;
    doc.setFont("times", "bold");
    doc.setFontSize(config.headingFontSize);
    doc.text(label.toUpperCase(), ctx.margin, ctx.y);
    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(0.4);
    doc.line(ctx.margin, ctx.y + 1.5, ctx.pageWidth - ctx.margin, ctx.y + 1.5);
    ctx.y += config.headingFontSize * 0.4 + 4;
  };

  // Render Body in order
  config.sectionOrder.forEach(sec => {
    if (sec === "summary" && data.summary) {
      addSection("Summary");
      doc.setFont("times", "normal");
      doc.setFontSize(fs);
      const lines = doc.splitTextToSize(data.summary, ctx.maxWidth);
      checkPageBreak(ctx, lines.length * ls);
      doc.text(lines, ctx.margin, ctx.y);
      ctx.y += lines.length * ls;
    } else if (sec === "experience" && (data.experience || []).length > 0) {
      addSection("Professional Experience");
      data.experience!.forEach(exp => {
        const dateRange = formatDateRangePdf(exp.startDate, exp.endDate);
        const expHeaderHeight = 9;
        checkPageBreak(ctx, expHeaderHeight + 6);

        // Job Title & Date
        doc.setFont("times", "bold");
        doc.setFontSize(fs);
        doc.text(exp.title, ctx.margin, ctx.y);
        if (dateRange) {
          doc.setFont("times", "normal");
          doc.setFontSize(fs - 1);
          doc.text(dateRange, ctx.pageWidth - ctx.margin - doc.getTextWidth(dateRange), ctx.y);
        }
        ctx.y += 4.5;

        // Company & Location
        doc.setFont("times", "italic");
        doc.setFontSize(fs);
        doc.text(exp.company, ctx.margin, ctx.y);
        if (exp.location) {
          doc.setFont("times", "normal");
          doc.setFontSize(fs - 1);
          doc.text(exp.location, ctx.pageWidth - ctx.margin - doc.getTextWidth(exp.location), ctx.y);
        }
        ctx.y += ls;

        // Bullets
        doc.setFont("times", "normal");
        if (exp.bullets?.length) {
          exp.bullets.forEach(b => {
            const bLines = doc.splitTextToSize(`•  ${b}`, ctx.maxWidth - 4);
            checkPageBreak(ctx, bLines.length * ls);
            doc.text(bLines, ctx.margin + 2, ctx.y);
            ctx.y += bLines.length * ls;
          });
        }
        ctx.y += 2.5;
      });
    } else if (sec === "education" && (data.education || []).length > 0) {
      addSection("Education");
      data.education!.forEach(edu => {
        const dateStr = formatDateRangePdf(edu.startDate, edu.endDate) || (edu.year || "");
        checkPageBreak(ctx, 12);

        // Degree & Date
        doc.setFont("times", "bold");
        doc.setFontSize(fs);
        doc.text(edu.degree, ctx.margin, ctx.y);
        if (dateStr) {
          doc.setFont("times", "normal");
          doc.setFontSize(fs - 1);
          doc.text(dateStr, ctx.pageWidth - ctx.margin - doc.getTextWidth(dateStr), ctx.y);
        }
        ctx.y += 4.5;

        // School
        doc.setFont("times", "italic");
        doc.setFontSize(fs);
        doc.text(edu.school, ctx.margin, ctx.y);
        ctx.y += ls + 1.5;
      });
    } else if (sec === "skills" && (data.skills || []).length > 0) {
      addSection("Skills");
      doc.setFont("times", "normal");
      doc.setFontSize(fs);
      
      const mid = Math.ceil(data.skills!.length / 2);
      const col1 = data.skills!.slice(0, mid);
      const col2 = data.skills!.slice(mid);
      const colWidth = ctx.maxWidth / 2;

      let tempY = ctx.y;
      col1.forEach(s => {
        checkPageBreak(ctx, ls);
        doc.text(`•  ${s}`, ctx.margin + 2, ctx.y);
        ctx.y += ls;
      });
      
      let rightY = tempY;
      col2.forEach(s => {
        doc.text(`•  ${s}`, ctx.margin + colWidth + 5, rightY);
        rightY += ls;
      });
      
      ctx.y = Math.max(ctx.y, rightY);
    } else if (sec === "languages" && (data.languages || []).length > 0) {
      addSection("Languages");
      doc.setFont("times", "normal");
      doc.setFontSize(fs);
      
      const mid = Math.ceil(data.languages!.length / 2);
      const col1 = data.languages!.slice(0, mid);
      const col2 = data.languages!.slice(mid);
      const colWidth = ctx.maxWidth / 2;

      let tempY = ctx.y;
      col1.forEach(l => {
        checkPageBreak(ctx, ls);
        doc.text(`•  ${l.name}${l.proficiency ? ` (${l.proficiency})` : ""}`, ctx.margin + 2, ctx.y);
        ctx.y += ls;
      });
      
      let rightY = tempY;
      col2.forEach(l => {
        doc.text(`•  ${l.name}${l.proficiency ? ` (${l.proficiency})` : ""}`, ctx.margin + colWidth + 5, rightY);
        rightY += ls;
      });
      
      ctx.y = Math.max(ctx.y, rightY);
    } else if (sec === "custom" && (data.customSections || []).length > 0) {
      data.customSections!.forEach(sec => {
        if (!sec.title || !sec.items?.length) return;
        addSection(sec.title);
        doc.setFont("times", "normal");
        doc.setFontSize(fs);

        const mid = Math.ceil(sec.items.length / 2);
        const col1 = sec.items.slice(0, mid);
        const col2 = sec.items.slice(mid);
        const colWidth = ctx.maxWidth / 2;

        let tempY = ctx.y;
        col1.forEach(item => {
          checkPageBreak(ctx, ls);
          doc.text(`•  ${item}`, ctx.margin + 2, ctx.y);
          ctx.y += ls;
        });
        
        let rightY = tempY;
        col2.forEach(item => {
          doc.text(`•  ${item}`, ctx.margin + colWidth + 5, rightY);
          rightY += ls;
        });
        
        ctx.y = Math.max(ctx.y, rightY);
      });
    }
  });
}

function renderModernBluePdf(doc: jsPDF, data: ResumeData, title: string, config: ATSTemplateConfig) {
  const ctx: PdfContext = { doc, y: config.marginSize, margin: config.marginSize, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};
  const fs = config.baseFontSize;
  const ls = config.lineSpacing;
  const primaryRgb = hexToRgb(config.primaryColor || "#2b5c8f");

  // Left-aligned header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(config.nameFontSize);
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text(pi.fullName || title || "Resume", ctx.margin, ctx.y);
  ctx.y += config.nameFontSize * 0.35 + 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(fs + 2);
  doc.text("Vice President of Sales", ctx.margin, ctx.y);
  ctx.y += 6;

  // Contact line
  const contactParts: string[] = [];
  if (pi.email) contactParts.push(pi.email);
  if (pi.phone) contactParts.push(pi.phone);
  if (pi.location) contactParts.push(pi.location);
  if (pi.linkedin) contactParts.push(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''));

  if (contactParts.length) {
    doc.setFontSize(fs - 1);
    doc.setTextColor(80, 80, 80);
    doc.text(contactParts.join("   •   "), ctx.margin, ctx.y);
    doc.setTextColor(0);
    ctx.y += ls + 2;
  }

  const addSection = (label: string) => {
    checkPageBreak(ctx, config.headingFontSize + 6);
    ctx.y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(config.headingFontSize);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text(label, ctx.margin, ctx.y);
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(0.4);
    doc.line(ctx.margin, ctx.y + 1.5, ctx.pageWidth - ctx.margin, ctx.y + 1.5);
    doc.setTextColor(0);
    ctx.y += config.headingFontSize * 0.4 + 4;
  };

  config.sectionOrder.forEach(sec => {
    if (sec === "summary" && data.summary) {
      addSection("Summary");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fs);
      const lines = doc.splitTextToSize(data.summary, ctx.maxWidth);
      checkPageBreak(ctx, lines.length * ls);
      doc.text(lines, ctx.margin, ctx.y);
      ctx.y += lines.length * ls;
    } else if (sec === "experience" && (data.experience || []).length > 0) {
      addSection("Professional Experience");
      data.experience!.forEach(exp => {
        checkPageBreak(ctx, 15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(fs);
        const titleStr = `${exp.title}, `;
        doc.text(titleStr, ctx.margin, ctx.y);
        
        const titleWidth = doc.getTextWidth(titleStr);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(fs);
        doc.text(exp.company, ctx.margin + titleWidth, ctx.y);
        
        const dateRange = formatDateRangePdf(exp.startDate, exp.endDate);
        if (dateRange) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(fs - 1);
          doc.text(dateRange, ctx.pageWidth - ctx.margin - doc.getTextWidth(dateRange), ctx.y);
        }
        ctx.y += 4.5;

        if (exp.location) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(fs - 1);
          doc.setTextColor(80, 80, 80);
          doc.text(exp.location, ctx.pageWidth - ctx.margin - doc.getTextWidth(exp.location), ctx.y);
          doc.setTextColor(0);
        }
        ctx.y += ls - 2;

        // Bullets
        doc.setFont("helvetica", "normal");
        if (exp.bullets?.length) {
          exp.bullets.forEach(b => {
            const bLines = doc.splitTextToSize(`•  ${b}`, ctx.maxWidth - 4);
            checkPageBreak(ctx, bLines.length * ls);
            doc.text(bLines, ctx.margin + 2, ctx.y);
            ctx.y += bLines.length * ls;
          });
        }
        ctx.y += 2.5;
      });
    } else if (sec === "education" && (data.education || []).length > 0) {
      addSection("Education");
      data.education!.forEach(edu => {
        checkPageBreak(ctx, 12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(fs);
        const degreeStr = `${edu.degree}, `;
        doc.text(degreeStr, ctx.margin, ctx.y);
        
        const degWidth = doc.getTextWidth(degreeStr);
        doc.setFont("helvetica", "italic");
        doc.text(edu.school, ctx.margin + degWidth, ctx.y);

        const dateStr = formatDateRangePdf(edu.startDate, edu.endDate) || (edu.year || "");
        if (dateStr) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(fs - 1);
          doc.text(dateStr, ctx.pageWidth - ctx.margin - doc.getTextWidth(dateStr), ctx.y);
        }
        ctx.y += ls + 1.5;
      });
    } else if (sec === "skills" && (data.skills || []).length > 0) {
      addSection("Skills");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fs);
      
      const mid = Math.ceil(data.skills!.length / 2);
      const col1 = data.skills!.slice(0, mid);
      const col2 = data.skills!.slice(mid);
      const colWidth = ctx.maxWidth / 2;

      let tempY = ctx.y;
      col1.forEach(s => {
        checkPageBreak(ctx, ls);
        doc.text(`•  ${s}`, ctx.margin + 2, ctx.y);
        ctx.y += ls;
      });
      
      let rightY = tempY;
      col2.forEach(s => {
        doc.text(`•  ${s}`, ctx.margin + colWidth + 5, rightY);
        rightY += ls;
      });
      
      ctx.y = Math.max(ctx.y, rightY);
    } else if (sec === "languages" && (data.languages || []).length > 0) {
      addSection("Languages");
      checkPageBreak(ctx, 10);
      let startX = ctx.margin + 4;
      data.languages!.forEach(l => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(fs);
        doc.text(l.name, startX, ctx.y);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fs - 1);
        doc.setTextColor(80, 80, 80);
        doc.text(l.proficiency, startX, ctx.y + 4.5);
        doc.setTextColor(0);
        
        startX += 45;
      });
      ctx.y += 10;
    }
  });
}

function renderExecutiveDotsPdf(doc: jsPDF, data: ResumeData, title: string, config: ATSTemplateConfig) {
  const ctx: PdfContext = { doc, y: config.marginSize, margin: config.marginSize, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};
  const fs = config.baseFontSize;
  const ls = config.lineSpacing;

  // 1. Centered Header
  doc.setFont("times", "bold");
  doc.setFontSize(config.nameFontSize);
  const name = pi.fullName || title || "Resume";
  const nameWidth = doc.getTextWidth(name);
  doc.text(name, (ctx.pageWidth - nameWidth) / 2, ctx.y);
  ctx.y += config.nameFontSize * 0.35 + 2;

  // Title
  doc.setFont("times", "italic");
  doc.setFontSize(fs + 2);
  const pTitle = "Product Manager";
  doc.text(pTitle, (ctx.pageWidth - doc.getTextWidth(pTitle)) / 2, ctx.y);
  ctx.y += 6;

  // Contacts
  const contacts: string[] = [];
  if (pi.location) contacts.push(pi.location);
  if (pi.email) contacts.push(pi.email);
  if (pi.phone) contacts.push(pi.phone);
  if (pi.linkedin) contacts.push(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''));
  
  if (contacts.length) {
    doc.setFont("times", "normal");
    doc.setFontSize(fs - 0.5);
    const contactsStr = contacts.join("   |   ");
    const contactsWidth = doc.getTextWidth(contactsStr);
    doc.text(contactsStr, (ctx.pageWidth - contactsWidth) / 2, ctx.y);
    ctx.y += ls + 2;
  }

  const addSection = (label: string) => {
    checkPageBreak(ctx, config.headingFontSize + 6);
    ctx.y += 4;
    doc.setFont("times", "bold");
    doc.setFontSize(config.headingFontSize);
    doc.text(label.toUpperCase(), ctx.margin, ctx.y);
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.4);
    doc.line(ctx.margin, ctx.y + 1.5, ctx.pageWidth - ctx.margin, ctx.y + 1.5);
    ctx.y += config.headingFontSize * 0.4 + 4;
  };

  config.sectionOrder.forEach(sec => {
    if (sec === "summary" && data.summary) {
      addSection("Summary");
      doc.setFont("times", "normal");
      doc.setFontSize(fs);
      const lines = doc.splitTextToSize(data.summary, ctx.maxWidth);
      checkPageBreak(ctx, lines.length * ls);
      doc.text(lines, ctx.margin, ctx.y);
      ctx.y += lines.length * ls;
    } else if (sec === "experience" && (data.experience || []).length > 0) {
      addSection("Professional Experience");
      data.experience!.forEach(exp => {
        checkPageBreak(ctx, 15);
        doc.setFont("times", "bold");
        doc.setFontSize(fs);
        doc.text(`${exp.title}`, ctx.margin, ctx.y);
        
        const dateRange = formatDateRangePdf(exp.startDate, exp.endDate);
        if (dateRange) {
          doc.setFont("times", "normal");
          doc.setFontSize(fs - 1);
          doc.text(dateRange, ctx.pageWidth - ctx.margin - doc.getTextWidth(dateRange), ctx.y);
        }
        ctx.y += 4.5;

        doc.setFont("times", "italic");
        doc.setFontSize(fs);
        doc.text(exp.company, ctx.margin, ctx.y);
        if (exp.location) {
          doc.setFont("times", "normal");
          doc.setFontSize(fs - 1);
          doc.text(exp.location, ctx.pageWidth - ctx.margin - doc.getTextWidth(exp.location), ctx.y);
        }
        ctx.y += ls;

        // Bullets
        doc.setFont("times", "normal");
        if (exp.bullets?.length) {
          exp.bullets.forEach(b => {
            const bLines = doc.splitTextToSize(`•  ${b}`, ctx.maxWidth - 4);
            checkPageBreak(ctx, bLines.length * ls);
            doc.text(bLines, ctx.margin + 2, ctx.y);
            ctx.y += bLines.length * ls;
          });
        }
        ctx.y += 2.5;
      });
    } else if (sec === "education" && (data.education || []).length > 0) {
      addSection("Education");
      data.education!.forEach(edu => {
        checkPageBreak(ctx, 12);
        doc.setFont("times", "bold");
        doc.setFontSize(fs);
        doc.text(edu.degree, ctx.margin, ctx.y);

        const dateStr = formatDateRangePdf(edu.startDate, edu.endDate) || (edu.year || "");
        if (dateStr) {
          doc.setFont("times", "normal");
          doc.setFontSize(fs - 1);
          doc.text(dateStr, ctx.pageWidth - ctx.margin - doc.getTextWidth(dateStr), ctx.y);
        }
        ctx.y += 4.5;

        doc.setFont("times", "italic");
        doc.text(edu.school, ctx.margin, ctx.y);
        ctx.y += ls + 1.5;
      });
    } else if (sec === "skills" && (data.skills || []).length > 0) {
      addSection("Skills");
      doc.setFont("times", "normal");
      doc.setFontSize(fs);
      
      const mid = Math.ceil(data.skills!.length / 2);
      const col1 = data.skills!.slice(0, mid);
      const col2 = data.skills!.slice(mid);
      const colWidth = ctx.maxWidth / 2;

      let tempY = ctx.y;
      col1.forEach(s => {
        checkPageBreak(ctx, ls);
        doc.text(`•  ${s}`, ctx.margin + 2, ctx.y);
        ctx.y += ls;
      });
      
      let rightY = tempY;
      col2.forEach(s => {
        doc.text(`•  ${s}`, ctx.margin + colWidth + 5, rightY);
        rightY += ls;
      });
      
      ctx.y = Math.max(ctx.y, rightY);
    } else if (sec === "languages" && (data.languages || []).length > 0) {
      addSection("Languages");
      doc.setFont("times", "normal");
      doc.setFontSize(fs);

      const mid = Math.ceil(data.languages!.length / 2);
      const col1 = data.languages!.slice(0, mid);
      const col2 = data.languages!.slice(mid);
      const colWidth = ctx.maxWidth / 2;

      let tempY = ctx.y;
      col1.forEach(l => {
        checkPageBreak(ctx, ls);
        const dots = getRatingDotsText(l.proficiency);
        doc.text(l.name, ctx.margin + 2, ctx.y);
        
        // Draw rating dots right aligned in the column
        doc.setFont("helvetica", "normal"); // helvetica has better circle bullet shapes
        doc.setFontSize(fs - 1);
        doc.text(dots, ctx.margin + colWidth - 25, ctx.y);
        doc.setFont("times", "normal");
        ctx.y += ls;
      });

      let rightY = tempY;
      col2.forEach(l => {
        const dots = getRatingDotsText(l.proficiency);
        doc.text(l.name, ctx.margin + colWidth + 5, rightY);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fs - 1);
        doc.text(dots, ctx.pageWidth - ctx.margin - 25, rightY);
        doc.setFont("times", "normal");
        rightY += ls;
      });

      ctx.y = Math.max(ctx.y, rightY);
    }
  });
}

function renderTwoColumnIconPdf(doc: jsPDF, data: ResumeData, title: string, config: ATSTemplateConfig) {
  const ctx: PdfContext = { doc, y: config.marginSize, margin: config.marginSize, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};
  const fs = config.baseFontSize;
  const ls = config.lineSpacing;

  const leftWidth = ctx.maxWidth * 0.38 - 8;
  const rightWidth = ctx.maxWidth * 0.62 - 12;
  const leftX = ctx.margin;
  const rightX = ctx.margin + ctx.maxWidth * 0.38 + 12;
  const colDividerX = ctx.margin + ctx.maxWidth * 0.38 + 2;

  // Start columns drawing
  let leftY = ctx.y;
  let rightY = ctx.y;

  // Name & Title on the left
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  const nameLines = doc.splitTextToSize(pi.fullName || title || "Resume", leftWidth);
  doc.text(nameLines, leftX, leftY);
  leftY += nameLines.length * 7 + 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text("Marketing Director", leftX, leftY);
  doc.setTextColor(0);
  leftY += 8;

  // Contact list stacked vertically on left
  doc.setFontSize(fs - 1);
  if (pi.location) {
    doc.text(pi.location, leftX, leftY);
    leftY += ls;
  }
  if (pi.phone) {
    doc.text(pi.phone, leftX, leftY);
    leftY += ls;
  }
  if (pi.email) {
    doc.text(pi.email, leftX, leftY);
    leftY += ls;
  }
  if (pi.linkedin) {
    doc.text(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''), leftX, leftY);
    leftY += ls;
  }
  leftY += 4;

  const addLeftSectionHdr = (label: string) => {
    leftY += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fs + 1.5);
    doc.text(label.toUpperCase(), leftX, leftY);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(leftX, leftY + 1.5, leftX + leftWidth, leftY + 1.5);
    leftY += 6;
  };

  // Left side sections
  // Summary
  if (data.summary) {
    addLeftSectionHdr("Summary");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fs - 1.5);
    const sumLines = doc.splitTextToSize(data.summary, leftWidth);
    doc.text(sumLines, leftX, leftY);
    leftY += sumLines.length * 4.2 + 2;
  }

  // Education
  if ((data.education || []).length > 0) {
    addLeftSectionHdr("Education");
    data.education!.forEach(edu => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(fs - 1.5);
      doc.text(edu.degree, leftX, leftY);
      leftY += 3.5;
      
      doc.setFont("helvetica", "normal");
      doc.text(edu.school, leftX, leftY);
      leftY += 3.5;
      
      const dateStr = formatDateRangePdf(edu.startDate, edu.endDate) || (edu.year || "");
      doc.setFontSize(fs - 2.5);
      doc.setTextColor(100, 100, 100);
      doc.text(`${dateStr} | Jouy-en-Josas, France`, leftX, leftY);
      doc.setTextColor(0);
      leftY += 6;
    });
  }

  // Languages
  if ((data.languages || []).length > 0) {
    addLeftSectionHdr("Languages");
    data.languages!.forEach(l => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(fs - 1.5);
      doc.text(l.name, leftX, leftY);
      
      // Dots
      const dots = getRatingDotsText(l.proficiency);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fs - 2.5);
      doc.text(dots, leftX + leftWidth - 25, leftY);
      leftY += 4.5;
    });
  }

  // Skills
  if ((data.skills || []).length > 0) {
    addLeftSectionHdr("Skills");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fs - 1.5);
    data.skills!.forEach(s => {
      doc.text(`•  ${s}`, leftX, leftY);
      leftY += 4.5;
    });
  }

  // ─── RIGHT COLUMN ───
  const addRightSectionHdr = (label: string) => {
    rightY += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fs + 2);
    doc.text(label.toUpperCase(), rightX, rightY);
    doc.setDrawColor(20, 20, 20);
    doc.setLineWidth(0.4);
    doc.line(rightX, rightY + 1.5, rightX + rightWidth, rightY + 1.5);
    rightY += 6;
  };

  // Right side sections
  // Experience
  if ((data.experience || []).length > 0) {
    addRightSectionHdr("Professional Experience");
    data.experience!.forEach(exp => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(fs);
      doc.text(exp.title, rightX, rightY);
      rightY += 4.5;

      doc.setFont("helvetica", "medium");
      doc.text(exp.company, rightX, rightY);
      rightY += 4;

      const dateRange = formatDateRangePdf(exp.startDate, exp.endDate);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fs - 1.5);
      doc.setTextColor(100, 100, 100);
      doc.text(`${dateRange} | ${exp.location || "Paris, France"}`, rightX, rightY);
      doc.setTextColor(0);
      rightY += 4.5;

      // Bullets
      if (exp.bullets?.length) {
        exp.bullets.forEach(b => {
          const bLines = doc.splitTextToSize(b, rightWidth - 4);
          doc.text("•", rightX, rightY);
          doc.text(bLines, rightX + 3, rightY);
          rightY += bLines.length * (ls - 0.5);
        });
      }
      rightY += 3;
    });
  }

  // Custom sections / Projects / Certificates
  const custom = (data.customSections || []).filter(c => c.title && c.items?.length);
  if (custom.length > 0) {
    custom.forEach(sec => {
      const isCert = sec.title.toLowerCase().includes("cert");
      addRightSectionHdr(sec.title);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fs);
      
      if (isCert) {
        sec.items.forEach(item => {
          doc.text(`•  ${item}`, rightX, rightY);
          rightY += ls;
        });
      } else {
        // Projects style
        sec.items.forEach(item => {
          const idx = item.indexOf(":");
          if (idx > 0) {
            const pName = item.substring(0, idx);
            const pDesc = item.substring(idx + 1);
            
            doc.setFont("helvetica", "bold");
            doc.text(pName, rightX, rightY);
            rightY += 4;
            
            doc.setFont("helvetica", "normal");
            const pLines = doc.splitTextToSize(pDesc, rightWidth);
            doc.text(pLines, rightX, rightY);
            rightY += pLines.length * (ls - 0.5) + 3;
          } else {
            const pLines = doc.splitTextToSize(item, rightWidth);
            doc.text(pLines, rightX, rightY);
            rightY += pLines.length * ls + 2;
          }
        });
      }
    });
  }

  // Draw vertical separator line between columns
  const maxY = Math.max(leftY, rightY);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(colDividerX, ctx.y, colDividerX, maxY);
}

function renderBodyOrdered(ctx: PdfContext, data: ResumeData, addSection: (t: string) => void, config: ATSTemplateConfig) {
  const { doc } = ctx;
  const ls = config.lineSpacing;
  const fs = config.baseFontSize;

  const renderSummary = () => {
    if (!data.summary) return;
    addSection("Summary");
    doc.setFont(config.fontFamily, "normal");
    doc.setFontSize(fs);
    const lines = doc.splitTextToSize(data.summary, ctx.maxWidth);
    checkPageBreak(ctx, lines.length * ls);
    doc.text(lines, ctx.margin, ctx.y);
    ctx.y += lines.length * ls;
  };

  const renderSkills = () => {
    if (!(data.skills || []).length) return;
    addSection("Skills");
    doc.setFont(config.fontFamily, "normal");
    doc.setFontSize(fs);
    const lines = doc.splitTextToSize((data.skills || []).join("  •  "), ctx.maxWidth);
    checkPageBreak(ctx, lines.length * ls);
    doc.text(lines, ctx.margin, ctx.y);
    ctx.y += lines.length * ls;
  };

  const renderExperience = () => {
    if (!(data.experience || []).length) return;
    addSection("Experience");
    (data.experience || []).forEach((exp) => {
      doc.setFontSize(fs);
      let entryHeight = 7;
      if (exp.bullets?.length) {
        exp.bullets.forEach((bullet) => {
          const bLines = doc.splitTextToSize(`•  ${bullet}`, ctx.maxWidth - 4);
          entryHeight += bLines.length * ls;
        });
      } else if (exp.description) {
        const dLines = doc.splitTextToSize(exp.description, ctx.maxWidth);
        entryHeight += dLines.length * ls;
      }
      checkPageBreak(ctx, Math.min(entryHeight, 25));

      doc.setFontSize(fs);
      doc.setFont(config.fontFamily, "bold");
      doc.text(`${exp.title} — ${exp.company}`, ctx.margin, ctx.y);
      const dateRange = formatDateRangePdf(exp.startDate, exp.endDate);
      if (dateRange) {
        doc.setFontSize(fs - 1);
        doc.setFont(config.fontFamily, "normal");
        const dateWidth = doc.getTextWidth(dateRange);
        doc.text(dateRange, ctx.pageWidth - ctx.margin - dateWidth, ctx.y);
      }
      ctx.y += ls;
      doc.setFont(config.fontFamily, "normal");
      if (exp.bullets?.length) {
        exp.bullets.forEach((bullet) => {
          const lines = doc.splitTextToSize(`•  ${bullet}`, ctx.maxWidth - 4);
          checkPageBreak(ctx, lines.length * ls);
          doc.text(lines, ctx.margin + 2, ctx.y);
          ctx.y += lines.length * ls;
        });
      } else if (exp.description) {
        const lines = doc.splitTextToSize(exp.description, ctx.maxWidth);
        checkPageBreak(ctx, lines.length * ls);
        doc.text(lines, ctx.margin, ctx.y);
        ctx.y += lines.length * ls;
      }
      ctx.y += 3;
    });
  };

  const renderEducation = () => {
    if (!(data.education || []).length) return;
    addSection("Education");
    (data.education || []).forEach((edu) => {
      doc.setFontSize(fs);
      const dateStr = formatDateRangePdf(edu.startDate, edu.endDate) || (edu.year || "");
      const line = `${edu.degree} — ${edu.school}`;
      const lines = doc.splitTextToSize(line, ctx.maxWidth - (dateStr ? 50 : 0));
      checkPageBreak(ctx, lines.length * ls + 2);
      doc.setFont(config.fontFamily, "bold");
      doc.text(lines, ctx.margin, ctx.y);
      if (dateStr) {
        doc.setFontSize(fs - 1);
        doc.setFont(config.fontFamily, "normal");
        const dateWidth = doc.getTextWidth(dateStr);
        doc.text(dateStr, ctx.pageWidth - ctx.margin - dateWidth, ctx.y);
      }
      ctx.y += lines.length * ls + 2;
    });
  };

  const renderLanguages = () => {
    const langs = (data.languages || []).filter(l => l.name);
    if (!langs.length) return;
    addSection("Languages");
    doc.setFont(config.fontFamily, "normal");
    doc.setFontSize(fs);
    const langText = langs.map(l => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ""}`).join("  •  ");
    const lines = doc.splitTextToSize(langText, ctx.maxWidth);
    checkPageBreak(ctx, lines.length * ls);
    doc.text(lines, ctx.margin, ctx.y);
    ctx.y += lines.length * ls;
  };

  const renderCustom = () => {
    (data.customSections || []).filter((s) => s.title).forEach((section) => {
      addSection(section.title);
      doc.setFont(config.fontFamily, "normal");
      doc.setFontSize(fs);
      section.items.filter(Boolean).forEach((item) => {
        const lines = doc.splitTextToSize(`•  ${item}`, ctx.maxWidth - 4);
        checkPageBreak(ctx, lines.length * ls);
        doc.text(lines, ctx.margin + 2, ctx.y);
        ctx.y += lines.length * ls;
      });
    });
  };

  const sectionMap: Record<ATSSection, () => void> = {
    summary: renderSummary,
    skills: renderSkills,
    experience: renderExperience,
    education: renderEducation,
    languages: renderLanguages,
    custom: renderCustom,
  };

  for (const sectionId of config.sectionOrder) {
    if (config.sectionVisibility[sectionId]) {
      sectionMap[sectionId]();
    }
  }
}

// ─── Professional ──────────────────────────────────────
function renderProfessional(doc: jsPDF, data: ResumeData, title: string) {
  const ctx: PdfContext = { doc, y: 20, margin: 20, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};

  // Navy top bar
  doc.setFillColor(25, 42, 86);
  doc.rect(0, 0, ctx.pageWidth, 6, "F");
  ctx.y = 20;

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(25, 42, 86);
  doc.text(pi.fullName || title || "Resume", ctx.margin, ctx.y);
  doc.setTextColor(0);
  ctx.y += 7;
  renderContactAndLinks(ctx, pi);

  // Thin navy line under contact
  doc.setDrawColor(25, 42, 86);
  doc.setLineWidth(0.5);
  doc.line(ctx.margin, ctx.y, ctx.pageWidth - ctx.margin, ctx.y);
  doc.setLineWidth(0.2);
  ctx.y += 4;

  const addSection = (label: string) => {
    checkPageBreak(ctx, 14);
    ctx.y += 5;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(25, 42, 86);
    doc.text(label.toUpperCase(), ctx.margin, ctx.y);
    doc.setDrawColor(25, 42, 86);
    doc.line(ctx.margin, ctx.y + 2, ctx.pageWidth - ctx.margin, ctx.y + 2);
    doc.setTextColor(0);
    ctx.y += 8;
  };

  renderBody(ctx, data, addSection);
}

// ─── ATS Optimized ─────────────────────────────────────
function renderATS(doc: jsPDF, data: ResumeData, title: string) {
  const ctx: PdfContext = { doc, y: 18, margin: 18, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(pi.fullName || title || "Resume", ctx.margin, ctx.y);
  ctx.y += 6;

  // Contact on one line, plain
  const parts: string[] = [];
  if (pi.email) parts.push(pi.email);
  if (pi.phone) parts.push(pi.phone);
  if (pi.location) parts.push(pi.location);
  if (pi.linkedin) parts.push(pi.linkedin);
  if (pi.portfolio) parts.push(pi.portfolio);
  if (parts.length) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(parts.join(" | "), ctx.margin, ctx.y);
    ctx.y += 5;
  }
  doc.setDrawColor(0);
  doc.line(ctx.margin, ctx.y, ctx.pageWidth - ctx.margin, ctx.y);
  ctx.y += 5;

  const addSection = (label: string) => {
    checkPageBreak(ctx, 12);
    ctx.y += 4;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(label.toUpperCase(), ctx.margin, ctx.y);
    doc.setDrawColor(0);
    doc.line(ctx.margin, ctx.y + 1.5, ctx.pageWidth - ctx.margin, ctx.y + 1.5);
    ctx.y += 7;
  };

  renderBody(ctx, data, addSection);
}

// ─── Simple ────────────────────────────────────────────
function renderSimple(doc: jsPDF, data: ResumeData, title: string) {
  const ctx: PdfContext = { doc, y: 22, margin: 22, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(pi.fullName || title || "Resume", ctx.pageWidth / 2, ctx.y, { align: "center" });
  ctx.y += 6;

  const parts: string[] = [];
  if (pi.email) parts.push(pi.email);
  if (pi.phone) parts.push(pi.phone);
  if (pi.location) parts.push(pi.location);
  if (parts.length) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(parts.join("  •  "), ctx.pageWidth / 2, ctx.y, { align: "center" });
    ctx.y += 4;
  }
  const linkParts: string[] = [];
  if (pi.linkedin) linkParts.push(pi.linkedin);
  if (pi.portfolio) linkParts.push(pi.portfolio);
  if (linkParts.length) {
    doc.setFontSize(9);
    doc.setTextColor(0, 102, 204);
    doc.text(linkParts.join("  •  "), ctx.pageWidth / 2, ctx.y, { align: "center" });
    doc.setTextColor(0);
    ctx.y += 5;
  }
  ctx.y += 2;

  const addSection = (label: string) => {
    checkPageBreak(ctx, 12);
    ctx.y += 5;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(label, ctx.margin, ctx.y);
    doc.setDrawColor(200);
    doc.line(ctx.margin, ctx.y + 2, ctx.pageWidth - ctx.margin, ctx.y + 2);
    doc.setTextColor(0);
    ctx.y += 7;
  };

  renderBody(ctx, data, addSection);
}

// ─── Elegant ───────────────────────────────────────────
function renderElegant(doc: jsPDF, data: ResumeData, title: string) {
  const ctx: PdfContext = { doc, y: 20, margin: 20, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};

  // Gold accent line
  doc.setFillColor(180, 145, 70);
  doc.rect(ctx.margin, 14, ctx.maxWidth, 1, "F");
  ctx.y = 22;

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text(pi.fullName || title || "Resume", ctx.pageWidth / 2, ctx.y, { align: "center" });
  ctx.y += 6;

  const parts: string[] = [];
  if (pi.email) parts.push(pi.email);
  if (pi.phone) parts.push(pi.phone);
  if (pi.location) parts.push(pi.location);
  if (parts.length) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(parts.join("  |  "), ctx.pageWidth / 2, ctx.y, { align: "center" });
    ctx.y += 4;
  }
  const linkParts: string[] = [];
  if (pi.linkedin) linkParts.push(pi.linkedin);
  if (pi.portfolio) linkParts.push(pi.portfolio);
  if (linkParts.length) {
    doc.setFontSize(9);
    doc.setTextColor(180, 145, 70);
    doc.text(linkParts.join("  |  "), ctx.pageWidth / 2, ctx.y, { align: "center" });
    ctx.y += 4;
  }

  doc.setFillColor(180, 145, 70);
  doc.rect(ctx.margin, ctx.y, ctx.maxWidth, 0.5, "F");
  ctx.y += 5;
  doc.setTextColor(0);

  const addSection = (label: string) => {
    checkPageBreak(ctx, 14);
    ctx.y += 5;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 145, 70);
    doc.text(label.toUpperCase(), ctx.margin, ctx.y);
    doc.setDrawColor(180, 145, 70);
    doc.line(ctx.margin, ctx.y + 2, ctx.pageWidth - ctx.margin, ctx.y + 2);
    doc.setTextColor(60, 60, 60);
    ctx.y += 8;
  };

  renderBody(ctx, data, addSection);
}

// ─── Ivy League ────────────────────────────────────────
function renderIvyLeague(doc: jsPDF, data: ResumeData, title: string) {
  const ctx: PdfContext = { doc, y: 22, margin: 22, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};

  // Name centered, classic style
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(pi.fullName || title || "Resume", ctx.pageWidth / 2, ctx.y, { align: "center" });
  ctx.y += 7;

  // Contact centered
  const parts: string[] = [];
  if (pi.email) parts.push(pi.email);
  if (pi.phone) parts.push(pi.phone);
  if (pi.location) parts.push(pi.location);
  if (pi.linkedin) parts.push(pi.linkedin);
  if (pi.portfolio) parts.push(pi.portfolio);
  if (parts.length) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(parts.join("  |  "), ctx.pageWidth / 2, ctx.y, { align: "center" });
    doc.setTextColor(0);
    ctx.y += 5;
  }

  // Double line separator
  doc.setDrawColor(80);
  doc.setLineWidth(0.6);
  doc.line(ctx.margin, ctx.y, ctx.pageWidth - ctx.margin, ctx.y);
  doc.setLineWidth(0.2);
  doc.line(ctx.margin, ctx.y + 1.5, ctx.pageWidth - ctx.margin, ctx.y + 1.5);
  ctx.y += 6;

  const addSection = (label: string) => {
    checkPageBreak(ctx, 14);
    ctx.y += 5;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80);
    doc.text(label.toUpperCase(), ctx.margin, ctx.y);
    doc.setDrawColor(80);
    doc.setLineWidth(0.3);
    doc.line(ctx.margin, ctx.y + 2, ctx.pageWidth - ctx.margin, ctx.y + 2);
    doc.setLineWidth(0.2);
    doc.setTextColor(0);
    ctx.y += 7;
  };

  renderBody(ctx, data, addSection);
}

// ─── Timeline ──────────────────────────────────────────
function renderTimeline(doc: jsPDF, data: ResumeData, title: string) {
  const ctx: PdfContext = { doc, y: 20, margin: 20, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};
  const accent = { r: 41, g: 98, b: 255 };

  // Blue accent bar
  doc.setFillColor(accent.r, accent.g, accent.b);
  doc.rect(0, 0, ctx.pageWidth, 5, "F");
  ctx.y = 18;

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text(pi.fullName || title || "Resume", ctx.margin, ctx.y);
  doc.setTextColor(0);
  ctx.y += 7;
  renderContactAndLinks(ctx, pi);

  // Summary
  if (data.summary) {
    ctx.y += 4;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(data.summary, ctx.maxWidth);
    checkPageBreak(ctx, lines.length * 5);
    doc.text(lines, ctx.margin, ctx.y);
    ctx.y += lines.length * 5 + 2;
  }

  // Skills
  if ((data.skills || []).length > 0) {
    ctx.y += 3;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text("SKILLS", ctx.margin, ctx.y);
    doc.setTextColor(0);
    ctx.y += 5;
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize((data.skills || []).join("  •  "), ctx.maxWidth);
    checkPageBreak(ctx, lines.length * 5);
    doc.text(lines, ctx.margin, ctx.y);
    ctx.y += lines.length * 5 + 2;
  }

  // Experience with timeline
  if ((data.experience || []).length > 0) {
    ctx.y += 4;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text("EXPERIENCE", ctx.margin, ctx.y);
    doc.setTextColor(0);
    ctx.y += 6;

    const timelineX = ctx.margin + 4;
    const contentX = ctx.margin + 12;
    const contentWidth = ctx.maxWidth - 12;

    (data.experience || []).forEach((exp, idx) => {
      checkPageBreak(ctx, 15);
      // Timeline dot
      doc.setFillColor(accent.r, accent.g, accent.b);
      doc.circle(timelineX, ctx.y - 1, 1.5, "F");
      // Timeline line (except last)
      if (idx < (data.experience || []).length - 1) {
        doc.setDrawColor(accent.r, accent.g, accent.b);
        doc.setLineWidth(0.4);
        doc.line(timelineX, ctx.y + 1, timelineX, ctx.y + 18);
        doc.setLineWidth(0.2);
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${exp.title} — ${exp.company}`, contentX, ctx.y);
      const dateRange = formatDateRangePdf(exp.startDate, exp.endDate);
      if (dateRange) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text(dateRange, contentX, ctx.y + 4);
        doc.setTextColor(0);
        ctx.y += 4;
      }
      ctx.y += 5;
      doc.setFont("helvetica", "normal");
      if (exp.bullets?.length) {
        exp.bullets.forEach((b) => {
          const lines = doc.splitTextToSize(`• ${b}`, contentWidth - 4);
          checkPageBreak(ctx, lines.length * 5);
          doc.text(lines, contentX + 2, ctx.y);
          ctx.y += lines.length * 5;
        });
      }
      ctx.y += 4;
    });
  }

  // Education, languages, custom via standard body minus summary/skills/experience
  const restData = { ...data, summary: undefined, skills: [], experience: [] };
  const addSection = (label: string) => {
    checkPageBreak(ctx, 12);
    ctx.y += 4;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text(label.toUpperCase(), ctx.margin, ctx.y);
    doc.setTextColor(0);
    ctx.y += 6;
  };
  renderBody(ctx, restData, addSection);
}

// ─── Contemporary ──────────────────────────────────────
async function renderContemporary(doc: jsPDF, data: ResumeData, title: string) {
  const ctx: PdfContext = { doc, y: 20, margin: 20, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};
  const accent = { r: 16, g: 163, b: 127 }; // teal-green

  // Header with accent background
  doc.setFillColor(accent.r, accent.g, accent.b);
  doc.rect(0, 0, ctx.pageWidth, 36, "F");

  // Photo circle (right side of header)
  const photoData = pi.photoUrl ? await loadImageAsBase64(pi.photoUrl) : null;
  if (photoData) {
    addCircularPhoto(doc, photoData, ctx.pageWidth - 35, 18, 12, { r: accent.r, g: accent.g, b: accent.b });
  } else {
    doc.setFillColor(255, 255, 255);
    doc.circle(ctx.pageWidth - 35, 18, 12, "F");
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Photo", ctx.pageWidth - 35, 20, { align: "center" });
  }

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255);
  doc.text(pi.fullName || title || "Resume", ctx.margin, 16);

  // Subtitle / title line
  const parts: string[] = [];
  if (pi.email) parts.push(pi.email);
  if (pi.phone) parts.push(pi.phone);
  if (pi.location) parts.push(pi.location);
  if (parts.length) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(220, 255, 240);
    doc.text(parts.join("  •  "), ctx.margin, 24);
  }
  const linkParts: string[] = [];
  if (pi.linkedin) linkParts.push(pi.linkedin);
  if (pi.portfolio) linkParts.push(pi.portfolio);
  if (linkParts.length) {
    doc.setFontSize(8);
    doc.setTextColor(220, 255, 240);
    doc.text(linkParts.join("  •  "), ctx.margin, 30);
  }

  doc.setTextColor(0);
  ctx.y = 44;

  const addSection = (label: string) => {
    checkPageBreak(ctx, 14);
    ctx.y += 5;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text(label.toUpperCase(), ctx.margin, ctx.y);
    doc.setDrawColor(accent.r, accent.g, accent.b);
    doc.setLineWidth(0.5);
    doc.line(ctx.margin, ctx.y + 2, ctx.pageWidth - ctx.margin, ctx.y + 2);
    doc.setLineWidth(0.2);
    doc.setTextColor(0);
    ctx.y += 8;
  };

  renderBody(ctx, data, addSection);
}

// ─── Polished ──────────────────────────────────────────
function renderPolished(doc: jsPDF, data: ResumeData, title: string, photoData?: string | null) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const ctx: PdfContext = { doc, y: 20, margin: 70, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin - 15;
  const pi = data.personalInfo || {};
  const accent = { r: 166, g: 72, b: 52 }; // warm rust

  const drawSidebarBg = () => {
    doc.setFillColor(accent.r, accent.g, accent.b);
    doc.rect(0, 0, 60, pageHeight, "F");
  };

  drawSidebarBg();

  let sy = 16;

  // Photo in sidebar
  if (photoData) {
    addCircularPhoto(doc, photoData, 30, sy + 10, 10, { r: accent.r, g: accent.g, b: accent.b });
    sy += 24;
  }

  // Name in sidebar
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255);
  const nameLines = doc.splitTextToSize(pi.fullName || title || "Resume", 50);
  doc.text(nameLines, 5, sy);
  sy = sy + nameLines.length * 6 + 6;

  // Contact in sidebar
  const contactItems = [pi.email, pi.phone, pi.location, pi.linkedin, pi.portfolio].filter(Boolean);
  if (contactItems.length) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 210, 190);
    doc.text("CONTACT", 5, sy);
    sy += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(240);
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
    doc.setTextColor(255, 210, 190);
    doc.text("SKILLS", 5, sy);
    sy += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(240);
    doc.setFontSize(7);
    (data.skills || []).forEach((skill) => {
      if (sy > pageHeight - 10) return;
      doc.text(`• ${skill}`, 5, sy);
      sy += 4;
    });
  }

  // Languages in sidebar
  const langs = (data.languages || []).filter(l => l.name);
  if (langs.length > 0) {
    sy += 4;
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 210, 190);
    doc.text("LANGUAGES", 5, sy);
    sy += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(240);
    langs.forEach((l) => {
      if (sy > pageHeight - 10) return;
      doc.text(`• ${l.name}${l.proficiency ? ` (${l.proficiency})` : ""}`, 5, sy);
      sy += 4;
    });
  }

  const originalCheckPageBreak = (needed: number) => {
    const pageBottom = doc.internal.pageSize.getHeight() - 12;
    if (ctx.y + needed > pageBottom) {
      doc.addPage();
      drawSidebarBg();
      ctx.y = 20;
    }
  };

  doc.setTextColor(0);
  const addSection = (label: string) => {
    originalCheckPageBreak(12);
    ctx.y += 4;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text(label.toUpperCase(), ctx.margin, ctx.y);
    doc.setDrawColor(accent.r, accent.g, accent.b);
    doc.line(ctx.margin, ctx.y + 2, ctx.pageWidth - 15, ctx.y + 2);
    doc.setTextColor(0);
    ctx.y += 8;
  };

  const dataWithoutSkills = { ...data, skills: [], languages: [] };
  renderBody(ctx, dataWithoutSkills, addSection);

  const totalPages = doc.getNumberOfPages();
  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);
    drawSidebarBg();
  }
  doc.setPage(totalPages);
}

// ─── Waterfall (Premium) ───────────────────────────────
function renderWaterfall(doc: jsPDF, data: ResumeData, title: string, photoData?: string | null) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const ctx: PdfContext = { doc, y: 20, margin: 70, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin - 15;
  const pi = data.personalInfo || {};

  const drawSidebarBg = () => {
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 60, pageHeight, "F");
  };
  drawSidebarBg();

  let sy = 16;
  if (photoData) {
    addCircularPhoto(doc, photoData, 30, sy + 10, 10, { r: 44, g: 62, b: 80 });
    sy += 24;
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255);
  const nameLines = doc.splitTextToSize(pi.fullName || title || "Resume", 50);
  doc.text(nameLines, 5, sy);
  sy += nameLines.length * 6 + 6;

  const contactItems = [pi.email, pi.phone, pi.location, pi.linkedin, pi.portfolio].filter(Boolean);
  if (contactItems.length) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(189, 195, 199);
    doc.text("CONTACT", 5, sy);
    sy += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(236, 240, 241);
    contactItems.forEach((item) => {
      const lines = doc.splitTextToSize(item!, 50);
      doc.text(lines, 5, sy);
      sy += lines.length * 4 + 2;
    });
    sy += 3;
  }

  if ((data.skills || []).length > 0) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(189, 195, 199);
    doc.text("SKILLS", 5, sy);
    sy += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(236, 240, 241);
    (data.skills || []).forEach((skill) => {
      if (sy > pageHeight - 10) return;
      doc.setFillColor(52, 152, 219);
      doc.rect(5, sy - 2.5, 2.5, 2.5, "F");
      doc.text(skill, 10, sy);
      sy += 4.5;
    });
  }

  const originalCheckPageBreak = (needed: number) => {
    const pageBottom = doc.internal.pageSize.getHeight() - 12;
    if (ctx.y + needed > pageBottom) {
      doc.addPage();
      drawSidebarBg();
      ctx.y = 20;
    }
  };

  doc.setTextColor(0);
  const addSection = (label: string) => {
    originalCheckPageBreak(12);
    ctx.y += 4;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 62, 80);
    doc.text(label.toUpperCase(), ctx.margin, ctx.y);
    doc.setDrawColor(44, 62, 80);
    doc.setLineWidth(0.5);
    doc.line(ctx.margin, ctx.y + 2, ctx.margin + 15, ctx.y + 2);
    doc.setLineWidth(0.2);
    doc.setTextColor(0);
    ctx.y += 8;
  };

  const dataWithoutSkills = { ...data, skills: [] };
  renderBody(ctx, dataWithoutSkills, addSection);
  
  const totalPages = doc.getNumberOfPages();
  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);
    drawSidebarBg();
  }
  doc.setPage(totalPages);
}

// ─── Vision (Premium) ──────────────────────────────────
function renderVision(doc: jsPDF, data: ResumeData, title: string) {
  const ctx: PdfContext = { doc, y: 20, margin: 15, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  const rightColWidth = 65;
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2 - rightColWidth - 10;
  const pi = data.personalInfo || {};

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(pi.fullName || title || "Resume", ctx.margin, ctx.y);
  ctx.y += 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  if (data.summary) {
    const lines = doc.splitTextToSize(data.summary, ctx.maxWidth + rightColWidth + 10);
    doc.text(lines, ctx.margin, ctx.y);
    ctx.y += lines.length * 5 + 4;
  }
  doc.setDrawColor(200);
  doc.line(ctx.margin, ctx.y, ctx.pageWidth - ctx.margin, ctx.y);
  ctx.y += 6;

  let leftY = ctx.y;
  let rightY = ctx.y;
  const pageBottom = doc.internal.pageSize.getHeight() - 12;
  const checkY = (y: number, needed: number): number => {
    if (y + needed > pageBottom) { doc.addPage(); return 20; }
    return y;
  };

  const addLeftSection = (label: string): number => {
    leftY = checkY(leftY, 10);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text(label.toUpperCase(), ctx.margin, leftY);
    doc.setTextColor(0);
    return leftY + 6;
  };

  if ((data.experience || []).length > 0) {
    leftY = addLeftSection("Experience");
    (data.experience || []).forEach((exp) => {
      leftY = checkY(leftY, 15);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      const titleLines = doc.splitTextToSize(`${exp.title} — ${exp.company}`, ctx.maxWidth);
      doc.text(titleLines, ctx.margin, leftY);
      leftY += titleLines.length * 5;
      const dateRange = formatDateRangePdf(exp.startDate, exp.endDate);
      if (dateRange) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text(dateRange, ctx.margin, leftY);
        doc.setTextColor(0);
        leftY += 4;
      }
      if (exp.bullets?.length) {
        doc.setFontSize(9);
        exp.bullets.forEach((b) => {
          const lines = doc.splitTextToSize(`• ${b}`, ctx.maxWidth - 2);
          leftY = checkY(leftY, lines.length * 4.5);
          doc.text(lines, ctx.margin + 2, leftY);
          leftY += lines.length * 4.5;
        });
      }
      leftY += 4;
    });
  }

  const rightX = ctx.pageWidth - ctx.margin - rightColWidth;
  doc.setFillColor(245, 247, 250);
  doc.rect(rightX - 5, ctx.y - 6, rightColWidth + 5, pageBottom, "F");

  const addRightSection = (label: string): number => {
    rightY = checkY(rightY, 10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text(label.toUpperCase(), rightX, rightY);
    doc.setTextColor(0);
    return rightY + 5;
  };

  rightY = addRightSection("Contact");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  [pi.email, pi.phone, pi.location, pi.linkedin, pi.portfolio].filter(Boolean).forEach(item => {
    rightY = checkY(rightY, 4);
    const lines = doc.splitTextToSize(item!, rightColWidth);
    doc.text(lines, rightX, rightY);
    rightY += lines.length * 4;
  });
  rightY += 4;

  if ((data.skills || []).length > 0) {
    rightY = addRightSection("Skills");
    doc.setFontSize(8);
    (data.skills || []).forEach(skill => {
      rightY = checkY(rightY, 4);
      doc.text(`• ${skill}`, rightX, rightY);
      rightY += 4;
    });
    rightY += 4;
  }
}

// ─── Prism (Premium) ───────────────────────────────────
function renderPrism(doc: jsPDF, data: ResumeData, title: string) {
  const ctx: PdfContext = { doc, y: 25, margin: 25, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};

  doc.setFillColor(155, 89, 182);
  doc.rect(0, 0, ctx.pageWidth, 8, "F");
  
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(142, 68, 173);
  doc.text((pi.fullName || title || "Resume").toUpperCase(), ctx.pageWidth / 2, ctx.y, { align: "center" });
  ctx.y += 6;
  
  const parts = [pi.email, pi.phone, pi.location].filter(Boolean);
  if (parts.length) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(parts.join("  ◆  "), ctx.pageWidth / 2, ctx.y, { align: "center" });
    ctx.y += 5;
  }
  doc.setTextColor(0);
  ctx.y += 4;

  const addSection = (label: string) => {
    checkPageBreak(ctx, 14);
    ctx.y += 6;
    doc.setFillColor(155, 89, 182);
    doc.line(ctx.margin, ctx.y + 1, ctx.margin + 3, ctx.y - 2);
    doc.line(ctx.margin + 3, ctx.y - 2, ctx.margin + 6, ctx.y + 1);
    doc.line(ctx.margin + 6, ctx.y + 1, ctx.margin + 3, ctx.y + 4);
    doc.line(ctx.margin + 3, ctx.y + 4, ctx.margin, ctx.y + 1);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(142, 68, 173);
    doc.text(label.toUpperCase(), ctx.margin + 10, ctx.y + 2);
    doc.setTextColor(0);
    ctx.y += 8;
  };

  renderBody(ctx, data, addSection);
}

// ─── Cobalt Edge ───────────────────────────────────────
function renderCobalt(doc: jsPDF, data: ResumeData, title: string, photoData?: string | null) {
  const ctx: PdfContext = { doc, y: 20, margin: 20, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};

  doc.setFillColor(29, 78, 137);
  doc.rect(0, 0, ctx.pageWidth, 45, "F");

  if (photoData) {
    addCircularPhoto(doc, photoData, ctx.pageWidth - 30, 22.5, 14, { r: 29, g: 78, b: 137 });
  }

  doc.setFontSize(24);
  doc.setFont("times", "bold");
  doc.setTextColor(255);
  doc.text(pi.fullName || title || "Resume", ctx.margin, 20);

  const parts = [pi.email, pi.phone, pi.location, pi.linkedin].filter(Boolean);
  if (parts.length) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(220);
    doc.text(parts.join("   •   "), ctx.margin, 30);
  }

  doc.setTextColor(0);
  ctx.y = 55;

  const pageBottom = doc.internal.pageSize.getHeight() - 12;
  const checkY = (y: number, needed: number): number => {
    if (y + needed > pageBottom) {
      doc.addPage();
      return 20;
    }
    return y;
  };

  const addSection = (label: string) => {
    ctx.y = checkY(ctx.y, 14);
    ctx.y += 4;
    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.setTextColor(29, 78, 137);
    doc.text(label, ctx.margin, ctx.y);
    const textWidth = doc.getTextWidth(label);
    doc.setDrawColor(29, 78, 137);
    doc.setLineWidth(0.5);
    doc.line(ctx.margin, ctx.y + 1.5, ctx.margin + textWidth, ctx.y + 1.5);
    doc.setTextColor(0);
    doc.setLineWidth(0.2); // reset
    ctx.y += 8;
  };

  if (data.summary) {
    addSection("Summary");
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    const lines = doc.splitTextToSize(data.summary, ctx.maxWidth);
    ctx.y = checkY(ctx.y, lines.length * 5);
    doc.text(lines, ctx.margin, ctx.y);
    ctx.y += lines.length * 5 + 4;
  }

  if ((data.experience || []).length > 0) {
    addSection("Professional Experience");
    data.experience!.forEach(exp => {
      doc.setFontSize(10);
      doc.setFont("times", "bold");
      ctx.y = checkY(ctx.y, 5);
      doc.text(`${exp.title}`, ctx.margin, ctx.y);
      const dateStr = formatDateRangePdf(exp.startDate, exp.endDate);
      if (dateStr) {
        doc.setFontSize(9);
        doc.setFont("times", "normal");
        const dw = doc.getTextWidth(dateStr);
        doc.text(dateStr, ctx.pageWidth - ctx.margin - dw, ctx.y);
      }
      ctx.y += 5;
      doc.setFontSize(10);
      doc.setFont("times", "italic");
      ctx.y = checkY(ctx.y, 5);
      doc.text(`${exp.company}`, ctx.margin, ctx.y);
      ctx.y += 5;

      doc.setFont("times", "normal");
      if (exp.bullets?.length) {
        exp.bullets.forEach((bullet) => {
          const lines = doc.splitTextToSize(`• ${bullet}`, ctx.maxWidth - 4);
          ctx.y = checkY(ctx.y, lines.length * 5);
          doc.text(lines, ctx.margin + 2, ctx.y);
          ctx.y += lines.length * 5;
        });
      } else if (exp.description) {
        const lines = doc.splitTextToSize(exp.description, ctx.maxWidth);
        ctx.y = checkY(ctx.y, lines.length * 5);
        doc.text(lines, ctx.margin, ctx.y);
        ctx.y += lines.length * 5;
      }
      ctx.y += 3;
    });
  }

  if ((data.education || []).length > 0) {
    addSection("Education");
    data.education!.forEach(edu => {
      doc.setFontSize(10);
      doc.setFont("times", "bold");
      ctx.y = checkY(ctx.y, 5);
      doc.text(`${edu.degree}`, ctx.margin, ctx.y);
      const dateStr = formatDateRangePdf(edu.startDate, edu.endDate) || (edu.year || "");
      if (dateStr) {
        doc.setFontSize(9);
        doc.setFont("times", "normal");
        const dw = doc.getTextWidth(dateStr);
        doc.text(dateStr, ctx.pageWidth - ctx.margin - dw, ctx.y);
      }
      ctx.y += 5;
      doc.setFontSize(10);
      doc.setFont("times", "italic");
      ctx.y = checkY(ctx.y, 5);
      doc.text(`${edu.school}`, ctx.margin, ctx.y);
      ctx.y += 6;
    });
  }

  if ((data.skills || []).length > 0) {
    addSection("Skills");
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    const halfWidth = ctx.maxWidth / 2;
    let tempY = ctx.y;
    let leftSide = true;
    data.skills!.forEach((skill, i) => {
      const x = leftSide ? ctx.margin + 2 : ctx.margin + 2 + halfWidth;
      tempY = checkY(tempY, 5);
      doc.text(`• ${skill}`, x, tempY);
      if (!leftSide) {
        tempY += 5;
      }
      leftSide = !leftSide;
    });
    if (!leftSide) tempY += 5;
    ctx.y = tempY + 2;
  }
  
  if ((data.languages || []).length > 0) {
    addSection("Languages");
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    const halfWidth = ctx.maxWidth / 2;
    let tempY = ctx.y;
    let leftSide = true;
    data.languages!.forEach((lang) => {
      const x = leftSide ? ctx.margin + 2 : ctx.margin + 2 + halfWidth;
      const str = `${lang.name}${lang.proficiency ? ` (${lang.proficiency})` : ""}`;
      tempY = checkY(tempY, 5);
      doc.text(`• ${str}`, x, tempY);
      if (!leftSide) {
        tempY += 5;
      }
      leftSide = !leftSide;
    });
    if (!leftSide) tempY += 5;
    ctx.y = tempY + 2;
  }
}

// ─── Main exports ──────────────────────────────────────

export interface PdfColorOverrides {
  /** Map of "r,g,b" (each 0-255 int, no spaces) -> [r,g,b] replacement */
  rgbMap: Record<string, [number, number, number]>;
}

/** Wrap doc.setTextColor / setFillColor / setDrawColor to remap brand RGBs. */
function applyColorOverrides(doc: jsPDF, overrides?: PdfColorOverrides) {
  if (!overrides || Object.keys(overrides.rgbMap).length === 0) return;
  const map = overrides.rgbMap;

  const wrap = (methodName: "setTextColor" | "setFillColor" | "setDrawColor") => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orig = (doc as any)[methodName].bind(doc);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any)[methodName] = (...args: any[]) => {
      // jsPDF accepts (gray) | (r,g,b) | (hex) | (CMYK)
      let r: number | null = null, g: number | null = null, b: number | null = null;
      if (args.length === 3 && args.every((a) => typeof a === "number")) {
        [r, g, b] = args as number[];
      } else if (args.length === 1 && typeof args[0] === "string" && args[0].startsWith("#")) {
        const hex = args[0].replace("#", "");
        const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
        const num = parseInt(full, 16);
        if (!Number.isNaN(num)) {
          r = (num >> 16) & 255; g = (num >> 8) & 255; b = num & 255;
        }
      }
      if (r !== null && g !== null && b !== null) {
        const key = `${r},${g},${b}`;
        const replacement = map[key];
        if (replacement) {
          return orig(replacement[0], replacement[1], replacement[2]);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return orig(...(args as any[]));
    };
  };

  wrap("setTextColor");
  wrap("setFillColor");
  wrap("setDrawColor");
}

export async function buildDoc(
  data: ResumeData,
  title: string,
  templateId: TemplateId = "classic",
  colorOverrides?: PdfColorOverrides,
): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  
  let appliedOverrides = colorOverrides;
  
  const themeVariants: Record<string, PdfColorOverrides> = {
    midnight: { rgbMap: { "37,99,235": [30, 30, 30] } },
    ocean: { rgbMap: { "30,58,95": [0, 105, 148] } },
    forest: { rgbMap: { "220,53,69": [39, 174, 96] } },
    rose: { rgbMap: { "180,145,70": [232, 67, 147] } },
    sunset: { rgbMap: { "166,72,52": [211, 84, 0] } },
    monochrome: { rgbMap: { "45,55,72": [60, 60, 60], "0,102,204": [80, 80, 80] } },
    ruby: { rgbMap: { "41,98,255": [192, 57, 43] } },
    emerald: { rgbMap: { "16,163,127": [46, 204, 113] } },
    sapphire: { rgbMap: { "155,89,182": [41, 128, 185], "142,68,173": [52, 152, 219] } },
    amethyst: { rgbMap: { "44,62,80": [142, 68, 173], "52,152,219": [155, 89, 182] } },
    gold: { rgbMap: { "41,128,185": [241, 196, 15] } },
    slate: { rgbMap: { "30,30,30": [112, 123, 124] } },
    coral: { rgbMap: { "130,130,130": [231, 76, 60] } }
  };

  if (!appliedOverrides && themeVariants[templateId]) {
    appliedOverrides = themeVariants[templateId];
  }

  applyColorOverrides(doc, appliedOverrides);

  // Pre-load photo for templates that support it
  const pi = data.personalInfo || {};
  const photoTemplates: string[] = ["contemporary", "sidebar", "polished", "waterfall", "ocean", "sunset", "amethyst", "emerald", "cobalt", "tpl_cre_maria", "tpl_cre_lucia", "tpl_cre_anna", "tpl_cre_antoine"];
  // Check for dynamic generated templates to pre-load photo
  const dynamicConfig = ALL_DYNAMIC_TEMPLATES.find(t => t.template_id === templateId);
  const isPhotoDynamic = dynamicConfig?.layout_metadata?.has_photo === true;

  if (pi.photoUrl && (photoTemplates.includes(templateId) || isPhotoDynamic)) {
    photoData = await loadImageAsBase64(pi.photoUrl);
  }

  // Check for config-driven ATS templates first
  if (isATSTemplateId(templateId)) {
    const atsConfig = getATSConfig(templateId);
    if (atsConfig) {
      renderATSFromConfig(doc, data, title, atsConfig);
      return doc;
    }
  }

  if (templateId === "tpl_cre_001") {
    await renderCreativeBrian(doc, data, title, photoData);
    return doc;
  }
  if (templateId === "tpl_cre_002") {
    await renderCreativeCamila(doc, data, title, photoData);
    return doc;
  }
  if (templateId === "tpl_cre_003") {
    await renderCreativeRohan(doc, data, title, photoData);
    return doc;
  }
  if (templateId === "tpl_cre_004") {
    await renderCreativeCatherine(doc, data, title, photoData);
    return doc;
  }
  if (templateId === "tpl_cre_005") {
    await renderCreativeMatteo(doc, data, title, photoData);
    return doc;
  }
  if (templateId === "tpl_cre_maria") {
    await renderCreativeMaria(doc, data, title, photoData);
    return doc;
  }
  if (templateId === "tpl_cre_lucia") {
    await renderCreativeLucia(doc, data, title, photoData);
    return doc;
  }
  if (templateId === "tpl_cre_anna") {
    await renderCreativeAnna(doc, data, title, photoData);
    return doc;
  }
  if (templateId === "tpl_cre_antoine") {
    await renderCreativeAntoine(doc, data, title, photoData);
    return doc;
  }

  // Check for dynamic generated templates
  if (dynamicConfig) {
    renderDynamicConfig(doc, data, title, dynamicConfig, photoData);
    return doc;
  }

  switch (templateId) {
    case "modern": renderModern(doc, data, title); break;
    case "minimal": renderMinimal(doc, data, title); break;
    case "executive": renderExecutive(doc, data, title); break;
    case "sidebar": renderSidebar(doc, data, title, photoData); break;
    case "twocolumn": renderTwoColumn(doc, data, title); break;
    case "creative": renderCreative(doc, data, title); break;
    case "compact": renderCompact(doc, data, title); break;
    case "professional": renderProfessional(doc, data, title); break;
    case "ats": renderATS(doc, data, title); break;
    case "simple": renderSimple(doc, data, title); break;
    case "elegant": renderElegant(doc, data, title); break;
    case "ivyleague": renderIvyLeague(doc, data, title); break;
    case "timeline": renderTimeline(doc, data, title); break;
    case "contemporary": await renderContemporary(doc, data, title); break;
    case "polished": renderPolished(doc, data, title, photoData); break;
    case "waterfall": renderWaterfall(doc, data, title, photoData); break;
    case "vision": renderVision(doc, data, title); break;
    case "prism": renderPrism(doc, data, title); break;
    case "midnight": renderModern(doc, data, title); break;
    case "ocean": renderSidebar(doc, data, title, photoData); break;
    case "forest": renderCreative(doc, data, title); break;
    case "rose": renderElegant(doc, data, title); break;
    case "sunset": renderPolished(doc, data, title, photoData); break;
    case "monochrome": renderTwoColumn(doc, data, title); break;
    case "ruby": renderTimeline(doc, data, title); break;
    case "emerald": await renderContemporary(doc, data, title); break;
    case "sapphire": renderPrism(doc, data, title); break;
    case "amethyst": renderWaterfall(doc, data, title, photoData); break;
    case "gold": renderVision(doc, data, title); break;
    case "slate": renderExecutive(doc, data, title); break;
    case "coral": renderMinimal(doc, data, title); break;
    case "cobalt": renderCobalt(doc, data, title, photoData); break;
    default: renderClassic(doc, data, title);
  }
  return doc;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function renderDynamicConfig(doc: jsPDF, data: ResumeData, title: string, config: any, photoData?: string | null) {
  const layout = config.layout_metadata;
  const primaryRgb = hexToRgb(layout.color_palette.primary);
  
  const ctx: PdfContext = { doc, y: 20, margin: parseInt(layout.spacing.margin) || 15, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  
  const pi = data.personalInfo || {};

  if (layout.sidebar_position === 'left' || layout.sidebar_position === 'asymmetrical-left') {
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(0, 0, 60, doc.internal.pageSize.getHeight(), "F");
    ctx.margin = 65;
    
    let textY = 20;
    if (layout.has_photo && photoData) {
       addCircularPhoto(doc, photoData, 30, textY + 5, 12, { r: primaryRgb.r, g: primaryRgb.g, b: primaryRgb.b });
       textY += 30;
    }
    
    doc.setTextColor(255);
    doc.setFontSize(16);
    doc.text(pi.fullName || title || "Resume", 5, textY);
    if (pi.email) {
       doc.setFontSize(9);
       doc.text(pi.email, 5, textY + 10);
    }
  } else {
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(0, 0, ctx.pageWidth, 36, "F");
    
    if (layout.has_photo && photoData) {
       addCircularPhoto(doc, photoData, ctx.pageWidth - 35, 18, 12, { r: primaryRgb.r, g: primaryRgb.g, b: primaryRgb.b });
    }
    
    doc.setTextColor(255);
    doc.setFontSize(22);
    doc.text(pi.fullName || title || "Resume", ctx.margin, 20);
  }
  
  ctx.maxWidth = ctx.pageWidth - ctx.margin - 15;
  ctx.y = 40;
  
  doc.setTextColor(0);
  
  const addSection = (label: string) => {
    checkPageBreak(ctx, 14);
    ctx.y += 5;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    if (layout.visual_emphasis === 'color-blocks') {
       doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
       doc.rect(ctx.margin, ctx.y - 4, ctx.maxWidth, 6, "F");
       doc.setTextColor(255);
    } else {
       doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    }
    doc.text(label.toUpperCase(), ctx.margin + (layout.visual_emphasis === 'color-blocks' ? 2 : 0), ctx.y);
    doc.setTextColor(0);
    ctx.y += 8;
  };

  renderBody(ctx, data, addSection);
}

export async function generateResumePDF(
  data: ResumeData,
  title: string,
  templateId: TemplateId = "classic",
  colorOverrides?: PdfColorOverrides,
) {
  const doc = await buildDoc(data, title, templateId, colorOverrides);
  const pi = data.personalInfo || {};
  const filename = `${(pi.fullName || title || "resume").replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
}

export async function generateResumePDFDataUrls(
  data: ResumeData,
  title: string,
  templateId: TemplateId = "classic",
  colorOverrides?: PdfColorOverrides,
): Promise<string[]> {
  const doc = await buildDoc(data, title, templateId, colorOverrides);
  const pageCount = doc.getNumberOfPages();
  const urls: string[] = [];
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    urls.push(doc.output("datauristring"));
  }
  return urls;
}

// ─── Creative Custom PDF Renderers ───────────────────────────────────────────

async function renderCreativeBrian(doc: jsPDF, data: ResumeData, title: string, photoData?: string | null) {
  const ctx: PdfContext = { doc, y: 20, margin: 76, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin - 12;
  const pi = data.personalInfo || {};

  // Draw dark blue sidebar
  doc.setFillColor(30, 45, 61);
  doc.rect(0, 0, 70, doc.internal.pageSize.getHeight(), "F");

  let sy = 20;

  // Photo
  if (photoData) {
    addCircularPhoto(doc, photoData, 35, sy + 12, 12, { r: 30, g: 45, b: 61 });
    sy += 28;
  }

  // Name & Title
  doc.setFont("times", "bold");
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  const name = pi.fullName || title || "Brian T. Wayne";
  const nameLines = doc.splitTextToSize(name, 60);
  nameLines.forEach(line => {
    doc.text(line, 35, sy, { align: "center" });
    sy += 5.5;
  });
  
  doc.setFont("times", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(230, 230, 230);
  const jobTitle = pi.title || "Business Development Consultant";
  const titleLines = doc.splitTextToSize(jobTitle, 60);
  titleLines.forEach(line => {
    doc.text(line, 35, sy, { align: "center" });
    sy += 4.5;
  });
  sy += 2;

  const addSidebarPill = (label: string, pillY: number) => {
    doc.setFillColor(255, 255, 255, 0.15);
    doc.roundedRect(8, pillY - 4, 54, 5.5, 1, 1, "F");
    doc.setFont("times", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(label, 35, pillY, { align: "center" });
  };

  const contactItems = [pi.email, pi.phone, pi.location, pi.linkedin, pi.portfolio].filter(Boolean);
  if (contactItems.length) {
    doc.setFontSize(7.5);
    doc.setFont("times", "normal");
    doc.setTextColor(230, 230, 230);
    contactItems.forEach(item => {
      const cleanItem = item!.replace(/^https?:\/\/(www\.)?/, '');
      const itemLines = doc.splitTextToSize(cleanItem, 56);
      itemLines.forEach(line => {
        doc.text(line, 35, sy, { align: "center" });
        sy += 4;
      });
    });
    sy += 2;
  }

  // Summary (Profile)
  if (data.summary) {
    sy += 4;
    addSidebarPill("PROFILE", sy);
    sy += 6;
    doc.setFont("times", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(230, 230, 230);
    const summaryLines = doc.splitTextToSize(data.summary, 58);
    summaryLines.forEach(line => {
      doc.text(line, 6, sy);
      sy += 4;
    });
    sy += 2;
  }

  // Languages
  if ((data.languages || []).length > 0) {
    sy += 4;
    addSidebarPill("LANGUAGES", sy);
    sy += 6;
    doc.setFont("times", "normal");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    data.languages!.forEach(l => {
      doc.text(l.name, 8, sy);
      
      const clean = (l.proficiency || "").toLowerCase();
      let active = 3;
      if (clean.includes("5") || clean.includes("native") || clean.includes("fluent") || clean.includes("expert")) active = 5;
      else if (clean.includes("4") || clean.includes("proficient") || clean.includes("advanced")) active = 4;
      else if (clean.includes("2") || clean.includes("basic") || clean.includes("elementary")) active = 2;
      else if (clean.includes("1") || clean.includes("beginner")) active = 1;
      
      for (let i = 0; i < 5; i++) {
        doc.setFillColor(i < active ? 255 : 80, i < active ? 255 : 95, i < active ? 255 : 110);
        doc.circle(48 + i * 3.5, sy - 1, 0.9, "F");
      }
      sy += 5;
    });
    sy += 2;
  }

  // Awards
  const certificates = (data.customSections || []).find(s => s.title?.toLowerCase().includes("award") || s.title?.toLowerCase().includes("certificate"));
  if (certificates && certificates.items.length > 0) {
    sy += 4;
    addSidebarPill("AWARDS", sy);
    sy += 6;
    doc.setFont("times", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(230, 230, 230);
    certificates.items.forEach(item => {
      const awardLines = doc.splitTextToSize(item, 58);
      awardLines.forEach(line => {
        doc.text(line, 6, sy);
        sy += 4;
      });
      sy += 1.5;
    });
  }

  // Main Column (Right)
  doc.setTextColor(0);
  
  const addMainSection = (label: string) => {
    ctx.y = checkY(ctx.y, 14);
    doc.setFillColor(241, 243, 245);
    doc.rect(74, ctx.y - 4, ctx.maxWidth + 4, 6.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(17, 17, 17);
    doc.text(label.toUpperCase(), 78, ctx.y + 0.5);
    doc.setTextColor(0);
    ctx.y += 8;
  };

  const checkY = (currY: number, needed: number): number => {
    const pageBottom = doc.internal.pageSize.getHeight() - 12;
    if (currY + needed > pageBottom) {
      doc.addPage();
      doc.setFillColor(30, 45, 61);
      doc.rect(0, 0, 70, doc.internal.pageSize.getHeight(), "F");
      return 20;
    }
    return currY;
  };

  if ((data.experience || []).length > 0) {
    addMainSection("Work Experience");
    data.experience!.forEach(exp => {
      const dateRange = formatDateRangePdf(exp.startDate, exp.endDate);
      ctx.y = checkY(ctx.y, 14);
      doc.setFont("times", "bold");
      doc.setFontSize(10.5);
      doc.text(exp.company, 76, ctx.y);
      ctx.y += 4.5;
      
      doc.setFont("times", "normal");
      doc.setFontSize(9.5);
      doc.text(exp.title, 76, ctx.y);
      
      if (dateRange) {
        doc.setFont("times", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(100);
        doc.text(`${dateRange}${exp.location ? ` | ${exp.location}` : ""}`, 76, ctx.y + 4);
        doc.setTextColor(0);
        ctx.y += 4;
      }
      ctx.y += 4.5;

      doc.setFont("times", "normal");
      doc.setFontSize(9.5);
      if (exp.bullets?.length) {
        exp.bullets.forEach(b => {
          const lines = doc.splitTextToSize(`•  ${b}`, ctx.maxWidth - 4);
          ctx.y = checkY(ctx.y, lines.length * 4.5);
          doc.text(lines, 78, ctx.y);
          ctx.y += lines.length * 4.5;
        });
      }
      ctx.y += 2.5;
    });
  }

  if ((data.education || []).length > 0) {
    addMainSection("Education");
    data.education!.forEach(edu => {
      const dateRange = formatDateRangePdf(edu.startDate, edu.endDate) || edu.year || "";
      ctx.y = checkY(ctx.y, 12);
      doc.setFont("times", "bold");
      doc.setFontSize(10.5);
      doc.text(edu.degree, 76, ctx.y);
      ctx.y += 4.5;
      
      doc.setFont("times", "normal");
      doc.setFontSize(9.5);
      doc.text(edu.school, 76, ctx.y);
      
      if (dateRange) {
        doc.setFont("times", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(100);
        doc.text(dateRange, 76, ctx.y + 4);
        doc.setTextColor(0);
        ctx.y += 4;
      }
      ctx.y += 5.5;
    });
  }

  if ((data.skills || []).length > 0) {
    addMainSection("Skills");
    doc.setFont("times", "normal");
    doc.setFontSize(9.5);
    data.skills!.forEach(s => {
      ctx.y = checkY(ctx.y, 4.5);
      doc.text(`•  ${s}`, 78, ctx.y);
      ctx.y += 4.5;
    });
  }

  const totalPages = doc.getNumberOfPages();
  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(30, 45, 61);
    doc.rect(0, 0, 70, doc.internal.pageSize.getHeight(), "F");
  }
  doc.setPage(totalPages);
}

async function renderCreativeCamila(doc: jsPDF, data: ResumeData, title: string, photoData?: string | null) {
  const ctx: PdfContext = { doc, y: 56, margin: 15, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};

  // Header Banner Gray Background
  doc.setFillColor(238, 241, 245);
  doc.rect(0, 0, ctx.pageWidth, 48, "F");

  // Photo
  if (photoData) {
    addCircularPhoto(doc, photoData, 32, 24, 11, { r: 238, g: 241, b: 245 });
  }

  // Name & Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(44, 62, 80);
  doc.text(pi.fullName || title || "Camila Rivera", 54, 20);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(127, 140, 141);
  doc.text((pi.title || "Sales Manager").toUpperCase(), 54, 25);

  // Contact 2x2 Grid
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  let gridY = 32;
  if (pi.email) {
    doc.text(pi.email, 54, gridY);
  }
  if (pi.phone) {
    doc.text(pi.phone, 54, gridY + 5);
  }
  if (pi.location) {
    doc.text(pi.location, 120, gridY);
  }
  if (pi.linkedin) {
    doc.text(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''), 120, gridY + 5);
  }

  doc.setTextColor(0);

  const addSection = (label: string) => {
    ctx.y = checkY(ctx.y, 14);
    doc.setFillColor(238, 241, 245);
    doc.rect(15, ctx.y - 4, ctx.maxWidth, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 51, 51);
    doc.text(label.toUpperCase(), 105, ctx.y + 0.5, { align: "center" });
    doc.setTextColor(0);
    ctx.y += 8;
  };

  const checkY = (currY: number, needed: number): number => {
    const pageBottom = doc.internal.pageSize.getHeight() - 12;
    if (currY + needed > pageBottom) {
      doc.addPage();
      return 20;
    }
    return currY;
  };

  if (data.summary) {
    addSection("Summary");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(data.summary, ctx.maxWidth);
    ctx.y = checkY(ctx.y, lines.length * 5);
    doc.text(lines, ctx.margin, ctx.y);
    ctx.y += lines.length * 5 + 2;
  }

  if ((data.experience || []).length > 0) {
    addSection("Professional Experience");
    data.experience!.forEach(exp => {
      const dateRange = formatDateRangePdf(exp.startDate, exp.endDate);
      ctx.y = checkY(ctx.y, 12);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(dateRange, 15, ctx.y);
      if (exp.location) {
        doc.setFont("helvetica", "italic");
        doc.text(exp.location, 15, ctx.y + 4.5);
      }
      doc.setTextColor(0);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(exp.company, 60, ctx.y);
      doc.setFont("helvetica", "oblique");
      doc.setFontSize(9.5);
      doc.text(exp.title, 60, ctx.y + 4.5);
      ctx.y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      if (exp.bullets?.length) {
        exp.bullets.forEach(b => {
          const lines = doc.splitTextToSize(`•  ${b}`, ctx.maxWidth - 45);
          ctx.y = checkY(ctx.y, lines.length * 4.5);
          doc.text(lines, 60, ctx.y);
          ctx.y += lines.length * 4.5;
        });
      }
      ctx.y += 2.5;
    });
  }

  if ((data.education || []).length > 0) {
    addSection("Education");
    data.education!.forEach(edu => {
      const dateRange = formatDateRangePdf(edu.startDate, edu.endDate) || edu.year || "";
      ctx.y = checkY(ctx.y, 12);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(dateRange, 15, ctx.y);
      doc.setTextColor(0);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(edu.degree, 60, ctx.y);
      doc.setFont("helvetica", "oblique");
      doc.setFontSize(9.5);
      doc.text(edu.school, 60, ctx.y + 4.5);
      ctx.y += 10;
    });
  }

  if ((data.skills || []).length > 0) {
    addSection("Skills");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const colWidth = ctx.maxWidth / 3;
    let tempY = ctx.y;
    data.skills!.forEach((s, idx) => {
      const col = idx % 3;
      const x = ctx.margin + col * colWidth;
      tempY = checkY(tempY, 5);
      doc.text(`• ${s}`, x, tempY);
      if (col === 2 || idx === data.skills!.length - 1) {
        tempY += 5;
      }
    });
    ctx.y = tempY + 2;
  }

  if ((data.languages || []).length > 0) {
    addSection("Languages");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const colWidth = ctx.maxWidth / 2;
    let tempY = ctx.y;
    data.languages!.forEach((l, idx) => {
      const col = idx % 2;
      const x = ctx.margin + col * colWidth + 10;
      tempY = checkY(tempY, 5);
      doc.setFont("helvetica", "bold");
      doc.text(l.name, x, tempY);
      
      const clean = (l.proficiency || "").toLowerCase();
      let active = 3;
      if (clean.includes("5") || clean.includes("native") || clean.includes("fluent") || clean.includes("expert")) active = 5;
      else if (clean.includes("4") || clean.includes("proficient") || clean.includes("advanced")) active = 4;
      else if (clean.includes("2") || clean.includes("basic") || clean.includes("elementary")) active = 2;
      else if (clean.includes("1") || clean.includes("beginner")) active = 1;

      for (let i = 0; i < 5; i++) {
        doc.setFillColor(i < active ? 44 : 220, i < active ? 62 : 220, i < active ? 80 : 220);
        doc.circle(x + doc.getTextWidth(l.name) + 6 + i * 3, tempY - 1, 0.8, "F");
      }
      
      if (col === 1 || idx === data.languages!.length - 1) {
        tempY += 5.5;
      }
    });
    ctx.y = tempY + 2;
  }
}

async function renderCreativeRohan(doc: jsPDF, data: ResumeData, title: string, photoData?: string | null) {
  const ctx: PdfContext = { doc, y: 46, margin: 15, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};

  // Photo
  if (photoData) {
    addCircularPhoto(doc, photoData, ctx.pageWidth - 30, 24, 11);
  }

  // Name & Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(10, 58, 96);
  doc.text(pi.fullName || title || "Rohan K. Patel", 15, 20);
  
  doc.setFont("helvetica", "oblique");
  doc.setFontSize(10.5);
  doc.setTextColor(11, 76, 124);
  doc.text(pi.title || "Project Engineer", 15 + doc.getTextWidth(pi.fullName || title || "Rohan K. Patel") + 4, 20);

  // Contact Grid
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  let contactY = 27;
  const contactItems = [pi.email, pi.phone, pi.location, pi.linkedin].filter(Boolean);
  if (contactItems.length) {
    doc.text(contactItems.join("  |  "), 15, contactY);
    contactY += 4.5;
  }
  const metaParts = ["Indian", "15.07.2002"];
  doc.text(metaParts.join("  |  "), 15, contactY);

  doc.setTextColor(0);

  const addSection = (label: string) => {
    ctx.y = checkY(ctx.y, 14);
    doc.setFillColor(240, 244, 248);
    doc.rect(15, ctx.y - 4, ctx.maxWidth, 6, "F");
    doc.setFillColor(10, 58, 96);
    doc.rect(15, ctx.y - 4, 1.5, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(10, 58, 96);
    doc.text(label.toUpperCase(), 19, ctx.y + 0.5);
    doc.setTextColor(0);
    ctx.y += 8;
  };

  const checkY = (currY: number, needed: number): number => {
    const pageBottom = doc.internal.pageSize.getHeight() - 12;
    if (currY + needed > pageBottom) {
      doc.addPage();
      return 20;
    }
    return currY;
  };

  if (data.summary) {
    addSection("Summary");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(data.summary, ctx.maxWidth);
    ctx.y = checkY(ctx.y, lines.length * 5);
    doc.text(lines, ctx.margin, ctx.y);
    ctx.y += lines.length * 5 + 2;
  }

  if ((data.experience || []).length > 0) {
    addSection("Professional Experience");
    data.experience!.forEach(exp => {
      const dateRange = formatDateRangePdf(exp.startDate, exp.endDate);
      ctx.y = checkY(ctx.y, 12);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(10, 58, 96);
      doc.text(dateRange, 15, ctx.y);
      if (exp.location) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text(exp.location, 15, ctx.y + 4.5);
      }
      doc.setTextColor(0);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(exp.company, 60, ctx.y);
      doc.setFont("helvetica", "oblique");
      doc.setFontSize(9.5);
      doc.text(exp.title, 60, ctx.y + 4.5);
      ctx.y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      if (exp.bullets?.length) {
        exp.bullets.forEach(b => {
          const lines = doc.splitTextToSize(`•  ${b}`, ctx.maxWidth - 45);
          ctx.y = checkY(ctx.y, lines.length * 4.5);
          doc.text(lines, 60, ctx.y);
          ctx.y += lines.length * 4.5;
        });
      }
      ctx.y += 2.5;
    });
  }

  if ((data.education || []).length > 0) {
    addSection("Education");
    data.education!.forEach(edu => {
      const dateRange = formatDateRangePdf(edu.startDate, edu.endDate) || edu.year || "";
      ctx.y = checkY(ctx.y, 12);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(10, 58, 96);
      doc.text(dateRange, 15, ctx.y);
      doc.setTextColor(0);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(edu.degree, 60, ctx.y);
      doc.setFont("helvetica", "oblique");
      doc.setFontSize(9.5);
      doc.text(edu.school, 60, ctx.y + 4.5);
      ctx.y += 10;
    });
  }

  if ((data.skills || []).length > 0) {
    addSection("Skills");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const colWidth = ctx.maxWidth / 3;
    let tempY = ctx.y;
    data.skills!.forEach((s, idx) => {
      const col = idx % 3;
      const x = ctx.margin + col * colWidth;
      tempY = checkY(tempY, 5);
      doc.text(`• ${s}`, x, tempY);
      if (col === 2 || idx === data.skills!.length - 1) {
        tempY += 5;
      }
    });
    ctx.y = tempY + 2;
  }

  if ((data.languages || []).length > 0) {
    addSection("Languages");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const colWidth = ctx.maxWidth / 3;
    let tempY = ctx.y;
    data.languages!.forEach((l, idx) => {
      const col = idx % 3;
      const x = ctx.margin + col * colWidth;
      tempY = checkY(tempY, 5);
      doc.text(`• ${l.name}`, x, tempY);
      if (col === 2 || idx === data.languages!.length - 1) {
        tempY += 5;
      }
    });
    ctx.y = tempY + 2;
  }

  const certificates = (data.customSections || []).find(s => s.title?.toLowerCase().includes("cert") || s.title?.toLowerCase().includes("award"));
  if (certificates && certificates.items.length > 0) {
    addSection("Certificates");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const colWidth = ctx.maxWidth / 3;
    let tempY = ctx.y;
    certificates.items.forEach((item, idx) => {
      const col = idx % 3;
      const x = ctx.margin + col * colWidth;
      tempY = checkY(tempY, 5);
      doc.text(`• ${item}`, x, tempY);
      if (col === 2 || idx === certificates.items.length - 1) {
        tempY += 5;
      }
    });
    ctx.y = tempY + 2;
  }
}

async function renderCreativeCatherine(doc: jsPDF, data: ResumeData, title: string, photoData?: string | null) {
  const ctx: PdfContext = { doc, y: 44, margin: 24, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin - 15;
  const pi = data.personalInfo || {};

  const drawSidebarBg = () => {
    doc.setFillColor(238, 247, 242);
    doc.rect(0, 0, 15, doc.internal.pageSize.getHeight(), "F");
    doc.setDrawColor(46, 125, 50);
    doc.setLineWidth(0.6);
    doc.line(15, 0, 15, doc.internal.pageSize.getHeight());
    doc.setLineWidth(0.2);
    
    doc.setFillColor(46, 125, 50);
    for (let y = 20; y < doc.internal.pageSize.getHeight(); y += 22) {
      doc.ellipse(7.5, y, 1.2, 2.2, "F");
      doc.setDrawColor(46, 125, 50);
      doc.line(7.5, y - 2.2, 7.5, y + 2.5);
    }
  };

  drawSidebarBg();

  // Photo
  if (photoData) {
    addCircularPhoto(doc, photoData, ctx.pageWidth - 30, 22, 11);
  }

  // Name & Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(17, 17, 17);
  doc.text(pi.fullName || title || "Catherine Bale", 22, 20);
  
  doc.setFont("helvetica", "oblique");
  doc.setFontSize(10.5);
  doc.setTextColor(80, 80, 80);
  doc.text(pi.title || "Marketing Assistant", 22, 25);

  // Contact line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100);
  const contacts = [pi.email, pi.phone, pi.location, pi.linkedin].filter(Boolean);
  doc.text(contacts.join("  |  "), 22, 31);

  doc.setTextColor(0);

  const addSection = (label: string) => {
    ctx.y = checkY(ctx.y, 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 17, 17);
    doc.text(label, 22, ctx.y);
    doc.setDrawColor(51, 51, 51);
    doc.setLineWidth(0.5);
    doc.line(22, ctx.y + 1.5, 195, ctx.y + 1.5);
    doc.setLineWidth(0.2);
    ctx.y += 8;
  };

  const checkY = (currY: number, needed: number): number => {
    const pageBottom = doc.internal.pageSize.getHeight() - 12;
    if (currY + needed > pageBottom) {
      doc.addPage();
      drawSidebarBg();
      return 20;
    }
    return currY;
  };

  if (data.summary) {
    addSection("Profile");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(data.summary, ctx.maxWidth);
    ctx.y = checkY(ctx.y, lines.length * 5);
    doc.text(lines, 22, ctx.y);
    ctx.y += lines.length * 5 + 2;
  }

  if ((data.experience || []).length > 0) {
    addSection("Professional Experience");
    data.experience!.forEach(exp => {
      const dateRange = formatDateRangePdf(exp.startDate, exp.endDate);
      ctx.y = checkY(ctx.y, 12);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(exp.company, 22, ctx.y);
      
      if (dateRange) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        const text = `${dateRange} | ${exp.location || "Milwaukee"}`;
        doc.text(text, ctx.pageWidth - doc.getTextWidth(text) - 15, ctx.y);
        doc.setTextColor(0);
      }
      ctx.y += 4.5;
      
      doc.setFont("helvetica", "oblique");
      doc.setFontSize(9.5);
      doc.text(exp.title, 22, ctx.y);
      ctx.y += 5.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      if (exp.bullets?.length) {
        exp.bullets.forEach(b => {
          const lines = doc.splitTextToSize(`•  ${b}`, ctx.maxWidth - 4);
          ctx.y = checkY(ctx.y, lines.length * 4.5);
          doc.text(lines, 24, ctx.y);
          ctx.y += lines.length * 4.5;
        });
      }
      ctx.y += 2.5;
    });
  }

  if ((data.education || []).length > 0) {
    addSection("Education");
    data.education!.forEach(edu => {
      const dateRange = formatDateRangePdf(edu.startDate, edu.endDate) || edu.year || "";
      ctx.y = checkY(ctx.y, 12);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(edu.school, 22, ctx.y);
      
      if (dateRange) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        doc.text(dateRange, ctx.pageWidth - doc.getTextWidth(dateRange) - 15, ctx.y);
        doc.setTextColor(0);
      }
      ctx.y += 4.5;
      
      doc.setFont("helvetica", "oblique");
      doc.setFontSize(9.5);
      doc.text(edu.degree, 22, ctx.y);
      ctx.y += 7.5;
    });
  }

  const certificates = (data.customSections || []).find(s => s.title?.toLowerCase().includes("cert") || s.title?.toLowerCase().includes("award"));
  if (certificates && certificates.items.length > 0) {
    addSection("Certificates");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    ctx.y = checkY(ctx.y, 5);
    doc.text(certificates.items.join("  •  "), 22, ctx.y);
    ctx.y += 7.5;
  }

  if ((data.languages || []).length > 0) {
    addSection("Languages");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    ctx.y = checkY(ctx.y, 5);
    const langText = data.languages!.map(l => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ""}`).join("  •  ");
    doc.text(langText, 22, ctx.y);
    ctx.y += 7.5;
  }

  if ((data.skills || []).length > 0) {
    addSection("Skills");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    
    const half = Math.ceil(data.skills!.length / 2);
    const colWidth = ctx.maxWidth / 2;
    let col1Y = ctx.y;
    let col2Y = ctx.y;

    for (let i = 0; i < data.skills!.length; i++) {
      const s = data.skills![i];
      if (i < half) {
        col1Y = checkY(col1Y, 5);
        doc.text(`• ${s}`, 24, col1Y);
        col1Y += 5;
      } else {
        col2Y = checkY(col2Y, 5);
        doc.text(`• ${s}`, 24 + colWidth, col2Y);
        col2Y += 5;
      }
    }
    ctx.y = Math.max(col1Y, col2Y) + 2;
  }

  const totalPages = doc.getNumberOfPages();
  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);
    drawSidebarBg();
  }
  doc.setPage(totalPages);
}

async function renderCreativeMatteo(doc: jsPDF, data: ResumeData, title: string, photoData?: string | null) {
  const ctx: PdfContext = { doc, y: 46, margin: 15, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  const leftColWidth = 62;
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2 - leftColWidth - 10;
  const pi = data.personalInfo || {};

  // Photo
  if (photoData) {
    addCircularPhoto(doc, photoData, 26, 26, 10);
  }

  // Name & Title
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.setTextColor(17, 17, 17);
  doc.text(pi.fullName || title || "Matteo Ricci", 42, 22);
  
  doc.setFont("times", "italic");
  doc.setFontSize(10.5);
  doc.setTextColor(80, 80, 80);
  doc.text(pi.title || "Head of Operations", 42, 27);

  // Contact Grid
  doc.setFont("times", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100);
  const contacts = [pi.email, pi.phone, pi.location, pi.linkedin].filter(Boolean);
  doc.text(contacts.join("  |  "), 42, 33);

  doc.setTextColor(0);
  ctx.y = 44;

  let leftY = ctx.y;
  let rightY = ctx.y;
  const pageBottom = doc.internal.pageSize.getHeight() - 12;
  const checkY = (y: number, needed: number): number => {
    if (y + needed > pageBottom) {
      doc.addPage();
      return 20;
    }
    return y;
  };

  const addColumnHeader = (label: string, xPos: number, currColY: number): number => {
    const yVal = checkY(currColY, 14);
    doc.setFont("times", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(17, 17, 17);
    doc.text(label.toUpperCase(), xPos, yVal);
    
    doc.setDrawColor(230, 126, 34);
    doc.setLineWidth(0.6);
    doc.line(xPos, yVal + 1.5, xPos + 18, yVal + 1.5);
    doc.setLineWidth(0.2);
    doc.setTextColor(0);
    return yVal + 7.5;
  };

  // Left Column
  const leftX = ctx.margin;
  
  if (data.summary) {
    leftY = addColumnHeader("Summary", leftX, leftY);
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(data.summary, leftColWidth);
    lines.forEach(line => {
      leftY = checkY(leftY, 4.5);
      doc.text(line, leftX, leftY);
      leftY += 4.5;
    });
    leftY += 3;
  }

  if ((data.skills || []).length > 0) {
    leftY = addColumnHeader("Skills", leftX, leftY);
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    data.skills!.forEach(s => {
      leftY = checkY(leftY, 4.5);
      doc.text(`• ${s}`, leftX, leftY);
      leftY += 4.5;
    });
    leftY += 3;
  }

  if ((data.languages || []).length > 0) {
    leftY = addColumnHeader("Languages", leftX, leftY);
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    data.languages!.forEach(l => {
      leftY = checkY(leftY, 4.5);
      doc.setFont("times", "bold");
      doc.text(l.name, leftX, leftY);
      doc.setFont("times", "normal");
      doc.text(`: ${l.proficiency || "Fluent"}`, leftX + doc.getTextWidth(l.name), leftY);
      leftY += 4.5;
    });
    leftY += 3;
  }

  const certificates = (data.customSections || []).find(s => s.title?.toLowerCase().includes("cert") || s.title?.toLowerCase().includes("award"));
  if (certificates && certificates.items.length > 0) {
    leftY = addColumnHeader("Certificates", leftX, leftY);
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    certificates.items.forEach(item => {
      leftY = checkY(leftY, 4.5);
      doc.text(`• ${item}`, leftX, leftY);
      leftY += 4.5;
    });
  }

  // Right Column
  const rightX = ctx.margin + leftColWidth + 10;
  const rightColWidth = ctx.pageWidth - rightX - ctx.margin;

  if ((data.experience || []).length > 0) {
    rightY = addColumnHeader("Experience", rightX, rightY);
    data.experience!.forEach(exp => {
      const dateRange = formatDateRangePdf(exp.startDate, exp.endDate);
      rightY = checkY(rightY, 12);
      
      doc.setFont("times", "bold");
      doc.setFontSize(10.5);
      doc.text(exp.title, rightX, rightY);
      
      if (dateRange) {
        doc.setFont("times", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        doc.text(dateRange, ctx.pageWidth - doc.getTextWidth(dateRange) - 15, rightY);
        doc.setTextColor(0);
      }
      rightY += 4.5;
      
      doc.setFont("times", "italic");
      doc.setFontSize(9.5);
      doc.text(`${exp.company} | ${exp.location || "Milan, Italy"}`, rightX, rightY);
      rightY += 5.5;

      doc.setFont("times", "normal");
      doc.setFontSize(9);
      if (exp.bullets?.length) {
        exp.bullets.forEach(b => {
          const lines = doc.splitTextToSize(`• ${b}`, rightColWidth - 2);
          rightY = checkY(rightY, lines.length * 4.5);
          doc.text(lines, rightX + 2, rightY);
          rightY += lines.length * 4.5;
        });
      }
      rightY += 2.5;
    });
  }

  if ((data.education || []).length > 0) {
    rightY = addColumnHeader("Education", rightX, rightY);
    data.education!.forEach(edu => {
      const dateRange = formatDateRangePdf(edu.startDate, edu.endDate) || edu.year || "";
      rightY = checkY(rightY, 12);
      
      doc.setFont("times", "bold");
      doc.setFontSize(10.5);
      doc.text(edu.degree, rightX, rightY);
      
      if (dateRange) {
        doc.setFont("times", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        doc.text(dateRange, ctx.pageWidth - doc.getTextWidth(dateRange) - 15, rightY);
        doc.setTextColor(0);
      }
      rightY += 4.5;
      
      doc.setFont("times", "italic");
      doc.setFontSize(9.5);
      doc.text(edu.school, rightX, rightY);
      rightY += 6.5;
    });
  }
}

function renderOliviaBennettPdf(doc: jsPDF, data: ResumeData, title: string, config: ATSTemplateConfig) {
  const ctx: PdfContext = { doc, y: config.marginSize, margin: config.marginSize, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};
  const fs = config.baseFontSize;
  const ls = config.lineSpacing;
  const primaryRgb = hexToRgb(config.primaryColor || "#0f3c5f");

  // Centered header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(config.nameFontSize);
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  const name = pi.fullName || title || "Resume";
  doc.text(name, (ctx.pageWidth - doc.getTextWidth(name)) / 2, ctx.y);
  ctx.y += config.nameFontSize * 0.35 + 2;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fs + 1.5);
  doc.setTextColor(80, 80, 80);
  const pTitle = (pi.title || "Head of Customer Service").toUpperCase();
  doc.text(pTitle, (ctx.pageWidth - doc.getTextWidth(pTitle)) / 2, ctx.y);
  ctx.y += 6;

  // Contact line
  const contacts: string[] = [];
  if (pi.location) contacts.push(pi.location);
  if (pi.email) contacts.push(pi.email);
  if (pi.phone) contacts.push(pi.phone);
  if (pi.linkedin) contacts.push(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''));

  if (contacts.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(fs - 0.5);
    doc.setTextColor(60, 60, 60);
    const contactsStr = contacts.join("   •   ");
    doc.text(contactsStr, (ctx.pageWidth - doc.getTextWidth(contactsStr)) / 2, ctx.y);
    ctx.y += ls + 2;
  }
  doc.setTextColor(0);

  // Section divider lines: Thin double borders around headers
  const addSection = (label: string) => {
    checkPageBreak(ctx, config.headingFontSize + 10);
    ctx.y += 5;
    
    // Draw thin line above
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(0.4);
    doc.line(ctx.margin, ctx.y, ctx.pageWidth - ctx.margin, ctx.y);
    ctx.y += 4.5;

    // Heading text centered
    doc.setFont("helvetica", "bold");
    doc.setFontSize(config.headingFontSize);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    const labelUpper = label.toUpperCase();
    doc.text(labelUpper, (ctx.pageWidth - doc.getTextWidth(labelUpper)) / 2, ctx.y);
    ctx.y += 2.5;

    // Draw thin line below
    doc.line(ctx.margin, ctx.y, ctx.pageWidth - ctx.margin, ctx.y);
    doc.setTextColor(0);
    ctx.y += config.headingFontSize * 0.4 + 4;
  };

  config.sectionOrder.forEach(sec => {
    if (sec === "summary" && data.summary) {
      addSection("Summary");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fs);
      const lines = doc.splitTextToSize(data.summary, ctx.maxWidth);
      checkPageBreak(ctx, lines.length * ls);
      lines.forEach(line => {
        doc.text(line, (ctx.pageWidth - doc.getTextWidth(line)) / 2, ctx.y);
        ctx.y += ls;
      });
    } else if (sec === "experience" && (data.experience || []).length > 0) {
      addSection("Professional Experience");
      data.experience!.forEach(exp => {
        const dateRange = formatDateRangePdf(exp.startDate, exp.endDate);
        const expHeaderHeight = 9;
        checkPageBreak(ctx, expHeaderHeight + 6);

        // Job Title & Date
        doc.setFont("helvetica", "bold");
        doc.setFontSize(fs);
        doc.text(exp.title, ctx.margin, ctx.y);
        if (dateRange) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(fs - 1);
          doc.text(dateRange, ctx.pageWidth - ctx.margin - doc.getTextWidth(dateRange), ctx.y);
        }
        ctx.y += 4.5;

        // Company & Location
        doc.setFont("helvetica", "italic");
        doc.setFontSize(fs);
        doc.text(exp.company, ctx.margin, ctx.y);
        if (exp.location) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(fs - 1);
          doc.text(exp.location, ctx.pageWidth - ctx.margin - doc.getTextWidth(exp.location), ctx.y);
        }
        ctx.y += ls;

        // Bullets
        doc.setFont("helvetica", "normal");
        if (exp.bullets?.length) {
          exp.bullets.forEach(b => {
            const bLines = doc.splitTextToSize(`•  ${b}`, ctx.maxWidth - 4);
            checkPageBreak(ctx, bLines.length * ls);
            doc.text(bLines, ctx.margin + 2, ctx.y);
            ctx.y += bLines.length * ls;
          });
        }
        ctx.y += 2.5;
      });
    } else if (sec === "education" && (data.education || []).length > 0) {
      addSection("Education");
      data.education!.forEach(edu => {
        const dateStr = formatDateRangePdf(edu.startDate, edu.endDate) || (edu.year || "");
        checkPageBreak(ctx, 12);

        // Degree & Date
        doc.setFont("helvetica", "bold");
        doc.setFontSize(fs);
        doc.text(edu.degree, ctx.margin, ctx.y);
        if (dateStr) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(fs - 1);
          doc.text(dateStr, ctx.pageWidth - ctx.margin - doc.getTextWidth(dateStr), ctx.y);
        }
        ctx.y += 4.5;

        // School
        doc.setFont("helvetica", "italic");
        doc.setFontSize(fs);
        doc.text(edu.school, ctx.margin, ctx.y);
        ctx.y += ls + 1.5;
      });
    } else if (sec === "skills" && (data.skills || []).length > 0) {
      addSection("Skills");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fs);
      
      const items = data.skills!;
      const colWidth = ctx.maxWidth / 4;
      
      for (let i = 0; i < items.length; i += 4) {
        checkPageBreak(ctx, ls);
        const batch = items.slice(i, i + 4);
        batch.forEach((s, idx) => {
          const itemText = `• ${s}`;
          const x = ctx.margin + idx * colWidth + (colWidth - doc.getTextWidth(itemText)) / 2;
          doc.text(itemText, x, ctx.y);
        });
        ctx.y += ls;
      }
    } else if (sec === "languages" && (data.languages || []).length > 0) {
      addSection("Languages");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(fs);
      
      const items = data.languages!;
      const colWidth = ctx.maxWidth / 4;
      
      for (let i = 0; i < items.length; i += 4) {
        checkPageBreak(ctx, ls);
        const batch = items.slice(i, i + 4);
        batch.forEach((l, idx) => {
          const itemText = `${l.name}${l.proficiency ? ` (${l.proficiency})` : ""}`;
          const x = ctx.margin + idx * colWidth + (colWidth - doc.getTextWidth(itemText)) / 2;
          doc.text(itemText, x, ctx.y);
        });
        ctx.y += ls;
      }
    } else if (sec === "custom" && (data.customSections || []).length > 0) {
      data.customSections!.forEach(sec => {
        if (!sec.title || !sec.items?.length) return;
        addSection(sec.title);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fs);

        const isGrid = sec.title.toLowerCase().includes("cert") || sec.title.toLowerCase().includes("award") || sec.title.toLowerCase().includes("skill");
        if (isGrid) {
          const items = sec.items;
          const colWidth = ctx.maxWidth / 4;
          for (let i = 0; i < items.length; i += 4) {
            checkPageBreak(ctx, ls);
            const batch = items.slice(i, i + 4);
            batch.forEach((item, idx) => {
              const itemText = `• ${item}`;
              const x = ctx.margin + idx * colWidth + (colWidth - doc.getTextWidth(itemText)) / 2;
              doc.text(itemText, x, ctx.y);
            });
            ctx.y += ls;
          }
        } else {
          sec.items.forEach(item => {
            const lines = doc.splitTextToSize(`•  ${item}`, ctx.maxWidth);
            checkPageBreak(ctx, lines.length * ls);
            doc.text(lines, ctx.margin, ctx.y);
            ctx.y += lines.length * ls;
          });
        }
      });
    }
  });
}

async function renderCreativeMaria(doc: jsPDF, data: ResumeData, title: string, photoData?: string | null) {
  const ctx: PdfContext = { doc, y: 46, margin: 15, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};
  const primaryRgb = { r: 230, g: 126, b: 34 }; // Orange #e67e22
  const darkGrayRgb = { r: 44, g: 62, b: 80 }; // #2c3e50

  // 1. Dark Header Banner
  doc.setFillColor(darkGrayRgb.r, darkGrayRgb.g, darkGrayRgb.b);
  doc.rect(0, 0, ctx.pageWidth, 38, "F");

  // Name & Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255);
  doc.text(pi.fullName || title || "Maria Teresa Villanueva", ctx.margin, 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text((pi.title || "Head of Operations").toUpperCase(), ctx.margin, 24);

  // Contacts horizontal row in header
  const contacts: string[] = [];
  if (pi.location) contacts.push(pi.location);
  if (pi.email) contacts.push(pi.email);
  if (pi.phone) contacts.push(pi.phone);
  if (pi.linkedin) contacts.push(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''));
  if (contacts.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(230, 235, 240);
    doc.text(contacts.join("   |   "), ctx.margin, 30);
  }
  doc.setTextColor(0);

  // Photo inside banner
  if (photoData) {
    addCircularPhoto(doc, photoData, ctx.pageWidth - 30, 19, 12, darkGrayRgb);
  }

  const addSection = (label: string) => {
    checkPageBreak(ctx, 16);
    ctx.y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text(label.toUpperCase(), ctx.margin, ctx.y);
    
    // Draw orange underline
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(0.6);
    doc.line(ctx.margin, ctx.y + 1.5, ctx.pageWidth - ctx.margin, ctx.y + 1.5);
    doc.setTextColor(0);
    ctx.y += 7;
  };

  // Render Body
  if (data.summary) {
    addSection("Summary");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(data.summary, ctx.maxWidth);
    checkPageBreak(ctx, lines.length * 4.5);
    doc.text(lines, ctx.margin, ctx.y);
    ctx.y += lines.length * 4.5 + 2;
  }

  if ((data.experience || []).length > 0) {
    addSection("Experience");
    data.experience!.forEach(exp => {
      const dateRange = formatDateRangePdf(exp.startDate, exp.endDate);
      ctx.y = checkY(ctx.y, 14);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(exp.title, ctx.margin, ctx.y);

      if (dateRange) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        doc.text(dateRange, ctx.pageWidth - ctx.margin - doc.getTextWidth(dateRange), ctx.y);
        doc.setTextColor(0);
      }
      ctx.y += 4.5;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text(`${exp.company} | ${exp.location || ""}`, ctx.margin, ctx.y);
      ctx.y += 5.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      if (exp.bullets?.length) {
        exp.bullets.forEach(b => {
          const lines = doc.splitTextToSize(`•  ${b}`, ctx.maxWidth - 4);
          ctx.y = checkY(ctx.y, lines.length * 4.5);
          doc.text(lines, ctx.margin + 2, ctx.y);
          ctx.y += lines.length * 4.5;
        });
      }
      ctx.y += 2.5;
    });
  }

  if ((data.education || []).length > 0) {
    addSection("Education");
    data.education!.forEach(edu => {
      const dateRange = formatDateRangePdf(edu.startDate, edu.endDate) || edu.year || "";
      ctx.y = checkY(ctx.y, 12);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(edu.degree, ctx.margin, ctx.y);

      if (dateRange) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        doc.text(dateRange, ctx.pageWidth - ctx.margin - doc.getTextWidth(dateRange), ctx.y);
        doc.setTextColor(0);
      }
      ctx.y += 4.5;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text(edu.school, ctx.margin, ctx.y);
      ctx.y += 6.5;
    });
  }

  if ((data.skills || []).length > 0) {
    addSection("Skills");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    let curX = ctx.margin;
    let curY = ctx.y;
    data.skills!.forEach(s => {
      const w = doc.getTextWidth(s) + 6;
      if (curX + w > ctx.pageWidth - ctx.margin) {
        curX = ctx.margin;
        curY += 6.5;
      }
      curY = checkY(curY, 5.5);
      doc.setFillColor(253, 246, 240); // #fdf6f0
      doc.setDrawColor(251, 230, 213); // #fbe6d5
      doc.setLineWidth(0.3);
      doc.roundedRect(curX, curY - 3.5, w, 5, 1, 1, "FD");
      doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.text(s, curX + 3, curY);
      curX += w + 2;
    });
    ctx.y = curY + 6;
    doc.setTextColor(0);
  }

  if ((data.languages || []).length > 0) {
    addSection("Languages");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    data.languages!.forEach(l => {
      ctx.y = checkY(ctx.y, 5);
      doc.setFont("helvetica", "bold");
      doc.text(l.name, ctx.margin, ctx.y);
      doc.setFont("helvetica", "normal");
      doc.text(`: ${l.proficiency || "Fluent"}`, ctx.margin + doc.getTextWidth(l.name), ctx.y);
      ctx.y += 5;
    });
  }

  (data.customSections || []).filter(c => c.title && c.items?.length).forEach(sec => {
    addSection(sec.title);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    sec.items.forEach(item => {
      const lines = doc.splitTextToSize(`•  ${item}`, ctx.maxWidth - 4);
      ctx.y = checkY(ctx.y, lines.length * 4.5);
      doc.text(lines, ctx.margin + 2, ctx.y);
      ctx.y += lines.length * 4.5;
    });
  });
}

async function renderCreativeLucia(doc: jsPDF, data: ResumeData, title: string, photoData?: string | null) {
  const ctx: PdfContext = { doc, y: 38, margin: 15, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  const leftColWidth = 108;
  const rightColWidth = 66;
  ctx.maxWidth = leftColWidth;
  const pi = data.personalInfo || {};
  const primaryRgb = { r: 142, g: 68, b: 173 }; // Purple #8e44ad

  // Centered/left aligned header info
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.text(pi.fullName || title || "Lucía Navarro Martín", ctx.margin, 20);

  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(pi.title || "Director of Strategic Planning", ctx.margin, 25);

  const contacts: string[] = [];
  if (pi.location) contacts.push(pi.location);
  if (pi.email) contacts.push(pi.email);
  if (pi.phone) contacts.push(pi.phone);
  if (pi.linkedin) contacts.push(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''));
  if (contacts.length) {
    doc.setFont("times", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100);
    doc.text(contacts.join("   |   "), ctx.margin, 30);
  }
  doc.setTextColor(0);

  if (photoData) {
    addCircularPhoto(doc, photoData, ctx.pageWidth - 26, 22, 11);
  }

  let leftY = ctx.y;
  let rightY = ctx.y;
  const pageBottom = doc.internal.pageSize.getHeight() - 12;
  const checkY = (y: number, needed: number): number => {
    if (y + needed > pageBottom) {
      doc.addPage();
      return 20;
    }
    return y;
  };

  const addColumnHeader = (label: string, xPos: number, currColY: number, colWidth: number): number => {
    const yVal = checkY(currColY, 14);
    // Draw thin double borders around headers
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(0.4);
    doc.line(xPos, yVal, xPos + colWidth, yVal);
    
    doc.setFont("times", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    const txtUpper = label.toUpperCase();
    doc.text(txtUpper, xPos + (colWidth - doc.getTextWidth(txtUpper)) / 2, yVal + 4.5);
    
    doc.line(xPos, yVal + 6.5, xPos + colWidth, yVal + 6.5);
    doc.setTextColor(0);
    return yVal + 11;
  };

  // Left Column (X=15, Width=108)
  const leftX = ctx.margin;
  
  if (data.summary) {
    leftY = addColumnHeader("Summary", leftX, leftY, leftColWidth);
    doc.setFont("times", "normal");
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(data.summary, leftColWidth);
    lines.forEach(line => {
      leftY = checkY(leftY, 4.5);
      doc.text(line, leftX, leftY);
      leftY += 4.5;
    });
    leftY += 3;
  }

  if ((data.experience || []).length > 0) {
    leftY = addColumnHeader("Experience", leftX, leftY, leftColWidth);
    data.experience!.forEach(exp => {
      const dateRange = formatDateRangePdf(exp.startDate, exp.endDate);
      leftY = checkY(leftY, 12);
      
      doc.setFont("times", "bold");
      doc.setFontSize(10);
      doc.text(exp.title, leftX, leftY);
      
      if (dateRange) {
        doc.setFont("times", "normal");
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.text(dateRange, leftX + leftColWidth - doc.getTextWidth(dateRange), leftY);
        doc.setTextColor(0);
      }
      leftY += 4;
      
      doc.setFont("times", "italic");
      doc.setFontSize(9);
      doc.text(`${exp.company} | ${exp.location || ""}`, leftX, leftY);
      leftY += 5;

      doc.setFont("times", "normal");
      doc.setFontSize(9);
      if (exp.bullets?.length) {
        exp.bullets.forEach(b => {
          const lines = doc.splitTextToSize(`• ${b}`, leftColWidth - 2);
          leftY = checkY(leftY, lines.length * 4.2);
          doc.text(lines, leftX + 2, leftY);
          leftY += lines.length * 4.2;
        });
      }
      leftY += 2.5;
    });
  }

  // Right Column (X=133, Width=66)
  const rightX = ctx.margin + leftColWidth + 10;

  if ((data.education || []).length > 0) {
    rightY = addColumnHeader("Education", rightX, rightY, rightColWidth);
    data.education!.forEach(edu => {
      const dateRange = formatDateRangePdf(edu.startDate, edu.endDate) || edu.year || "";
      rightY = checkY(rightY, 12);
      
      doc.setFont("times", "bold");
      doc.setFontSize(9.5);
      doc.text(edu.degree, rightX, rightY);
      rightY += 4;
      
      doc.setFont("times", "italic");
      doc.setFontSize(8.5);
      doc.text(edu.school, rightX, rightY);
      rightY += 4;

      if (dateRange) {
        doc.setFont("times", "normal");
        doc.setFontSize(8);
        doc.text(dateRange, rightX, rightY);
        rightY += 4.5;
      }
    });
  }

  if ((data.skills || []).length > 0) {
    rightY = addColumnHeader("Skills", rightX, rightY, rightColWidth);
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    data.skills!.forEach(s => {
      rightY = checkY(rightY, 5);
      // Draw vertical bullet bar
      doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.rect(rightX, rightY - 3, 1.5, 4.5, "F");
      doc.text(s, rightX + 4, rightY);
      rightY += 5;
    });
  }

  if ((data.languages || []).length > 0) {
    rightY = addColumnHeader("Languages", rightX, rightY, rightColWidth);
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    data.languages!.forEach(l => {
      rightY = checkY(rightY, 5);
      doc.setFont("times", "bold");
      doc.text(l.name, rightX, rightY);
      doc.setFont("times", "normal");
      doc.text(` (${l.proficiency || ""})`, rightX + doc.getTextWidth(l.name), rightY);
      rightY += 5;
    });
  }

  const custom = (data.customSections || []).filter(c => c.title && c.items?.length);
  custom.forEach(sec => {
    const isRight = sec.title.toLowerCase().includes("cert") || sec.title.toLowerCase().includes("award") || sec.title.toLowerCase().includes("interest");
    if (isRight) {
      rightY = addColumnHeader(sec.title, rightX, rightY, rightColWidth);
      doc.setFont("times", "normal");
      doc.setFontSize(8.5);
      sec.items.forEach(item => {
        rightY = checkY(rightY, 5);
        doc.text(`• ${item}`, rightX, rightY);
        rightY += 5;
      });
    } else {
      leftY = addColumnHeader(sec.title, leftX, leftY, leftColWidth);
      doc.setFont("times", "normal");
      doc.setFontSize(9);
      sec.items.forEach(item => {
        const lines = doc.splitTextToSize(`• ${item}`, leftColWidth - 2);
        leftY = checkY(leftY, lines.length * 4.2);
        doc.text(lines, leftX + 2, leftY);
        leftY += lines.length * 4.2;
      });
    }
  });
}

async function renderCreativeAnna(doc: jsPDF, data: ResumeData, title: string, photoData?: string | null) {
  const ctx: PdfContext = { doc, y: 15, margin: 15, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};
  const lavenderRgb = { r: 245, g: 243, b: 255 }; // Light lavender #f5f3ff
  const primaryRgb = { r: 124, g: 58, b: 237 }; // Violet #7c3aed

  // 1. Centered header banner block
  let bannerHeight = 35;
  if (photoData) {
    bannerHeight = 54;
  }
  doc.setFillColor(lavenderRgb.r, lavenderRgb.g, lavenderRgb.b);
  doc.rect(0, 0, ctx.pageWidth, bannerHeight, "F");
  
  doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.setLineWidth(0.6);
  doc.line(0, bannerHeight, ctx.pageWidth, bannerHeight);

  let currentY = 12;
  if (photoData) {
    addCircularPhoto(doc, photoData, ctx.pageWidth / 2, currentY + 11, 11, lavenderRgb);
    currentY += 26;
  }

  // Centered name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  const name = pi.fullName || title || "Anna Field";
  doc.text(name, (ctx.pageWidth - doc.getTextWidth(name)) / 2, currentY);
  currentY += 5;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(80, 80, 80);
  const pTitle = (pi.title || "Junior Project Manager").toUpperCase();
  doc.text(pTitle, (ctx.pageWidth - doc.getTextWidth(pTitle)) / 2, currentY);
  currentY += 5.5;

  // Centered contact grid
  const contacts: string[] = [];
  if (pi.location) contacts.push(pi.location);
  if (pi.email) contacts.push(pi.email);
  if (pi.phone) contacts.push(pi.phone);
  if (pi.linkedin) contacts.push(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''));
  if (contacts.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    const contactStr = contacts.join("   •   ");
    doc.text(contactStr, (ctx.pageWidth - doc.getTextWidth(contactStr)) / 2, currentY);
  }
  doc.setTextColor(0);
  ctx.y = bannerHeight + 10;

  const addSection = (label: string) => {
    ctx.y = checkY(ctx.y, 16);
    ctx.y += 4;
    
    const txt = label.toUpperCase();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    const textW = doc.getTextWidth(txt);
    const blockW = textW + 16;
    const blockX = (ctx.pageWidth - blockW) / 2;
    
    doc.setFillColor(lavenderRgb.r, lavenderRgb.g, lavenderRgb.b);
    doc.roundedRect(blockX, ctx.y - 4.5, blockW, 7.5, 1.5, 1.5, "F");
    
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(0.5);
    doc.line(blockX + 2, ctx.y + 3, blockX + blockW - 2, ctx.y + 3);
    
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text(txt, blockX + 8, ctx.y + 1);
    doc.setTextColor(0);
    ctx.y += 8;
  };

  // Sections
  if (data.summary) {
    addSection("Profile");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(data.summary, ctx.maxWidth - 10);
    lines.forEach(line => {
      ctx.y = checkY(ctx.y, 4.5);
      doc.text(line, (ctx.pageWidth - doc.getTextWidth(line)) / 2, ctx.y);
      ctx.y += 4.5;
    });
    ctx.y += 2;
  }

  if ((data.experience || []).length > 0) {
    addSection("Experience");
    data.experience!.forEach(exp => {
      const dateRange = formatDateRangePdf(exp.startDate, exp.endDate);
      ctx.y = checkY(ctx.y, 14);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`${exp.title} — ${exp.company}`, ctx.margin, ctx.y);

      if (dateRange) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        doc.text(dateRange, ctx.pageWidth - ctx.margin - doc.getTextWidth(dateRange), ctx.y);
        doc.setTextColor(0);
      }
      ctx.y += 4.5;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text(exp.location || "", ctx.margin, ctx.y);
      ctx.y += 5.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      if (exp.bullets?.length) {
        exp.bullets.forEach(b => {
          const lines = doc.splitTextToSize(`•  ${b}`, ctx.maxWidth - 4);
          ctx.y = checkY(ctx.y, lines.length * 4.5);
          doc.text(lines, ctx.margin + 2, ctx.y);
          ctx.y += lines.length * 4.5;
        });
      }
      ctx.y += 2.5;
    });
  }

  if ((data.education || []).length > 0) {
    addSection("Education");
    data.education!.forEach(edu => {
      const dateRange = formatDateRangePdf(edu.startDate, edu.endDate) || edu.year || "";
      ctx.y = checkY(ctx.y, 12);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`${edu.degree} — ${edu.school}`, ctx.margin, ctx.y);

      if (dateRange) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        doc.text(dateRange, ctx.pageWidth - ctx.margin - doc.getTextWidth(dateRange), ctx.y);
        doc.setTextColor(0);
      }
      ctx.y += 7.5;
    });
  }

  if ((data.skills || []).length > 0) {
    addSection("Skills");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    
    let curY = ctx.y;
    let rowItems: string[] = [];
    let rowWidth = 0;
    
    const flushRow = (items: string[]) => {
      const totalRowW = items.reduce((acc, it) => acc + doc.getTextWidth(it) + 12 + 4, 0) - 4;
      let startX = (ctx.pageWidth - totalRowW) / 2;
      items.forEach(it => {
        const itW = doc.getTextWidth(it) + 12;
        doc.setFillColor(lavenderRgb.r, lavenderRgb.g, lavenderRgb.b);
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.roundedRect(startX, curY - 3.5, itW, 5.5, 1, 1, "F");
        doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        doc.text(it, startX + 6, curY);
        startX += itW + 4;
      });
      doc.setTextColor(0);
    };

    data.skills!.forEach(s => {
      const itemW = doc.getTextWidth(s) + 12;
      if (rowWidth + itemW + 4 > ctx.maxWidth) {
        curY = checkY(curY, 7);
        flushRow(rowItems);
        rowItems = [s];
        rowWidth = itemW;
        curY += 7;
      } else {
        rowItems.push(s);
        rowWidth += itemW + 4;
      }
    });
    if (rowItems.length > 0) {
      curY = checkY(curY, 7);
      flushRow(rowItems);
      curY += 7;
    }
    ctx.y = curY;
  }

  if ((data.languages || []).length > 0) {
    addSection("Languages");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    let langList: string[] = [];
    data.languages!.forEach(l => {
      langList.push(`${l.name} (${l.proficiency || "Fluent"})`);
    });
    const langStr = langList.join("     |     ");
    ctx.y = checkY(ctx.y, 5);
    doc.text(langStr, (ctx.pageWidth - doc.getTextWidth(langStr)) / 2, ctx.y);
    ctx.y += 6;
  }

  (data.customSections || []).filter(c => c.title && c.items?.length).forEach(sec => {
    addSection(sec.title);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    sec.items.forEach(item => {
      const lines = doc.splitTextToSize(item, ctx.maxWidth - 20);
      lines.forEach(line => {
        ctx.y = checkY(ctx.y, 4.5);
        doc.text(line, (ctx.pageWidth - doc.getTextWidth(line)) / 2, ctx.y);
        ctx.y += 4.5;
      });
      ctx.y += 1.5;
    });
  });
}

async function renderCreativeAntoine(doc: jsPDF, data: ResumeData, title: string, photoData?: string | null) {
  const ctx: PdfContext = { doc, y: 44, margin: 15, pageWidth: doc.internal.pageSize.getWidth(), maxWidth: 0 };
  const leftColWidth = 108;
  const rightColWidth = 66;
  ctx.maxWidth = leftColWidth;
  const pi = data.personalInfo || {};
  const lightBlueRgb = { r: 224, g: 242, b: 254 }; // Light blue #e0f2fe
  const primaryRgb = { r: 2, g: 132, b: 199 }; // Blue #0284c7

  // 1. Full-width header banner
  doc.setFillColor(lightBlueRgb.r, lightBlueRgb.g, lightBlueRgb.b);
  doc.rect(0, 0, ctx.pageWidth, 38, "F");

  doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.setLineWidth(0.8);
  doc.line(0, 38, ctx.pageWidth, 38);

  // Name & Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // Dark slate #0f172a
  doc.text(pi.fullName || title || "Antoine Delorme", ctx.margin, 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text((pi.title || "Consulting Director").toUpperCase(), ctx.margin, 24);

  // Contact grid inside banner: 2 columns
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  
  let contactX1 = ctx.margin;
  let contactX2 = 110;
  let contactY1 = 29.5;
  let contactY2 = 29.5;

  if (pi.email) {
    doc.text(pi.email, contactX1, contactY1);
    contactY1 += 4;
  }
  if (pi.phone) {
    doc.text(pi.phone, contactX1, contactY1);
  }
  if (pi.location) {
    doc.text(pi.location, contactX2, contactY2);
    contactY2 += 4;
  }
  if (pi.linkedin) {
    doc.text(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''), contactX2, contactY2);
  }
  doc.setTextColor(0);

  // Photo
  if (photoData) {
    addCircularPhoto(doc, photoData, ctx.pageWidth - 26, 20, 11, lightBlueRgb);
  }

  let leftY = ctx.y;
  let rightY = ctx.y;
  const pageBottom = doc.internal.pageSize.getHeight() - 12;
  const checkY = (y: number, needed: number): number => {
    if (y + needed > pageBottom) {
      doc.addPage();
      return 20;
    }
    return y;
  };

  const addColumnHeader = (label: string, xPos: number, currColY: number, colWidth: number): number => {
    const yVal = checkY(currColY, 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text(label.toUpperCase(), xPos, yVal);
    
    // Draw thin blue line
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(0.6);
    doc.line(xPos, yVal + 1.5, xPos + colWidth, yVal + 1.5);
    doc.setTextColor(0);
    return yVal + 7;
  };

  // Left Column
  const leftX = ctx.margin;
  if (data.summary) {
    leftY = addColumnHeader("Summary", leftX, leftY, leftColWidth);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(data.summary, leftColWidth);
    lines.forEach(line => {
      leftY = checkY(leftY, 4.5);
      doc.text(line, leftX, leftY);
      leftY += 4.5;
    });
    leftY += 3;
  }

  if ((data.experience || []).length > 0) {
    leftY = addColumnHeader("Experience", leftX, leftY, leftColWidth);
    data.experience!.forEach(exp => {
      const dateRange = formatDateRangePdf(exp.startDate, exp.endDate);
      leftY = checkY(leftY, 12);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(exp.title, leftX, leftY);

      if (dateRange) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.text(dateRange, leftX + leftColWidth - doc.getTextWidth(dateRange), leftY);
        doc.setTextColor(0);
      }
      leftY += 4;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text(`${exp.company} | ${exp.location || ""}`, leftX, leftY);
      leftY += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      if (exp.bullets?.length) {
        exp.bullets.forEach(b => {
          const lines = doc.splitTextToSize(`• ${b}`, leftColWidth - 2);
          leftY = checkY(leftY, lines.length * 4.2);
          doc.text(lines, leftX + 2, leftY);
          leftY += lines.length * 4.2;
        });
      }
      leftY += 2.5;
    });
  }

  // Right Column
  const rightX = ctx.margin + leftColWidth + 10;

  if ((data.education || []).length > 0) {
    rightY = addColumnHeader("Education", rightX, rightY, rightColWidth);
    data.education!.forEach(edu => {
      const dateRange = formatDateRangePdf(edu.startDate, edu.endDate) || edu.year || "";
      rightY = checkY(rightY, 12);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(edu.degree, rightX, rightY);
      rightY += 4;
      
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.text(edu.school, rightX, rightY);
      rightY += 4;

      if (dateRange) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(dateRange, rightX, rightY);
        rightY += 4.5;
      }
    });
  }

  if ((data.skills || []).length > 0) {
    rightY = addColumnHeader("Skills", rightX, rightY, rightColWidth);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    let curX = rightX;
    let curY = rightY;
    data.skills!.forEach(s => {
      const w = doc.getTextWidth(s) + 6;
      if (curX + w > rightX + rightColWidth) {
        curX = rightX;
        curY += 6;
      }
      curY = checkY(curY, 5);
      doc.setFillColor(240, 249, 255); // #f0f9ff
      doc.setDrawColor(186, 230, 253); // #bae6fd
      doc.setLineWidth(0.2);
      doc.roundedRect(curX, curY - 3.5, w, 5, 0.8, 0.8, "FD");
      doc.setTextColor(3, 105, 161); // #0369a1
      doc.text(s, curX + 3, curY);
      curX += w + 2;
    });
    rightY = curY + 6;
    doc.setTextColor(0);
  }

  if ((data.languages || []).length > 0) {
    rightY = addColumnHeader("Languages", rightX, rightY, rightColWidth);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    data.languages!.forEach(l => {
      rightY = checkY(rightY, 5);
      doc.setFont("helvetica", "bold");
      doc.text(l.name, rightX, rightY);
      doc.setFont("helvetica", "normal");
      doc.text(` (${l.proficiency || ""})`, rightX + doc.getTextWidth(l.name), rightY);
      rightY += 5;
    });
  }

  const custom = (data.customSections || []).filter(c => c.title && c.items?.length);
  custom.forEach(sec => {
    const isRight = sec.title.toLowerCase().includes("cert") || sec.title.toLowerCase().includes("award") || sec.title.toLowerCase().includes("interest");
    if (isRight) {
      rightY = addColumnHeader(sec.title, rightX, rightY, rightColWidth);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      sec.items.forEach(item => {
        rightY = checkY(rightY, 5);
        doc.text(`• ${item}`, rightX, rightY);
        rightY += 5;
      });
    } else {
      leftY = addColumnHeader(sec.title, leftX, leftY, leftColWidth);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      sec.items.forEach(item => {
        const lines = doc.splitTextToSize(`• ${item}`, leftColWidth - 2);
        leftY = checkY(leftY, lines.length * 4.2);
        doc.text(lines, leftX + 2, leftY);
        leftY += lines.length * 4.2;
      });
    }
  });
}


