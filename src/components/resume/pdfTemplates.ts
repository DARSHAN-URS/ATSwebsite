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

export type TemplateId = "classic" | "modern" | "minimal" | "executive" | "sidebar" | "twocolumn" | "creative" | "compact" | "professional" | "ats" | "simple" | "elegant" | "ivyleague" | "timeline" | "contemporary" | "polished" | "waterfall" | "vision" | "prism" | "midnight" | "ocean" | "forest" | "rose" | "sunset" | "monochrome" | "ruby" | "emerald" | "sapphire" | "amethyst" | "gold" | "slate" | "coral" | "ats-classic" | "ats-modern-pro" | "ats-skills-first" | "ats-experience" | "ats-fresher" | "ats-technical" | "ats-compact" | "ats-combination" | "ats-academic" | "ats-medical" | "ats-legal" | "ats-finance" | "ats-sales" | "ats-marketing" | "ats-remote" | "ats-executive-pro" | "ats-freelance" | "ats-consultant";

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

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  { id: "classic", name: "Classic", description: "Traditional layout with serif-style headers and clean dividers", preview: "📄", category: "Traditional" },
  { id: "modern", name: "Modern", description: "Bold accent bar with contemporary spacing and styling", preview: "🎨", category: "Modern" },
  { id: "minimal", name: "Minimal", description: "Ultra-clean with generous whitespace and subtle typography", preview: "✨", category: "Simple" },
  { id: "executive", name: "Executive", description: "Professional dark header block with structured sections", preview: "💼", category: "Professional", isPremium: true },
  { id: "sidebar", name: "Sidebar", description: "Two-column layout with a colored sidebar for contact details", preview: "📊", category: "Modern" },
  { id: "twocolumn", name: "Two Column", description: "Balanced two-column design for maximum content density", preview: "📰", category: "Professional" },
  { id: "creative", name: "Creative", description: "Bold headings with accent colors and modern typography", preview: "🎯", category: "Creative", isPremium: true },
  { id: "compact", name: "Compact", description: "Dense single-column layout optimized for ATS scanners", preview: "📋", category: "ATS" },
  { id: "professional", name: "Professional", description: "Polished corporate design with navy accents and refined typography", preview: "🏢", category: "Professional" },
  { id: "ats", name: "ATS Optimized", description: "Plain text-friendly format designed to pass all ATS systems", preview: "🤖", category: "ATS" },
  { id: "simple", name: "Simple", description: "Clean and timeless with a classic balanced structure", preview: "📝", category: "Simple" },
  { id: "elegant", name: "Elegant", description: "Sophisticated design with subtle gold accents and fine lines", preview: "👔", category: "Traditional" },
  { id: "ivyleague", name: "Ivy League", description: "Classic recruiter-approved format with clean lines and refined structure", preview: "🎓", category: "Traditional" },
  { id: "timeline", name: "Timeline", description: "Visual timeline element showing career progression clearly", preview: "📅", category: "Modern", isPremium: true },
  { id: "contemporary", name: "Contemporary", description: "Modern layout with profile photo support and bold design", preview: "📸", category: "Creative" },
  { id: "polished", name: "Polished", description: "Refined sidebar with warm accent colors for a premium feel", preview: "💎", category: "Professional", isPremium: true },
  // Config-driven ATS templates
  ...ATS_TEMPLATES.map(t => ({
    id: t.id as TemplateId,
    name: t.name,
    description: t.description,
    preview: "📋",
    category: "ATS",
    isBestForATS: t.isBestForATS,
    recommendedFor: t.recommendedFor,
  })),
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
function renderATSFromConfig(doc: jsPDF, data: ResumeData, title: string, config: ATSTemplateConfig) {
  const ctx: PdfContext = {
    doc, y: config.marginSize + 2,
    margin: config.marginSize,
    pageWidth: doc.internal.pageSize.getWidth(),
    maxWidth: 0,
  };
  ctx.maxWidth = ctx.pageWidth - ctx.margin * 2;
  const pi = data.personalInfo || {};

  // Name
  doc.setFontSize(config.nameFontSize);
  doc.setFont(config.fontFamily, "bold");
  doc.text(pi.fullName || title || "Resume", ctx.margin, ctx.y);
  ctx.y += config.nameFontSize * 0.35 + 2;

  // Contact line
  const contactParts: string[] = [];
  if (pi.email) contactParts.push(pi.email);
  if (pi.phone) contactParts.push(pi.phone);
  if (pi.location) contactParts.push(pi.location);
  if (contactParts.length) {
    doc.setFontSize(config.baseFontSize - 1);
    doc.setFont(config.fontFamily, "normal");
    doc.text(contactParts.join("  |  "), ctx.margin, ctx.y);
    ctx.y += config.lineSpacing;
  }
  const linkParts: string[] = [];
  if (pi.linkedin) linkParts.push(pi.linkedin);
  if (pi.portfolio) linkParts.push(pi.portfolio);
  if (linkParts.length) {
    doc.setFontSize(config.baseFontSize - 1);
    doc.setFont(config.fontFamily, "normal");
    doc.text(linkParts.join("  |  "), ctx.margin, ctx.y);
    ctx.y += config.lineSpacing;
  }

  // Divider under header
  doc.setDrawColor(0);
  doc.line(ctx.margin, ctx.y, ctx.pageWidth - ctx.margin, ctx.y);
  ctx.y += 4;

  // Section heading builder
  const addSection = (label: string) => {
    checkPageBreak(ctx, config.headingFontSize + 4);
    ctx.y += 4;
    doc.setFontSize(config.headingFontSize);
    doc.setFont(config.fontFamily, "bold");
    doc.text(label.toUpperCase(), ctx.margin, ctx.y);
    doc.setDrawColor(100);
    doc.line(ctx.margin, ctx.y + 1.5, ctx.pageWidth - ctx.margin, ctx.y + 1.5);
    ctx.y += config.headingFontSize * 0.4 + 3;
  };

  // Render sections in config order
  renderBodyOrdered(ctx, data, addSection, config);
}

