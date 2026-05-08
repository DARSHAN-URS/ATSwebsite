import { useEffect, useState, useRef, useCallback } from "react";
import { type TemplateId } from "./pdfTemplates";
import type { ResumeData } from "./types";
import { getATSConfig, isATSTemplateId, type ATSTemplateConfig, type ATSSection } from "./atsTemplateConfig";
import { Loader2, FileText, ChevronRight, ChevronLeft } from "lucide-react";
import { resolvePhotoUrl } from "@/lib/storageUtils";
import { applyColorsToHTML } from "./resumeColorMap";
import { DEFAULT_COLORS, type ResumeColors } from "@/hooks/useResumeColors";
import { motion, AnimatePresence } from "framer-motion";

// Design canvas (A4 Proportions)
const PAGE_WIDTH = 794; // Higher resolution for better quality
const PAGE_HEIGHT = 1123; 

interface ResumePreviewProps {
  resumeData: ResumeData;
  title: string;
  templateId: TemplateId;
  colors?: ResumeColors;
}

export default function ResumePreview({ resumeData, title, templateId, colors = DEFAULT_COLORS }: ResumePreviewProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [resolvedPhotoUrl, setResolvedPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const rawUrl = resumeData.personalInfo?.photoUrl;
    if (rawUrl) {
      resolvePhotoUrl(rawUrl).then((url) => {
        if (!cancelled) setResolvedPhotoUrl(url);
      });
    } else {
      setResolvedPhotoUrl(null);
    }
    return () => { cancelled = true; };
  }, [resumeData.personalInfo?.photoUrl]);

  useEffect(() => {
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        const dataWithResolvedPhoto = {
          ...resumeData,
          personalInfo: {
            ...resumeData.personalInfo,
            photoUrl: resolvedPhotoUrl || undefined,
          },
        };
        const htmlPages = buildHTMLPreview(dataWithResolvedPhoto, title, templateId);
        const recolored = htmlPages.map((h) => applyColorsToHTML(h, templateId, colors));
        setPages(recolored);
      } catch (err) {
        console.error("Preview build error:", err);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [resumeData, title, templateId, resolvedPhotoUrl, colors]);

  return (
    <div className="relative group">
       <AnimatePresence>
          {loading && (
             <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-[2px] rounded-lg"
             >
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-2xl flex items-center gap-3">
                   <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Syncing...</span>
                </div>
             </motion.div>
          )}
       </AnimatePresence>

       <div className="space-y-12 pb-20">
          {pages.length > 0 ? (
             pages.map((html, i) => (
                <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="relative flex flex-col items-center"
                >
                   <div className="absolute -top-8 left-0 flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <FileText className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Page {i + 1} of {pages.length}</span>
                   </div>
                   
                   <div 
                      className="bg-white shadow-[0_30px_70px_-20px_rgba(0,0,0,0.2)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden"
                      style={{ 
                         width: PAGE_WIDTH, 
                         minHeight: PAGE_HEIGHT,
                         transformOrigin: "top center"
                      }}
                   >
                      <div dangerouslySetInnerHTML={{ __html: html }} className="h-full w-full" />
                   </div>
                </motion.div>
             ))
          ) : (
             <div className="flex flex-col items-center justify-center h-[800px] text-slate-400 space-y-6">
                <div className="w-20 h-20 bg-slate-900 rounded-[2.5rem] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
                <p className="text-[10px] font-black uppercase tracking-widest">Generating Digital Document</p>
             </div>
          )}
       </div>
    </div>
  );
}

