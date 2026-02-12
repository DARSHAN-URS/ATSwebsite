import { useEffect, useState, useRef } from "react";
import { type TemplateId } from "./pdfTemplates";
import type { ResumeData } from "./types";
import { Loader2 } from "lucide-react";

interface ResumePreviewProps {
  resumeData: ResumeData;
  title: string;
  templateId: TemplateId;
}

export default function ResumePreview({ resumeData, title, templateId }: ResumePreviewProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        const htmlPages = buildHTMLPreview(resumeData, title, templateId);
        setPages(htmlPages);
      } catch {
        // silently handle
      }
      setLoading(false);
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [resumeData, title, templateId]);

  return (
    <div className="h-full w-full flex flex-col rounded-lg border bg-muted/30 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card shrink-0">
        <span className="text-sm font-medium text-muted-foreground">Live Preview</span>
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col items-center gap-4 bg-muted/50">
        {pages.length > 0 ? (
          pages.map((html, i) => (
            <div
              key={i}
              className="bg-white shadow-md rounded w-full max-w-[595px] min-h-[842px] overflow-hidden"
              style={{ aspectRatio: "210/297" }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Generating preview…
          </div>
        )}
      </div>
    </div>
  );
}

// Build an HTML representation that mirrors the PDF templates
function buildHTMLPreview(data: ResumeData, title: string, templateId: TemplateId): string[] {
  const pi = data.personalInfo || {};
  const contactParts: string[] = [];
  if (pi.email) contactParts.push(pi.email);
  if (pi.phone) contactParts.push(pi.phone);
  if (pi.location) contactParts.push(pi.location);

  const linkParts: string[] = [];
  if (pi.linkedin) linkParts.push(pi.linkedin);
  if (pi.portfolio) linkParts.push(pi.portfolio);

  const name = pi.fullName || title || "Resume";

  const experienceHtml = (data.experience || []).map((exp) => {
    const bulletsHtml = exp.bullets?.length
      ? `<ul style="margin:2px 0 0 16px;padding:0;list-style:disc">${exp.bullets.map((b) => `<li style="margin-bottom:2px;font-size:10px;line-height:1.5">${escapeHtml(b)}</li>`).join("")}</ul>`
      : exp.description ? `<p style="font-size:10px;margin:2px 0 0;color:#444">${escapeHtml(exp.description)}</p>` : "";
    return `<div style="margin-bottom:8px"><strong style="font-size:10px">${escapeHtml(exp.title)}</strong><span style="font-size:10px"> — ${escapeHtml(exp.company)}</span>${bulletsHtml}</div>`;
  }).join("");

  const educationHtml = (data.education || []).map((edu) =>
    `<p style="font-size:10px;margin:2px 0"><strong>${escapeHtml(edu.degree)}</strong> — ${escapeHtml(edu.school)}${edu.year ? ` (${escapeHtml(edu.year)})` : ""}</p>`
  ).join("");

  const skillsText = (data.skills || []).map(escapeHtml).join("  •  ");

  const customHtml = (data.customSections || []).filter(s => s.title).map((s) => {
    const items = s.items.filter(Boolean).map(item => `<p style="font-size:10px;margin:1px 0 1px 8px">• ${escapeHtml(item)}</p>`).join("");
    return `${sectionHeader(s.title, templateId)}${items}`;
  }).join("");

  const styles = getTemplateStyles(templateId);

  const html = `
    <div style="${styles.container}">
      ${styles.headerBefore || ""}
      <div style="${styles.nameStyle}">${escapeHtml(name)}</div>
      ${contactParts.length ? `<p style="${styles.contactStyle}">${contactParts.join("  •  ")}</p>` : ""}
      ${linkParts.length ? `<p style="${styles.linkStyle}">${linkParts.join("  •  ")}</p>` : ""}
      ${styles.headerAfter || ""}
      ${data.summary ? `${sectionHeader("Summary", templateId)}<p style="font-size:10px;line-height:1.5;margin:0">${escapeHtml(data.summary)}</p>` : ""}
      ${skillsText ? `${sectionHeader("Skills", templateId)}<p style="font-size:10px;margin:0">${skillsText}</p>` : ""}
      ${experienceHtml ? `${sectionHeader("Experience", templateId)}${experienceHtml}` : ""}
      ${educationHtml ? `${sectionHeader("Education", templateId)}${educationHtml}` : ""}
      ${customHtml}
    </div>
  `;

  return [html];
}

function sectionHeader(label: string, templateId: TemplateId): string {
  switch (templateId) {
    case "modern":
      return `<div style="display:flex;align-items:center;gap:6px;margin:12px 0 6px"><div style="width:3px;height:14px;background:#2563eb;border-radius:1px"></div><span style="font-size:11px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:0.5px">${escapeHtml(label)}</span></div>`;
    case "minimal":
      return `<div style="margin:14px 0 5px"><span style="font-size:9px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px">${escapeHtml(label)}</span></div>`;
    case "executive":
      return `<div style="background:#1e1e1e;color:#fff;padding:3px 8px;margin:10px 0 6px;border-radius:2px"><span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">${escapeHtml(label)}</span></div>`;
    default: // classic
      return `<div style="border-bottom:1px solid #ccc;margin:12px 0 6px;padding-bottom:3px"><span style="font-size:11px;font-weight:700">${escapeHtml(label)}</span></div>`;
  }
}

function getTemplateStyles(templateId: TemplateId) {
  const base = "font-family:Helvetica,Arial,sans-serif;padding:28px 24px;color:#222;line-height:1.4;";

  switch (templateId) {
    case "modern":
      return {
        container: base,
        headerBefore: `<div style="height:4px;background:#2563eb;margin:-28px -24px 16px;border-radius:0"></div>`,
        headerAfter: "",
        nameStyle: "font-size:20px;font-weight:700;color:#2563eb;margin-bottom:3px",
        contactStyle: "font-size:9px;color:#555;margin:0 0 2px",
        linkStyle: "font-size:9px;color:#2563eb;margin:0 0 4px",
      };
    case "minimal":
      return {
        container: base + "padding:32px 28px;",
        headerBefore: "",
        headerAfter: "",
        nameStyle: "font-size:18px;font-weight:400;margin-bottom:4px",
        contactStyle: "font-size:9px;color:#555;margin:0 0 2px",
        linkStyle: "font-size:9px;color:#0066cc;margin:0 0 4px",
      };
    case "executive":
      return {
        container: base,
        headerBefore: `<div style="background:#1e1e1e;margin:-28px -24px 0;padding:16px 24px 12px">`,
        headerAfter: `</div><div style="height:10px"></div>`,
        nameStyle: "font-size:20px;font-weight:700;color:#fff;margin-bottom:4px",
        contactStyle: "font-size:8px;color:#c8c8c8;margin:0",
        linkStyle: "font-size:8px;color:#c8c8c8;margin:0",
      };
    default: // classic
      return {
        container: base,
        headerBefore: "",
        headerAfter: "",
        nameStyle: "font-size:20px;font-weight:700;margin-bottom:3px",
        contactStyle: "font-size:9px;color:#555;margin:0 0 2px",
        linkStyle: "font-size:9px;color:#0066cc;margin:0 0 4px",
      };
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
