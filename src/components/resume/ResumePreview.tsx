import { useEffect, useState, useRef, useCallback } from "react";
import { type TemplateId } from "./pdfTemplates";
import type { ResumeData } from "./types";
import { Loader2 } from "lucide-react";

const PAGE_HEIGHT = 842; // A4 proportional height at 595px width

interface ResumePreviewProps {
  resumeData: ResumeData;
  title: string;
  templateId: TemplateId;
}

export default function ResumePreview({ resumeData, title, templateId }: ResumePreviewProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const measureRef = useRef<HTMLDivElement>(null);

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

  // Measure content height and calculate page count
  const updatePageCount = useCallback(() => {
    if (measureRef.current) {
      const totalHeight = measureRef.current.scrollHeight;
      setPageCount(Math.max(1, Math.ceil(totalHeight / PAGE_HEIGHT)));
    }
  }, []);

  useEffect(() => {
    // Re-measure after HTML updates
    const timer = setTimeout(updatePageCount, 100);
    return () => clearTimeout(timer);
  }, [pages, updatePageCount]);

  return (
    <div className="h-full w-full flex flex-col rounded-lg border bg-muted/30 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card shrink-0">
        <span className="text-sm font-medium text-muted-foreground">Live Preview</span>
        <div className="flex items-center gap-2">
          {pageCount > 1 && (
            <span className="text-xs text-muted-foreground">{pageCount} pages</span>
          )}
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col items-center gap-8 bg-muted/50">
        {pages.length > 0 ? (
          <>
            {/* Hidden measurement container - must match visible page width */}
            <div
              ref={measureRef}
              className="pointer-events-none"
              style={{ position: "fixed", visibility: "hidden", width: 595, left: -9999, top: 0 }}
              dangerouslySetInnerHTML={{ __html: pages[0] }}
            />
            {/* Visible page slices */}
            {Array.from({ length: pageCount }, (_, i) => (
              <div key={i} className="w-full flex flex-col items-center">
                <div className="w-full max-w-[595px] text-[10px] text-muted-foreground mb-1 text-right">
                  Page {i + 1} of {pageCount}
                </div>
                <div
                  className="bg-white rounded border"
                  style={{
                    width: 595,
                    height: PAGE_HEIGHT,
                    overflow: "hidden",
                    position: "relative",
                    boxShadow: "0 4px 20px -4px rgba(0,0,0,0.15)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -(i * PAGE_HEIGHT),
                      left: 0,
                      width: 595,
                    }}
                    dangerouslySetInnerHTML={{ __html: pages[0] }}
                  />
                </div>
              </div>
            ))}
          </>
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
  if (templateId === "sidebar") return [buildSidebarHTML(data, title)];
  if (templateId === "twocolumn") return [buildTwoColumnHTML(data, title)];

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
    const dateStr = formatDateRange(exp.startDate, exp.endDate);
    return `<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;align-items:baseline"><div><strong style="font-size:10px">${escapeHtml(exp.title)}</strong><span style="font-size:10px"> — ${escapeHtml(exp.company)}</span></div>${dateStr ? `<span style="font-size:9px;color:#666;white-space:nowrap">${escapeHtml(dateStr)}</span>` : ""}</div>${bulletsHtml}</div>`;
  }).join("");

  const educationHtml = (data.education || []).map((edu) => {
    const dateStr = formatDateRange(edu.startDate, edu.endDate) || (edu.year ? edu.year : "");
    return `<div style="display:flex;justify-content:space-between;align-items:baseline;margin:2px 0"><div><strong style="font-size:10px">${escapeHtml(edu.degree)}</strong> — ${escapeHtml(edu.school)}</div>${dateStr ? `<span style="font-size:9px;color:#666;white-space:nowrap">${escapeHtml(dateStr)}</span>` : ""}</div>`;
  }).join("");

  const skillsText = (data.skills || []).map(escapeHtml).join("  •  ");

  const customHtml = (data.customSections || []).filter(s => s.title).map((s) => {
    const items = s.items.filter(Boolean).map(item => `<p style="font-size:10px;margin:1px 0 1px 8px">• ${escapeHtml(item)}</p>`).join("");
    return `${sectionHeader(s.title, templateId)}${items}`;
  }).join("");

  const languagesHtml = (data.languages || []).filter(l => l.name).map(l => 
    `<span style="font-size:10px">${escapeHtml(l.name)}${l.proficiency ? ` (${escapeHtml(l.proficiency)})` : ""}</span>`
  ).join("  •  ");


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
      ${languagesHtml ? `${sectionHeader("Languages", templateId)}<p style="font-size:10px;margin:0">${languagesHtml}</p>` : ""}
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
    case "creative":
      return `<div style="margin:12px 0 6px"><span style="font-size:12px;font-weight:700;color:#dc3545;text-transform:uppercase;letter-spacing:0.5px">${escapeHtml(label)}</span><div style="width:30px;height:2px;background:#dc3545;margin-top:2px"></div></div>`;
    case "compact":
      return `<div style="margin:6px 0 4px;border-bottom:1px solid #bbb;padding-bottom:1px"><span style="font-size:9px;font-weight:700;text-transform:uppercase">${escapeHtml(label)}</span></div>`;
    case "professional":
      return `<div style="margin:12px 0 6px"><span style="font-size:11px;font-weight:700;color:#192a56;text-transform:uppercase">${escapeHtml(label)}</span><div style="border-bottom:2px solid #192a56;margin-top:2px"></div></div>`;
    case "ats":
      return `<div style="margin:10px 0 5px"><span style="font-size:11px;font-weight:700;text-transform:uppercase">${escapeHtml(label)}</span><div style="border-bottom:1px solid #000;margin-top:2px"></div></div>`;
    case "simple":
      return `<div style="margin:12px 0 6px"><span style="font-size:11px;font-weight:700">${escapeHtml(label)}</span><div style="border-bottom:1px solid #ccc;margin-top:2px"></div></div>`;
    case "elegant":
      return `<div style="margin:12px 0 6px"><span style="font-size:10px;font-weight:700;color:#b49146;text-transform:uppercase;letter-spacing:1px">${escapeHtml(label)}</span><div style="border-bottom:1px solid #b49146;margin-top:2px"></div></div>`;
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
    case "creative":
      return {
        container: base,
        headerBefore: `<div style="width:40px;height:3px;background:#dc3545;margin-bottom:6px"></div>`,
        headerAfter: "",
        nameStyle: "font-size:24px;font-weight:700;color:#dc3545;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px",
        contactStyle: "font-size:9px;color:#555;margin:0 0 2px",
        linkStyle: "font-size:9px;color:#dc3545;margin:0 0 4px",
      };
    case "compact":
      return {
        container: base + "padding:16px 14px;",
        headerBefore: "",
        headerAfter: `<div style="border-bottom:1px solid #000;margin:4px 0"></div>`,
        nameStyle: "font-size:14px;font-weight:700;text-align:center;margin-bottom:2px",
        contactStyle: "font-size:7px;color:#555;margin:0;text-align:center",
        linkStyle: "font-size:7px;color:#0066cc;margin:0 0 2px;text-align:center",
      };
    case "professional":
      return {
        container: base,
        headerBefore: `<div style="height:6px;background:#192a56;margin:-28px -24px 16px"></div>`,
        headerAfter: `<div style="border-bottom:2px solid #192a56;margin:4px 0 8px"></div>`,
        nameStyle: "font-size:22px;font-weight:700;color:#192a56;margin-bottom:3px",
        contactStyle: "font-size:9px;color:#555;margin:0 0 2px",
        linkStyle: "font-size:9px;color:#192a56;margin:0 0 4px",
      };
    case "ats":
      return {
        container: base + "padding:24px 18px;",
        headerBefore: "",
        headerAfter: `<div style="border-bottom:1px solid #000;margin:4px 0 6px"></div>`,
        nameStyle: "font-size:16px;font-weight:700;margin-bottom:3px",
        contactStyle: "font-size:9px;color:#333;margin:0 0 2px",
        linkStyle: "font-size:9px;color:#333;margin:0 0 2px",
      };
    case "simple":
      return {
        container: base + "padding:28px 26px;",
        headerBefore: "",
        headerAfter: "",
        nameStyle: "font-size:20px;font-weight:700;text-align:center;margin-bottom:4px",
        contactStyle: "font-size:9px;color:#555;margin:0 0 2px;text-align:center",
        linkStyle: "font-size:9px;color:#0066cc;margin:0 0 6px;text-align:center",
      };
    case "elegant":
      return {
        container: base,
        headerBefore: `<div style="border-top:2px solid #b49146;margin:-28px -24px 0;padding:20px 24px 0">`,
        headerAfter: `<div style="border-bottom:1px solid #b49146;margin:6px 0 8px"></div></div>`,
        nameStyle: "font-size:20px;font-weight:700;color:#3c3c3c;text-align:center;margin-bottom:4px",
        contactStyle: "font-size:9px;color:#666;margin:0 0 2px;text-align:center",
        linkStyle: "font-size:9px;color:#b49146;margin:0 0 2px;text-align:center",
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

function buildSidebarHTML(data: ResumeData, title: string): string {
  const pi = data.personalInfo || {};
  const name = pi.fullName || title || "Resume";
  const contactItems = [pi.email, pi.phone, pi.location, pi.linkedin, pi.portfolio].filter(Boolean);
  const skillsHtml = (data.skills || []).map(s => `<p style="font-size:9px;margin:1px 0;color:#ddd">• ${escapeHtml(s)}</p>`).join("");

  const experienceHtml = (data.experience || []).map((exp) => {
    const bulletsHtml = exp.bullets?.length
      ? `<ul style="margin:2px 0 0 16px;padding:0;list-style:disc">${exp.bullets.map((b) => `<li style="margin-bottom:2px;font-size:10px;line-height:1.5">${escapeHtml(b)}</li>`).join("")}</ul>`
      : exp.description ? `<p style="font-size:10px;margin:2px 0 0;color:#444">${escapeHtml(exp.description)}</p>` : "";
    const dateStr = formatDateRange(exp.startDate, exp.endDate);
    return `<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;align-items:baseline"><div><strong style="font-size:10px">${escapeHtml(exp.title)}</strong><span style="font-size:10px"> — ${escapeHtml(exp.company)}</span></div>${dateStr ? `<span style="font-size:9px;color:#b4d2ff;white-space:nowrap">${escapeHtml(dateStr)}</span>` : ""}</div>${bulletsHtml}</div>`;
  }).join("");

  const educationHtml = (data.education || []).map((edu) => {
    const dateStr = formatDateRange(edu.startDate, edu.endDate) || (edu.year ? edu.year : "");
    return `<div style="display:flex;justify-content:space-between;align-items:baseline;margin:2px 0"><div><strong style="font-size:10px">${escapeHtml(edu.degree)}</strong> — ${escapeHtml(edu.school)}</div>${dateStr ? `<span style="font-size:9px;color:#666;white-space:nowrap">${escapeHtml(dateStr)}</span>` : ""}</div>`;
  }).join("");

  const customHtml = (data.customSections || []).filter(s => s.title).map((s) => {
    const items = s.items.filter(Boolean).map(item => `<p style="font-size:10px;margin:1px 0 1px 8px">• ${escapeHtml(item)}</p>`).join("");
    return `<div style="background:#1e3a5f;color:#fff;padding:3px 8px;margin:10px 0 6px"><span style="font-size:9px;font-weight:700;text-transform:uppercase">${escapeHtml(s.title)}</span></div>${items}`;
  }).join("");

  return `<div style="display:flex;font-family:Helvetica,Arial,sans-serif;min-height:100%;color:#222">
    <div style="width:35%;background:#1e3a5f;color:#fff;padding:20px 12px">
      <div style="font-size:13px;font-weight:700;margin-bottom:12px;word-break:break-word">${escapeHtml(name)}</div>
      ${contactItems.length ? `<div style="margin-bottom:10px"><p style="font-size:8px;font-weight:700;color:#b4d2ff;text-transform:uppercase;margin-bottom:4px">Contact</p>${contactItems.map(c => `<p style="font-size:8px;color:#ddd;margin:2px 0;word-break:break-all">${escapeHtml(c!)}</p>`).join("")}</div>` : ""}
      ${skillsHtml ? `<div><p style="font-size:8px;font-weight:700;color:#b4d2ff;text-transform:uppercase;margin-bottom:4px">Skills</p>${skillsHtml}</div>` : ""}
    </div>
    <div style="flex:1;padding:20px 16px">
      ${data.summary ? `<div style="background:#1e3a5f;color:#fff;padding:3px 8px;margin:0 0 6px"><span style="font-size:9px;font-weight:700;text-transform:uppercase">Summary</span></div><p style="font-size:10px;line-height:1.5;margin:0 0 8px">${escapeHtml(data.summary)}</p>` : ""}
      ${experienceHtml ? `<div style="background:#1e3a5f;color:#fff;padding:3px 8px;margin:8px 0 6px"><span style="font-size:9px;font-weight:700;text-transform:uppercase">Experience</span></div>${experienceHtml}` : ""}
      ${educationHtml ? `<div style="background:#1e3a5f;color:#fff;padding:3px 8px;margin:8px 0 6px"><span style="font-size:9px;font-weight:700;text-transform:uppercase">Education</span></div>${educationHtml}` : ""}
      ${customHtml}
    </div>
  </div>`;
}

function buildTwoColumnHTML(data: ResumeData, title: string): string {
  const pi = data.personalInfo || {};
  const name = pi.fullName || title || "Resume";
  const parts = [pi.email, pi.phone, pi.location].filter(Boolean);
  const linkParts = [pi.linkedin, pi.portfolio].filter(Boolean);

  const experienceHtml = (data.experience || []).map((exp) => {
    const bulletsHtml = exp.bullets?.length
      ? `<ul style="margin:2px 0 0 14px;padding:0;list-style:disc">${exp.bullets.map((b) => `<li style="margin-bottom:1px;font-size:9px;line-height:1.4">${escapeHtml(b)}</li>`).join("")}</ul>`
      : "";
    const dateStr = formatDateRange(exp.startDate, exp.endDate);
    return `<div style="margin-bottom:6px"><div style="display:flex;justify-content:space-between;align-items:baseline"><strong style="font-size:9px">${escapeHtml(exp.title)} — ${escapeHtml(exp.company)}</strong>${dateStr ? `<span style="font-size:8px;color:#666;white-space:nowrap">${escapeHtml(dateStr)}</span>` : ""}</div>${bulletsHtml}</div>`;
  }).join("");

  const skillsHtml = (data.skills || []).map(s => `<span style="font-size:9px">• ${escapeHtml(s)}</span>`).join("<br/>");
  const educationHtml = (data.education || []).map((edu) => {
    const dateStr = formatDateRange(edu.startDate, edu.endDate) || (edu.year ? edu.year : "");
    return `<p style="font-size:9px;margin:2px 0"><strong>${escapeHtml(edu.degree)}</strong><br/>${escapeHtml(edu.school)}${dateStr ? ` (${escapeHtml(dateStr)})` : ""}</p>`;
  }).join("");

  const customHtml = (data.customSections || []).filter(s => s.title).map((s) => {
    const items = s.items.filter(Boolean).map(item => `<p style="font-size:9px;margin:1px 0">• ${escapeHtml(item)}</p>`).join("");
    return `<div style="margin-top:6px"><span style="font-size:9px;font-weight:700;color:#2d3748;text-transform:uppercase">${escapeHtml(s.title)}</span><div style="border-bottom:1px solid #2d3748;margin:2px 0 4px"></div>${items}</div>`;
  }).join("");

  const sectionLabel = (l: string) => `<div style="margin-top:8px"><span style="font-size:9px;font-weight:700;color:#2d3748;text-transform:uppercase">${escapeHtml(l)}</span><div style="border-bottom:1px solid #2d3748;margin:2px 0 4px"></div></div>`;

  return `<div style="font-family:Helvetica,Arial,sans-serif;color:#222">
    <div style="background:#2d3748;padding:12px 16px;margin:-28px -24px 0;color:#fff">
      <div style="font-size:18px;font-weight:700">${escapeHtml(name)}</div>
      ${parts.length ? `<p style="font-size:8px;color:#ccc;margin:4px 0 0">${parts.join("  |  ")}</p>` : ""}
    </div>
    <div style="display:flex;gap:12px;padding:16px 16px 20px">
      <div style="flex:1.2">
        ${data.summary ? `${sectionLabel("Summary")}<p style="font-size:9px;line-height:1.5;margin:0">${escapeHtml(data.summary)}</p>` : ""}
        ${experienceHtml ? `${sectionLabel("Experience")}${experienceHtml}` : ""}
      </div>
      <div style="flex:0.8">
        ${skillsHtml ? `${sectionLabel("Skills")}${skillsHtml}` : ""}
        ${educationHtml ? `${sectionLabel("Education")}${educationHtml}` : ""}
        ${linkParts.length ? `${sectionLabel("Links")}${linkParts.map(l => `<p style="font-size:8px;color:#0066cc;margin:1px 0">${escapeHtml(l!)}</p>`).join("")}` : ""}
        ${customHtml}
      </div>
    </div>
  </div>`;
}
function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate && !endDate) return "";
  const parts = [startDate, endDate].filter(Boolean).join(" — ");
  return parts;
}