// Build an HTML representation that mirrors the PDF templates
function buildHTMLPreview(data: ResumeData, title: string, templateId: TemplateId): string[] {
  if (isATSTemplateId(templateId)) {
    const config = getATSConfig(templateId);
    if (config) return [buildATSConfigHTML(data, title, config)];
  }

  if (templateId === "sidebar") return [buildSidebarHTML(data, title)];
  if (templateId === "twocolumn") return [buildTwoColumnHTML(data, title)];
  if (templateId === "polished") return [buildPolishedHTML(data, title)];
  if (templateId === "timeline") return [buildTimelineHTML(data, title)];

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
      ? `<ul style="margin:4px 0 0 20px;padding:0;list-style:disc">${exp.bullets.map((b) => `<li style="margin-bottom:4px;font-size:14px;line-height:1.6">${escapeHtml(b)}</li>`).join("")}</ul>`
      : exp.description ? `<p style="font-size:14px;margin:4px 0 0;color:#444">${escapeHtml(exp.description)}</p>` : "";
    const dateStr = formatDateRange(exp.startDate, exp.endDate);
    return `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:baseline"><div><strong style="font-size:14px">${escapeHtml(exp.title)}</strong><span style="font-size:14px"> — ${escapeHtml(exp.company)}</span></div>${dateStr ? `<span style="font-size:12px;color:#666;white-space:nowrap">${escapeHtml(dateStr)}</span>` : ""}</div>${bulletsHtml}</div>`;
  }).join("");

  const educationHtml = (data.education || []).map((edu) => {
    const dateStr = formatDateRange(edu.startDate, edu.endDate) || (edu.year ? edu.year : "");
    return `<div style="display:flex;justify-content:space-between;align-items:baseline;margin:4px 0"><div><strong style="font-size:14px">${escapeHtml(edu.degree)}</strong> — ${escapeHtml(edu.school)}</div>${dateStr ? `<span style="font-size:12px;color:#666;white-space:nowrap">${escapeHtml(dateStr)}</span>` : ""}</div>`;
  }).join("");

  const skillsText = (data.skills || []).map(escapeHtml).join("  •  ");

  const customHtml = (data.customSections || []).filter(s => s.title).map((s) => {
    const items = s.items.filter(Boolean).map(item => `<p style="font-size:14px;margin:2px 0 2px 10px">• ${escapeHtml(item)}</p>`).join("");
    return `${sectionHeader(s.title, templateId)}${items}`;
  }).join("");

  const languagesHtml = (data.languages || []).filter(l => l.name).map(l => 
    `<span style="font-size:14px">${escapeHtml(l.name)}${l.proficiency ? ` (${escapeHtml(l.proficiency)})` : ""}</span>`
  ).join("  •  ");

  const styles = getTemplateStyles(templateId, pi.photoUrl);

  const html = `
    <div style="${styles.container}">
      ${styles.headerBefore || ""}
      <div style="${styles.nameStyle}">${escapeHtml(name)}</div>
      ${contactParts.length ? `<p style="${styles.contactStyle}">${contactParts.join("  •  ")}</p>` : ""}
      ${linkParts.length ? `<p style="${styles.linkStyle}">${linkParts.join("  •  ")}</p>` : ""}
      ${styles.headerAfter || ""}
      ${data.summary ? `${sectionHeader("Summary", templateId)}<p style="font-size:14px;line-height:1.6;margin:0">${escapeHtml(data.summary)}</p>` : ""}
      ${skillsText ? `${sectionHeader("Skills", templateId)}<p style="font-size:14px;margin:0">${skillsText}</p>` : ""}
      ${experienceHtml ? `${sectionHeader("Experience", templateId)}${experienceHtml}` : ""}
      ${educationHtml ? `${sectionHeader("Education", templateId)}${educationHtml}` : ""}
      ${languagesHtml ? `${sectionHeader("Languages", templateId)}<p style="font-size:14px;margin:0">${languagesHtml}</p>` : ""}
      ${customHtml}
    </div>
  `;

  return [html];
}