/** renderBody with configurable section order */
function renderBodyOrdered(ctx: PdfContext, data: ResumeData, addSection: (t: string) => void, config: ATSTemplateConfig) {
  const { doc } = ctx;
  const ls = config.lineSpacing;
  const fs = config.baseFontSize;

  const renderSummary = () => {
    if (!data.summary) return;
    addSection("Summary");
    doc.setFontSize(fs);
    doc.setFont(config.fontFamily, "normal");
    const lines = doc.splitTextToSize(data.summary, ctx.maxWidth);
    checkPageBreak(ctx, lines.length * ls);
    doc.text(lines, ctx.margin, ctx.y);
    ctx.y += lines.length * ls;
  };

  const renderSkills = () => {
    if (!(data.skills || []).length) return;
    addSection("Skills");
    doc.setFontSize(fs);
    doc.setFont(config.fontFamily, "normal");
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
    doc.setFontSize(fs);
    doc.setFont(config.fontFamily, "normal");
    const langText = langs.map(l => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ""}`).join("  •  ");
    const lines = doc.splitTextToSize(langText, ctx.maxWidth);
    checkPageBreak(ctx, lines.length * ls);
    doc.text(lines, ctx.margin, ctx.y);
    ctx.y += lines.length * ls;
  };

  const renderCustom = () => {
    (data.customSections || []).filter((s) => s.title).forEach((section) => {
      addSection(section.title);
      doc.setFontSize(fs);
      doc.setFont(config.fontFamily, "normal");
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
  const photoTemplates: string[] = ["contemporary", "sidebar", "polished", "waterfall", "ocean", "sunset", "amethyst", "emerald"];
  let photoData: string | null = null;
  if (pi.photoUrl && photoTemplates.includes(templateId)) {
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
    default: renderClassic(doc, data, title);
  }
  return doc;
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