function sectionHeader(label: string, templateId: TemplateId): string {
  const base = "text-transform:uppercase;letter-spacing:1px;font-weight:700;";
  switch (templateId) {
    case "modern":
      return `<div style="display:flex;align-items:center;gap:8px;margin:18px 0 10px"><div style="width:4px;height:18px;background:#2563eb;border-radius:2px"></div><span style="font-size:15px;color:#2563eb;${base}">${escapeHtml(label)}</span></div>`;
    case "minimal":
      return `<div style="margin:20px 0 8px"><span style="font-size:13px;color:#888;${base}">${escapeHtml(label)}</span></div>`;
    case "executive":
      return `<div style="background:#1e1e1e;color:#fff;padding:6px 12px;margin:15px 0 10px;border-radius:4px"><span style="font-size:13px;${base}">${escapeHtml(label)}</span></div>`;
    case "creative":
      return `<div style="margin:18px 0 10px"><span style="font-size:16px;color:#dc3545;${base}">${escapeHtml(label)}</span><div style="width:40px;height:3px;background:#dc3545;margin-top:4px"></div></div>`;
    case "compact":
      return `<div style="margin:10px 0 6px;border-bottom:1.5px solid #bbb;padding-bottom:2px"><span style="font-size:13px;font-weight:700;text-transform:uppercase">${escapeHtml(label)}</span></div>`;
    case "professional":
      return `<div style="margin:18px 0 10px"><span style="font-size:15px;color:#192a56;text-transform:uppercase;font-weight:700">${escapeHtml(label)}</span><div style="border-bottom:3px solid #192a56;margin-top:3px"></div></div>`;
    case "ats":
      return `<div style="margin:15px 0 8px"><span style="font-size:15px;font-weight:700;text-transform:uppercase">${escapeHtml(label)}</span><div style="border-bottom:1.5px solid #000;margin-top:3px"></div></div>`;
    default:
      return `<div style="border-bottom:1.5px solid #ccc;margin:18px 0 10px;padding-bottom:5px"><span style="font-size:15px;font-weight:700">${escapeHtml(label)}</span></div>`;
  }
}

function getTemplateStyles(templateId: TemplateId, photoUrl?: string) {
  const base = "font-family:'Inter', Helvetica, Arial, sans-serif;padding:60px 50px;color:#222;line-height:1.5;";

  switch (templateId) {
    case "modern":
      return {
        container: base,
        headerBefore: `<div style="height:6px;background:#2563eb;margin:-60px -50px 30px;border-radius:0"></div>`,
        headerAfter: "",
        nameStyle: "font-size:32px;font-weight:800;color:#2563eb;margin-bottom:8px;letter-spacing:-1px",
        contactStyle: "font-size:13px;color:#555;margin:0 0 4px",
        linkStyle: "font-size:13px;color:#2563eb;margin:0 0 8px",
      };
    case "executive":
      return {
        container: base,
        headerBefore: `<div style="background:#1e1e1e;margin:-60px -50px 0;padding:40px 50px 30px">`,
        headerAfter: `</div><div style="height:20px"></div>`,
        nameStyle: "font-size:32px;font-weight:800;color:#fff;margin-bottom:8px;letter-spacing:-1px",
        contactStyle: "font-size:12px;color:#c8c8c8;margin:0",
        linkStyle: "font-size:12px;color:#c8c8c8;margin:0",
      };
    case "creative":
      return {
        container: base,
        headerBefore: `<div style="width:60px;height:5px;background:#dc3545;margin-bottom:15px"></div>`,
        headerAfter: "",
        nameStyle: "font-size:36px;font-weight:800;color:#dc3545;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px",
        contactStyle: "font-size:13px;color:#555;margin:0 0 4px",
        linkStyle: "font-size:13px;color:#dc3545;margin:0 0 8px",
      };
    case "professional":
      return {
        container: base,
        headerBefore: `<div style="height:10px;background:#192a56;margin:-60px -50px 30px"></div>`,
        headerAfter: `<div style="border-bottom:3px solid #192a56;margin:10px 0 15px"></div>`,
        nameStyle: "font-size:34px;font-weight:800;color:#192a56;margin-bottom:8px;letter-spacing:-1px",
        contactStyle: "font-size:13px;color:#555;margin:0 0 4px",
        linkStyle: "font-size:13px;color:#192a56;margin:0 0 8px",
      };
    default: // classic
      return {
        container: base,
        headerBefore: "",
        headerAfter: "",
        nameStyle: "font-size:32px;font-weight:800;margin-bottom:8px;letter-spacing:-1px",
        contactStyle: "font-size:13px;color:#555;margin:0 0 4px",
        linkStyle: "font-size:13px;color:#0066cc;margin:0 0 8px",
      };
  }
}

function buildSidebarHTML(data: ResumeData, title: string): string {
  const pi = data.personalInfo || {};
  const name = pi.fullName || title || "Resume";
  const contactItems = [pi.email, pi.phone, pi.location, pi.linkedin, pi.portfolio].filter(Boolean);
  const skillsHtml = (data.skills || []).map(s => `<p style="font-size:13px;margin:4px 0;color:#ddd">• ${escapeHtml(s)}</p>`).join("");

  const experienceHtml = (data.experience || []).map((exp) => {
    const bulletsHtml = exp.bullets?.length
      ? `<ul style="margin:4px 0 0 20px;padding:0;list-style:disc">${exp.bullets.map((b) => `<li style="margin-bottom:4px;font-size:14px;line-height:1.6">${escapeHtml(b)}</li>`).join("")}</ul>`
      : exp.description ? `<p style="font-size:14px;margin:4px 0 0;color:#444">${escapeHtml(exp.description)}</p>` : "";
    const dateStr = formatDateRange(exp.startDate, exp.endDate);
    return `<div style="margin-bottom:15px"><div style="display:flex;justify-content:space-between;align-items:baseline"><div><strong style="font-size:14px">${escapeHtml(exp.title)}</strong><span style="font-size:14px"> — ${escapeHtml(exp.company)}</span></div>${dateStr ? `<span style="font-size:12px;color:#b4d2ff;white-space:nowrap">${escapeHtml(dateStr)}</span>` : ""}</div>${bulletsHtml}</div>`;
  }).join("");

  const educationHtml = (data.education || []).map((edu) => {
    const dateStr = formatDateRange(edu.startDate, edu.endDate) || (edu.year ? edu.year : "");
    return `<div style="display:flex;justify-content:space-between;align-items:baseline;margin:4px 0"><div><strong style="font-size:14px">${escapeHtml(edu.degree)}</strong> — ${escapeHtml(edu.school)}</div>${dateStr ? `<span style="font-size:12px;color:#666;white-space:nowrap">${escapeHtml(dateStr)}</span>` : ""}</div>`;
  }).join("");

  const photoHtml = pi.photoUrl ? `<div style="text-align:center;margin-bottom:20px"><img src="${escapeHtml(pi.photoUrl)}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:4px solid rgba(255,255,255,0.4)" /></div>` : "";

  return `<div style="display:flex;font-family:'Inter', Helvetica,Arial,sans-serif;min-height:100%;color:#222">
    <div style="width:35%;background:#1e3a5f;color:#fff;padding:40px 20px">
      ${photoHtml}
      <div style="font-size:22px;font-weight:800;margin-bottom:25px;word-break:break-word;letter-spacing:-1px">${escapeHtml(name)}</div>
      ${contactItems.length ? `<div style="margin-bottom:25px"><p style="font-size:11px;font-weight:700;color:#b4d2ff;text-transform:uppercase;margin-bottom:10px;letter-spacing:1px">Contact</p>${contactItems.map(c => `<p style="font-size:11px;color:#ddd;margin:6px 0;word-break:break-all">${escapeHtml(c!)}</p>`).join("")}</div>` : ""}
      ${skillsHtml ? `<div><p style="font-size:11px;font-weight:700;color:#b4d2ff;text-transform:uppercase;margin-bottom:10px;letter-spacing:1px">Skills</p>${skillsHtml}</div>` : ""}
    </div>
    <div style="flex:1;padding:40px 30px">
      ${data.summary ? `<div style="background:#1e3a5f;color:#fff;padding:6px 12px;margin:0 0 10px;border-radius:4px"><span style="font-size:13px;font-weight:700;text-transform:uppercase">Summary</span></div><p style="font-size:14px;line-height:1.6;margin:0 0 15px">${escapeHtml(data.summary)}</p>` : ""}
      ${experienceHtml ? `<div style="background:#1e3a5f;color:#fff;padding:6px 12px;margin:15px 0 10px;border-radius:4px"><span style="font-size:13px;font-weight:700;text-transform:uppercase">Experience</span></div>${experienceHtml}` : ""}
      ${educationHtml ? `<div style="background:#1e3a5f;color:#fff;padding:6px 12px;margin:15px 0 10px;border-radius:4px"><span style="font-size:13px;font-weight:700;text-transform:uppercase">Education</span></div>${educationHtml}` : ""}
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
      ? `<ul style="margin:4px 0 0 20px;padding:0;list-style:disc">${exp.bullets.map((b) => `<li style="margin-bottom:4px;font-size:13px;line-height:1.6">${escapeHtml(b)}</li>`).join("")}</ul>`
      : "";
    const dateStr = formatDateRange(exp.startDate, exp.endDate);
    return `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:baseline"><strong style="font-size:13px">${escapeHtml(exp.title)} — ${escapeHtml(exp.company)}</strong>${dateStr ? `<span style="font-size:11px;color:#666;white-space:nowrap">${escapeHtml(dateStr)}</span>` : ""}</div>${bulletsHtml}</div>`;
  }).join("");

  const skillsHtml = (data.skills || []).map(s => `<span style="font-size:13px">• ${escapeHtml(s)}</span>`).join("<br/>");
  const educationHtml = (data.education || []).map((edu) => {
    const dateStr = formatDateRange(edu.startDate, edu.endDate) || (edu.year ? edu.year : "");
    return `<p style="font-size:13px;margin:4px 0"><strong>${escapeHtml(edu.degree)}</strong><br/>${escapeHtml(edu.school)}${dateStr ? ` (${escapeHtml(dateStr)})` : ""}</p>`;
  }).join("");

  const sectionLabel = (l: string) => `<div style="margin-top:15px"><span style="font-size:13px;font-weight:700;color:#2d3748;text-transform:uppercase;letter-spacing:1px">${escapeHtml(l)}</span><div style="border-bottom:2px solid #2d3748;margin:4px 0 8px"></div></div>`;

  return `<div style="font-family:'Inter', Helvetica,Arial,sans-serif;color:#222">
    <div style="background:#2d3748;padding:30px 40px;margin:-60px -50px 0;color:#fff">
      <div style="font-size:32px;font-weight:800;letter-spacing:-1px">${escapeHtml(name)}</div>
      ${parts.length ? `<p style="font-size:12px;color:#ccc;margin:8px 0 0">${parts.join("  |  ")}</p>` : ""}
    </div>
    <div style="display:flex;gap:30px;padding:30px 30px 40px">
      <div style="flex:1.4">
        ${data.summary ? `${sectionLabel("Summary")}<p style="font-size:13px;line-height:1.6;margin:0">${escapeHtml(data.summary)}</p>` : ""}
        ${experienceHtml ? `${sectionLabel("Experience")}${experienceHtml}` : ""}
      </div>
      <div style="flex:0.6">
        ${skillsHtml ? `${sectionLabel("Skills")}${skillsHtml}` : ""}
        ${educationHtml ? `${sectionLabel("Education")}${educationHtml}` : ""}
        ${linkParts.length ? `${sectionLabel("Links")}${linkParts.map(l => `<p style="font-size:11px;color:#0066cc;margin:2px 0">${escapeHtml(l!)}</p>`).join("")}` : ""}
      </div>
    </div>
  </div>`;
}

function buildPolishedHTML(data: ResumeData, title: string): string {
  const pi = data.personalInfo || {};
  const name = pi.fullName || title || "Resume";
  const contactItems = [pi.email, pi.phone, pi.location, pi.linkedin, pi.portfolio].filter(Boolean);
  const skillsHtml = (data.skills || []).map(s => `<p style="font-size:13px;margin:4px 0;color:#f0d0c0">• ${escapeHtml(s)}</p>`).join("");

  const experienceHtml = (data.experience || []).map((exp) => {
    const bulletsHtml = exp.bullets?.length
      ? `<ul style="margin:4px 0 0 20px;padding:0;list-style:disc">${exp.bullets.map((b) => `<li style="margin-bottom:4px;font-size:14px;line-height:1.6">${escapeHtml(b)}</li>`).join("")}</ul>`
      : exp.description ? `<p style="font-size:14px;margin:4px 0 0;color:#444">${escapeHtml(exp.description)}</p>` : "";
    const dateStr = formatDateRange(exp.startDate, exp.endDate);
    return `<div style="margin-bottom:15px"><div style="display:flex;justify-content:space-between;align-items:baseline"><div><strong style="font-size:14px">${escapeHtml(exp.title)}</strong><span style="font-size:14px"> — ${escapeHtml(exp.company)}</span></div>${dateStr ? `<span style="font-size:12px;color:#666;white-space:nowrap">${escapeHtml(dateStr)}</span>` : ""}</div>${bulletsHtml}</div>`;
  }).join("");

  const sectionLabel = (l: string) => `<div style="margin-top:15px"><span style="font-size:14px;font-weight:700;color:#a64834;text-transform:uppercase;letter-spacing:1px">${escapeHtml(l)}</span><div style="border-bottom:2px solid #a64834;margin:4px 0 8px"></div></div>`;

  const photoHtml = pi.photoUrl ? `<div style="text-align:center;margin-bottom:20px"><img src="${escapeHtml(pi.photoUrl)}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:4px solid rgba(255,255,255,0.4)" /></div>` : "";

  return `<div style="display:flex;font-family:'Inter', Helvetica,Arial,sans-serif;min-height:100%;color:#222">
    <div style="width:35%;background:#a64834;color:#fff;padding:40px 20px">
      ${photoHtml}
      <div style="font-size:24px;font-weight:800;margin-bottom:25px;word-break:break-word;letter-spacing:-1px">${escapeHtml(name)}</div>
      ${contactItems.length ? `<div style="margin-bottom:25px"><p style="font-size:11px;font-weight:700;color:#ffd2be;text-transform:uppercase;margin-bottom:10px;letter-spacing:1px">Contact</p>${contactItems.map(c => `<p style="font-size:11px;color:#f0d0c0;margin:6px 0;word-break:break-all">${escapeHtml(c!)}</p>`).join("")}</div>` : ""}
      ${skillsHtml ? `<div><p style="font-size:11px;font-weight:700;color:#ffd2be;text-transform:uppercase;margin-bottom:10px;letter-spacing:1px">Skills</p>${skillsHtml}</div>` : ""}
    </div>
    <div style="flex:1;padding:40px 30px">
      ${data.summary ? `${sectionLabel("Summary")}<p style="font-size:14px;line-height:1.6;margin:0 0 15px">${escapeHtml(data.summary)}</p>` : ""}
      ${experienceHtml ? `${sectionLabel("Experience")}${experienceHtml}` : ""}
      ${(data.education || []).length ? `${sectionLabel("Education")}${(data.education || []).map(edu => `<div style="margin-bottom:8px"><strong>${escapeHtml(edu.degree)}</strong> — ${escapeHtml(edu.school)}</div>`).join("")}` : ""}
    </div>
  </div>`;
}

function buildTimelineHTML(data: ResumeData, title: string): string {
  const pi = data.personalInfo || {};
  const name = pi.fullName || title || "Resume";
  const contactParts = [pi.email, pi.phone, pi.location].filter(Boolean);

  const experienceHtml = (data.experience || []).map((exp, idx) => {
    const bulletsHtml = exp.bullets?.length
      ? `<ul style="margin:4px 0 0 20px;padding:0;list-style:disc">${exp.bullets.map((b) => `<li style="margin-bottom:4px;font-size:14px;line-height:1.6">${escapeHtml(b)}</li>`).join("")}</ul>`
      : "";
    const dateStr = formatDateRange(exp.startDate, exp.endDate);
    return `<div style="display:flex;gap:15px;margin-bottom:15px">
      <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:20px">
        <div style="width:12px;height:12px;border-radius:50%;background:#2962ff;flex-shrink:0;margin-top:5px"></div>
        ${idx < (data.experience || []).length - 1 ? '<div style="width:2px;flex:1;background:#2962ff;min-height:30px"></div>' : ''}
      </div>
      <div style="flex:1">
        <strong style="font-size:14px">${escapeHtml(exp.title)}</strong><span style="font-size:14px"> — ${escapeHtml(exp.company)}</span>
        ${dateStr ? `<div style="font-size:12px;color:#666;margin:2px 0">${escapeHtml(dateStr)}</div>` : ""}
        ${bulletsHtml}
      </div>
    </div>`;
  }).join("");

  return `<div style="font-family:'Inter', Helvetica,Arial,sans-serif;padding:60px 50px;color:#222;line-height:1.5">
    <div style="height:8px;background:#2962ff;margin:-60px -50px 30px"></div>
    <div style="font-size:36px;font-weight:800;color:#2962ff;margin-bottom:8px;letter-spacing:-1px">${escapeHtml(name)}</div>
    ${contactParts.length ? `<p style="font-size:13px;color:#555;margin:0 0 15px">${contactParts.join("  •  ")}</p>` : ""}
    ${data.summary ? `<p style="font-size:14px;line-height:1.6;margin:15px 0">${escapeHtml(data.summary)}</p>` : ""}
    ${experienceHtml ? `<div style="margin:20px 0 15px"><span style="font-size:16px;font-weight:700;color:#2962ff;text-transform:uppercase;letter-spacing:1px">Experience</span></div>${experienceHtml}` : ""}
  </div>`;
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate && !endDate) return "";
  return [startDate, endDate].filter(Boolean).join(" — ");
}

/** Config-driven ATS HTML preview builder */
function buildATSConfigHTML(data: ResumeData, title: string, config: ATSTemplateConfig): string {
  const pi = data.personalInfo || {};
  const name = pi.fullName || title || "Resume";
  const contactParts = [pi.email, pi.phone, pi.location].filter(Boolean);

  const fsCss = `${config.baseFontSize * 1.4}px`;
  const headCss = `${config.headingFontSize * 1.4}px`;
  const nameCss = `${config.nameFontSize * 1.4}px`;
  const marginCss = `${config.marginSize * 2}px`;

  const sectionHdr = (label: string) =>
    `<div style="margin:25px 0 10px;border-bottom:1.5px solid #000;padding-bottom:4px"><span style="font-size:${headCss};font-weight:700;font-family:${config.fontFamilyCSS};text-transform:uppercase;letter-spacing:1px">${escapeHtml(label)}</span></div>`;

  const experienceHtml = (data.experience || []).map((exp) => {
    const dateStr = formatDateRange(exp.startDate, exp.endDate);
    const bulletsHtml = exp.bullets?.length
      ? `<ul style="margin:6px 0 0 24px;padding:0;list-style:disc">${exp.bullets.map(b => `<li style="margin-bottom:4px;font-size:${fsCss};line-height:1.6;font-family:${config.fontFamilyCSS}">${escapeHtml(b)}</li>`).join("")}</ul>`
      : "";
    return `<div style="margin-bottom:15px"><div style="display:flex;justify-content:space-between;align-items:baseline"><div><strong style="font-size:${fsCss};font-family:${config.fontFamilyCSS}">${escapeHtml(exp.title)}</strong><span style="font-size:${fsCss};font-family:${config.fontFamilyCSS}"> — ${escapeHtml(exp.company)}</span></div>${dateStr ? `<span style="font-size:12px;color:#666;white-space:nowrap;font-family:${config.fontFamilyCSS}">${escapeHtml(dateStr)}</span>` : ""}</div>${bulletsHtml}</div>`;
  }).join("");

  return `
    <div style="font-family:${config.fontFamilyCSS};padding:${marginCss};color:#222;line-height:1.5">
      <div style="font-size:${nameCss};font-weight:800;margin-bottom:8px;font-family:${config.fontFamilyCSS};letter-spacing:-1px">${escapeHtml(name)}</div>
      ${contactParts.length ? `<p style="font-size:13px;color:#333;margin:0 0 15px;font-family:${config.fontFamilyCSS}">${contactParts.join("  |  ")}</p>` : ""}
      ${data.summary ? `${sectionHdr("Summary")}<p style="font-size:${fsCss};line-height:1.6;margin:0;font-family:${config.fontFamilyCSS}">${escapeHtml(data.summary)}</p>` : ""}
      ${experienceHtml ? `${sectionHdr("Experience")}${experienceHtml}` : ""}
    </div>
  `;
}
