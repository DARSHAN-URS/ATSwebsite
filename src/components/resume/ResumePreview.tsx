import { useEffect, useState, useRef } from "react";
import { type TemplateId } from "./pdfTemplates";
import type { ResumeData } from "./types";
import { getATSConfig, isATSTemplateId, type ATSTemplateConfig } from "./atsTemplateConfig";
import { Loader2, FileText } from "lucide-react";
import { resolvePhotoUrl } from "@/lib/storageUtils";
import { applyColorsToHTML } from "./resumeColorMap";
import { DEFAULT_COLORS, type ResumeColors } from "@/hooks/useResumeColors";
import { motion, AnimatePresence } from "framer-motion";

const PAGE_WIDTH = 794;
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
  const hiddenRef = useRef<HTMLDivElement>(null);
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
        
        // Build array of HTML blocks (header, summary, exp items, etc.)
        const blocks = buildHTMLBlocks(dataWithResolvedPhoto, title, templateId);
        
        // Paginate using DOM measurement
        if (hiddenRef.current) {
          const container = hiddenRef.current;
          container.innerHTML = "";
          
          let currentPageHtml = "";
          const newPages: string[] = [];
          
          for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const prevHtml = container.innerHTML;
            container.innerHTML = prevHtml + block;
            
            if (container.scrollHeight > PAGE_HEIGHT && currentPageHtml !== "") {
              // Overflow! Push current page and start a new one
              newPages.push(applyColorsToHTML(currentPageHtml, templateId, colors));
              container.innerHTML = block;
              currentPageHtml = block;
            } else {
              currentPageHtml += block;
            }
          }
          if (currentPageHtml) {
            newPages.push(applyColorsToHTML(currentPageHtml, templateId, colors));
          }
          
          setPages(newPages);
        }
      } catch (err) {
        console.error("Preview build error:", err);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [resumeData, title, templateId, resolvedPhotoUrl, colors]);

  return (
    <div className="relative group">
       {/* Hidden DOM measurer for exact 1:1 pagination */}
       <div 
         ref={hiddenRef}
         className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none"
         style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT, overflow: 'hidden' }}
       />

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

// ─── Builder Logic ────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate && !endDate) return "";
  return [startDate, endDate].filter(Boolean).join(" — ");
}

/**
 * Returns an array of HTML blocks. The pagination engine will pack these into A4 pages.
 */
function buildHTMLBlocks(data: ResumeData, title: string, templateId: TemplateId): string[] {
  if (isATSTemplateId(templateId)) {
    const config = getATSConfig(templateId);
    if (config) return buildATSBlocks(data, title, config);
  }

  if (["sidebar", "ocean", "polished", "sunset", "twocolumn", "monochrome"].includes(templateId)) {
    return [buildTwoColumnHTML(data, title, templateId)];
  }

  // Sidebar/TwoColumn layouts are harder to split vertically because of the sidebars.
  // For these, we currently return a single block that might overflow, 
  // OR we can wrap the whole thing in a block. 
  // For exact 1:1, full-page continuous layouts like sidebars require a wrapper per page.
  // We'll use a simpler wrapper approach for non-ATS for now, treating them as 1 block per section.
  
  const pi = data.personalInfo || {};
  const contactParts = [pi.email, pi.phone, pi.location].filter(Boolean);
  const linkParts = [pi.linkedin, pi.portfolio].filter(Boolean);
  const name = pi.fullName || title || "Resume";

  const styles = getTemplateStyles(templateId, pi.photoUrl);
  const blocks: string[] = [];

  // Open Container wrapper (the DOM engine will inject these inside the hidden div, 
  // but to preserve wrapper styles we inject the wrapper styles into EVERY block.
  const blockWrap = (content: string) => `<div style="${styles.container}">${content}</div>`;

  // Header Block
  let headerContent = `${styles.headerBefore || ""}<div style="${styles.nameStyle}">${escapeHtml(name)}</div>`;
  if (contactParts.length) headerContent += `<p style="${styles.contactStyle}">${contactParts.join("  •  ")}</p>`;
  if (linkParts.length) headerContent += `<p style="${styles.linkStyle}">${linkParts.join("  •  ")}</p>`;
  headerContent += (styles.headerAfter || "");
  blocks.push(blockWrap(headerContent));

  if (data.summary) {
    blocks.push(blockWrap(`${sectionHeader("Summary", templateId)}<p style="font-size:14px;line-height:1.6;margin:0">${escapeHtml(data.summary)}</p>`));
  }

  const skillsText = (data.skills || []).map(escapeHtml).join("  •  ");
  if (skillsText) {
    blocks.push(blockWrap(`${sectionHeader("Skills", templateId)}<p style="font-size:14px;margin:0">${skillsText}</p>`));
  }

  if ((data.experience || []).length > 0) {
    blocks.push(blockWrap(sectionHeader("Experience", templateId)));
    (data.experience || []).forEach(exp => {
      const bulletsHtml = exp.bullets?.length
        ? `<ul style="margin:4px 0 0 20px;padding:0;list-style:disc">${exp.bullets.map(b => `<li style="margin-bottom:4px;font-size:14px;line-height:1.6">${escapeHtml(b)}</li>`).join("")}</ul>`
        : exp.description ? `<p style="font-size:14px;margin:4px 0 0;color:#444">${escapeHtml(exp.description)}</p>` : "";
      const dateStr = formatDateRange(exp.startDate, exp.endDate);
      blocks.push(blockWrap(`<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:baseline"><div><strong style="font-size:14px">${escapeHtml(exp.title)}</strong><span style="font-size:14px"> — ${escapeHtml(exp.company)}</span></div>${dateStr ? `<span style="font-size:12px;color:#666;white-space:nowrap">${escapeHtml(dateStr)}</span>` : ""}</div>${bulletsHtml}</div>`));
    });
  }

  if ((data.education || []).length > 0) {
    blocks.push(blockWrap(sectionHeader("Education", templateId)));
    (data.education || []).forEach(edu => {
      const dateStr = formatDateRange(edu.startDate, edu.endDate) || (edu.year || "");
      blocks.push(blockWrap(`<div style="display:flex;justify-content:space-between;align-items:baseline;margin:4px 0"><div><strong style="font-size:14px">${escapeHtml(edu.degree)}</strong> — ${escapeHtml(edu.school)}</div>${dateStr ? `<span style="font-size:12px;color:#666;white-space:nowrap">${escapeHtml(dateStr)}</span>` : ""}</div>`));
    });
  }

  if ((data.languages || []).length > 0) {
    const langs = (data.languages || []).filter(l => l.name).map(l => `<span style="font-size:14px">${escapeHtml(l.name)}${l.proficiency ? ` (${escapeHtml(l.proficiency)})` : ""}</span>`).join("  •  ");
    if (langs) blocks.push(blockWrap(`${sectionHeader("Languages", templateId)}<p style="font-size:14px;margin:0">${langs}</p>`));
  }

  (data.customSections || []).filter(s => s.title).forEach(s => {
    blocks.push(blockWrap(sectionHeader(s.title, templateId)));
    s.items.filter(Boolean).forEach(item => {
      blocks.push(blockWrap(`<p style="font-size:14px;margin:2px 0 2px 10px">• ${escapeHtml(item)}</p>`));
    });
  });

  return blocks;
}

function buildATSBlocks(data: ResumeData, title: string, config: ATSTemplateConfig): string[] {
  const blocks: string[] = [];
  const pi = data.personalInfo || {};
  const contactParts = [pi.email, pi.phone, pi.location].filter(Boolean);
  
  const fsCss = `${config.baseFontSize * 1.4}px`;
  const headCss = `${config.headingFontSize * 1.4}px`;
  const nameCss = `${config.nameFontSize * 1.4}px`;
  const marginCss = `${config.marginSize * 2}px`;
  
  const blockWrap = (content: string) => `<div style="font-family:${config.fontFamilyCSS};padding:0 ${marginCss};color:#222;line-height:1.5">${content}</div>`;

  // Header
  let header = `<div style="padding-top:${marginCss};font-size:${nameCss};font-weight:800;margin-bottom:8px;font-family:${config.fontFamilyCSS};letter-spacing:-1px">${escapeHtml(pi.fullName || title || "Resume")}</div>`;
  if (contactParts.length) header += `<p style="font-size:13px;color:#333;margin:0 0 15px;font-family:${config.fontFamilyCSS}">${contactParts.join("  |  ")}</p>`;
  blocks.push(blockWrap(header));

  const sectionHdr = (label: string) => `<div style="margin:25px 0 10px;border-bottom:1.5px solid #000;padding-bottom:4px"><span style="font-size:${headCss};font-weight:700;font-family:${config.fontFamilyCSS};text-transform:uppercase;letter-spacing:1px">${escapeHtml(label)}</span></div>`;

  if (data.summary) {
    blocks.push(blockWrap(`${sectionHdr("Summary")}<p style="font-size:${fsCss};line-height:1.6;margin:0;font-family:${config.fontFamilyCSS}">${escapeHtml(data.summary)}</p>`));
  }

  if ((data.experience || []).length > 0) {
    blocks.push(blockWrap(sectionHdr("Experience")));
    data.experience!.forEach(exp => {
      const dateStr = formatDateRange(exp.startDate, exp.endDate);
      const bullets = exp.bullets?.length ? `<ul style="margin:6px 0 0 24px;padding:0;list-style:disc">${exp.bullets.map(b => `<li style="margin-bottom:4px;font-size:${fsCss};line-height:1.6;font-family:${config.fontFamilyCSS}">${escapeHtml(b)}</li>`).join("")}</ul>` : "";
      blocks.push(blockWrap(`<div style="margin-bottom:15px"><div style="display:flex;justify-content:space-between;align-items:baseline"><div><strong style="font-size:${fsCss};font-family:${config.fontFamilyCSS}">${escapeHtml(exp.title)}</strong><span style="font-size:${fsCss};font-family:${config.fontFamilyCSS}"> — ${escapeHtml(exp.company)}</span></div>${dateStr ? `<span style="font-size:12px;color:#666;white-space:nowrap;font-family:${config.fontFamilyCSS}">${escapeHtml(dateStr)}</span>` : ""}</div>${bullets}</div>`));
    });
  }

  if ((data.education || []).length > 0) {
    blocks.push(blockWrap(sectionHdr("Education")));
    data.education!.forEach(edu => {
      const dateStr = formatDateRange(edu.startDate, edu.endDate) || (edu.year || "");
      blocks.push(blockWrap(`<div style="display:flex;justify-content:space-between;align-items:baseline;margin:4px 0"><div><strong style="font-size:${fsCss};font-family:${config.fontFamilyCSS}">${escapeHtml(edu.degree)}</strong> — ${escapeHtml(edu.school)}</div>${dateStr ? `<span style="font-size:12px;color:#666;white-space:nowrap;font-family:${config.fontFamilyCSS}">${escapeHtml(dateStr)}</span>` : ""}</div>`));
    });
  }
  
  if ((data.skills || []).length > 0) {
    blocks.push(blockWrap(`${sectionHdr("Skills")}<p style="font-size:${fsCss};margin:0;font-family:${config.fontFamilyCSS}">${escapeHtml(data.skills!.join("  •  "))}</p>`));
  }

  return blocks;
}

function sectionHeader(label: string, templateId: TemplateId): string {
  const base = "text-transform:uppercase;letter-spacing:1px;font-weight:700;";
  switch (templateId) {
    case "modern":
    case "bold":
      return `<div style="display:flex;align-items:center;gap:8px;margin:18px 0 10px"><div style="width:4px;height:18px;background:#2563eb;border-radius:2px"></div><span style="font-size:15px;color:#2563eb;${base}">${escapeHtml(label)}</span></div>`;
    case "timeline":
      return `<div style="display:flex;align-items:center;gap:8px;margin:18px 0 10px"><div style="width:4px;height:18px;background:#2962ff;border-radius:2px"></div><span style="font-size:15px;color:#2962ff;${base}">${escapeHtml(label)}</span></div>`;
    case "sidebar":
      return `<div style="display:flex;align-items:center;gap:8px;margin:18px 0 10px"><div style="width:4px;height:18px;background:#1e3a5f;border-radius:2px"></div><span style="font-size:15px;color:#1e3a5f;${base}">${escapeHtml(label)}</span></div>`;
    case "minimal":
    case "minimalist-plus":
      return `<div style="margin:20px 0 8px"><span style="font-size:13px;color:#888;${base}">${escapeHtml(label)}</span></div>`;
    case "elegant":
      return `<div style="margin:20px 0 8px"><span style="font-size:13px;color:#b49146;${base}">${escapeHtml(label)}</span></div>`;
    case "executive":
    case "corporate":
      return `<div style="background:#1e1e1e;color:#fff;padding:6px 12px;margin:15px 0 10px;border-radius:4px"><span style="font-size:13px;${base}">${escapeHtml(label)}</span></div>`;
    case "twocolumn":
      return `<div style="background:#2d3748;color:#fff;padding:6px 12px;margin:15px 0 10px;border-radius:4px"><span style="font-size:13px;${base}">${escapeHtml(label)}</span></div>`;
    case "creative":
    case "vibrant":
      return `<div style="margin:18px 0 10px"><span style="font-size:16px;color:#dc3545;${base}">${escapeHtml(label)}</span><div style="width:40px;height:3px;background:#dc3545;margin-top:4px"></div></div>`;
    case "contemporary":
      return `<div style="margin:16px 0 8px;border-bottom:2px solid #10a37f;padding-bottom:4px"><span style="font-size:14px;color:#10a37f;${base}">${escapeHtml(label)}</span></div>`;
    case "cobalt":
      return `<div style="margin:18px 0 10px"><span style="font-size:16px;font-family:'Times New Roman',Times,serif;color:#1d4e89;${base}border-bottom:1.5px solid #1d4e89;padding-bottom:2px;display:inline-block;">${escapeHtml(label)}</span></div>`;
    case "polished":
      return `<div style="margin:16px 0 8px;border-bottom:2px solid #a64834;padding-bottom:4px"><span style="font-size:14px;color:#a64834;${base}">${escapeHtml(label)}</span></div>`;
    case "compact":
    case "tech":
      return `<div style="margin:10px 0 6px;border-bottom:1.5px solid #bbb;padding-bottom:2px"><span style="font-size:13px;font-weight:700;text-transform:uppercase">${escapeHtml(label)}</span></div>`;
    case "professional":
      return `<div style="margin:18px 0 10px"><span style="font-size:15px;color:#192a56;text-transform:uppercase;font-weight:700">${escapeHtml(label)}</span><div style="border-bottom:3px solid #192a56;margin-top:3px"></div></div>`;
    case "ivyleague":
      return `<div style="margin:18px 0 10px"><span style="font-size:15px;color:#555;text-transform:uppercase;font-weight:700">${escapeHtml(label)}</span><div style="border-bottom:3px solid #555;margin-top:3px"></div></div>`;
    default:
      return `<div style="border-bottom:1.5px solid #ccc;margin:18px 0 10px;padding-bottom:5px"><span style="font-size:15px;font-weight:700">${escapeHtml(label)}</span></div>`;
  }
}

function getTemplateStyles(templateId: TemplateId, photoUrl?: string) {
  const base = "font-family:'Inter', Helvetica, Arial, sans-serif;padding:0 50px;color:#222;line-height:1.5;";

  switch (templateId) {
    case "modern":
    case "bold":
      return {
        container: base,
        headerBefore: `<div style="height:6px;background:#2563eb;margin:0 -50px 30px;border-radius:0"></div>`,
        headerAfter: "",
        nameStyle: "font-size:32px;font-weight:800;color:#2563eb;margin-bottom:8px;letter-spacing:-1px",
        contactStyle: "font-size:13px;color:#555;margin:0 0 4px",
        linkStyle: "font-size:13px;color:#2563eb;margin:0 0 8px",
      };
    case "timeline":
      return {
        container: base,
        headerBefore: `<div style="height:6px;background:#2962ff;margin:0 -50px 30px;border-radius:0"></div>`,
        headerAfter: "",
        nameStyle: "font-size:32px;font-weight:800;color:#2962ff;margin-bottom:8px;letter-spacing:-1px",
        contactStyle: "font-size:13px;color:#555;margin:0 0 4px",
        linkStyle: "font-size:13px;color:#2962ff;margin:0 0 8px",
      };
    case "sidebar":
      return {
        container: base,
        headerBefore: `<div style="height:10px;background:#1e3a5f;margin:0 -50px 30px"></div>`,
        headerAfter: `<div style="border-bottom:3px solid #1e3a5f;margin:10px 0 15px"></div>`,
        nameStyle: "font-size:34px;font-weight:800;color:#1e3a5f;margin-bottom:8px;letter-spacing:-1px",
        contactStyle: "font-size:13px;color:#555;margin:0 0 4px",
        linkStyle: "font-size:13px;color:#1e3a5f;margin:0 0 8px",
      };
    case "executive":
    case "corporate":
      return {
        container: base,
        headerBefore: `<div style="background:#1e1e1e;margin:0 -50px 0;padding:40px 50px 30px">`,
        headerAfter: `</div><div style="height:20px"></div>`,
        nameStyle: "font-size:32px;font-weight:800;color:#fff;margin-bottom:8px;letter-spacing:-1px",
        contactStyle: "font-size:12px;color:#c8c8c8;margin:0",
        linkStyle: "font-size:12px;color:#c8c8c8;margin:0",
      };
    case "twocolumn":
      return {
        container: base,
        headerBefore: `<div style="background:#2d3748;margin:0 -50px 0;padding:40px 50px 30px">`,
        headerAfter: `</div><div style="height:20px"></div>`,
        nameStyle: "font-size:32px;font-weight:800;color:#fff;margin-bottom:8px;letter-spacing:-1px",
        contactStyle: "font-size:12px;color:#c8c8c8;margin:0",
        linkStyle: "font-size:12px;color:#c8c8c8;margin:0",
      };
    case "creative":
    case "vibrant":
      return {
        container: base,
        headerBefore: `<div style="width:60px;height:5px;background:#dc3545;margin-bottom:15px"></div>`,
        headerAfter: "",
        nameStyle: "font-size:36px;font-weight:800;color:#dc3545;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px",
        contactStyle: "font-size:13px;color:#555;margin:0 0 4px",
        linkStyle: "font-size:13px;color:#dc3545;margin:0 0 8px",
      };
    case "contemporary":
      return {
        container: base,
        headerBefore: `<div style="background:#10a37f;margin:0 -50px 25px;padding:40px 50px 35px;display:flex;justify-content:space-between;align-items:center"><div>`,
        headerAfter: `</div>${photoUrl ? `<img src="${escapeHtml(photoUrl)}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.15);flex-shrink:0;margin-left:20px"/>` : `<div style="width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.2);flex-shrink:0;margin-left:20px"></div>`}</div>`,
        nameStyle: "font-size:36px;font-weight:800;color:#fff;margin-bottom:8px;letter-spacing:-1px",
        contactStyle: "font-size:13px;color:#dcfff0;margin:0 0 4px",
        linkStyle: "font-size:13px;color:#dcfff0;margin:0 0 8px",
      };
    case "cobalt":
      return {
        container: "font-family:'Times New Roman', Times, serif;padding:0 50px;color:#222;line-height:1.5;",
        headerBefore: `<div style="background:#1d4e89;margin:0 -50px 25px;padding:35px 50px 30px;display:flex;justify-content:space-between;align-items:center"><div>`,
        headerAfter: `</div>${photoUrl ? `<img src="${escapeHtml(photoUrl)}" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:3px solid #1d4e89;box-shadow:0 4px 12px rgba(0,0,0,0.2);flex-shrink:0;margin-left:20px"/>` : `<div style="width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,0.2);flex-shrink:0;margin-left:20px"></div>`}</div>`,
        nameStyle: "font-size:36px;font-family:'Times New Roman',Times,serif;font-weight:700;color:#fff;margin-bottom:8px;letter-spacing:-1px",
        contactStyle: "font-size:13px;font-family:Helvetica,Arial,sans-serif;color:#d0dce8;margin:0 0 4px",
        linkStyle: "font-size:13px;font-family:Helvetica,Arial,sans-serif;color:#d0dce8;margin:0 0 8px",
      };
    case "polished":
      return {
        container: base,
        headerBefore: `<div style="background:#a64834;margin:0 -50px 25px;padding:40px 50px 35px;display:flex;justify-content:space-between;align-items:center"><div>`,
        headerAfter: `</div>${photoUrl ? `<img src="${escapeHtml(photoUrl)}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.15);flex-shrink:0;margin-left:20px"/>` : `<div style="width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.2);flex-shrink:0;margin-left:20px"></div>`}</div>`,
        nameStyle: "font-size:36px;font-weight:800;color:#fff;margin-bottom:8px;letter-spacing:-1px",
        contactStyle: "font-size:13px;color:#ffd2be;margin:0 0 4px",
        linkStyle: "font-size:13px;color:#ffd2be;margin:0 0 8px",
      };
    case "professional":
      return {
        container: base,
        headerBefore: `<div style="height:10px;background:#192a56;margin:0 -50px 30px"></div>`,
        headerAfter: `<div style="border-bottom:3px solid #192a56;margin:10px 0 15px"></div>`,
        nameStyle: "font-size:34px;font-weight:800;color:#192a56;margin-bottom:8px;letter-spacing:-1px",
        contactStyle: "font-size:13px;color:#555;margin:0 0 4px",
        linkStyle: "font-size:13px;color:#192a56;margin:0 0 8px",
      };
    case "ivyleague":
      return {
        container: base,
        headerBefore: `<div style="padding-top:40px"></div>`,
        headerAfter: `<div style="border-bottom:3px solid #555;margin:10px 0 15px"></div>`,
        nameStyle: "font-size:32px;font-weight:800;color:#555;margin-bottom:8px;letter-spacing:-1px;text-transform:uppercase",
        contactStyle: "font-size:13px;color:#555;margin:0 0 4px",
        linkStyle: "font-size:13px;color:#555;margin:0 0 8px",
      };
    case "elegant":
      return {
        container: base,
        headerBefore: `<div style="height:3px;background:#b49146;margin:0 -50px 30px"></div>`,
        headerAfter: "",
        nameStyle: "font-size:34px;font-weight:400;color:#b49146;margin-bottom:8px;letter-spacing:-1px",
        contactStyle: "font-size:13px;color:#888;margin:0 0 4px",
        linkStyle: "font-size:13px;color:#b49146;margin:0 0 8px",
      };
    default: // classic, simple
      return {
        container: base,
        headerBefore: `<div style="padding-top:40px"></div>`,
        headerAfter: "",
        nameStyle: "font-size:32px;font-weight:800;margin-bottom:8px;letter-spacing:-1px",
        contactStyle: "font-size:13px;color:#555;margin:0 0 4px",
        linkStyle: "font-size:13px;color:#0066cc;margin:0 0 8px",
      };
  }
}

function buildTwoColumnHTML(data: ResumeData, title: string, templateId: TemplateId): string {
  const pi = data.personalInfo || {};
  const name = pi.fullName || title || "Resume";
  const contactParts = [pi.email, pi.phone, pi.location].filter(Boolean);
  const linkParts = [pi.linkedin, pi.portfolio].filter(Boolean);

  const isPolished = ["polished", "sunset"].includes(templateId);
  const isTwoColumn = ["twocolumn", "monochrome"].includes(templateId);
  
  const leftBg = isPolished ? "#a64834" : isTwoColumn ? "#2d3748" : "#1e3a5f";
  const leftText = "#fff";
  const leftMuted = isPolished ? "#f0d0c0" : isTwoColumn ? "#cbd5e0" : "#b4d2ff";
  const leftAccent = isPolished ? "#ffd2be" : isTwoColumn ? "#fff" : "#ffffff";

  if (isTwoColumn) {
    let html = `<div style="font-family:'Inter',sans-serif;color:#222;line-height:1.5;min-height:1123px;">`;
    html += `<div style="background:${leftBg};padding:40px 50px 30px;color:#fff">`;
    html += `<div style="font-size:32px;font-weight:800;margin-bottom:8px">${escapeHtml(name)}</div>`;
    html += `<div style="font-size:13px;color:${leftMuted}">${contactParts.join("  •  ")}</div>`;
    if (linkParts.length) html += `<div style="font-size:13px;color:${leftMuted}">${linkParts.join("  •  ")}</div>`;
    html += `</div>`;
    
    html += `<div style="display:flex;padding:30px 50px;gap:40px">`;
    html += `<div style="flex:2">`;
    if (data.summary) {
       html += `${sectionHeader("Summary", templateId)}<p style="font-size:14px">${escapeHtml(data.summary)}</p>`;
    }
    if ((data.experience || []).length > 0) {
       html += sectionHeader("Experience", templateId);
       data.experience!.forEach(exp => {
           const dateStr = formatDateRange(exp.startDate, exp.endDate);
           html += `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:baseline"><div><strong style="font-size:14px">${escapeHtml(exp.title)}</strong><span style="font-size:14px"> — ${escapeHtml(exp.company)}</span></div>${dateStr ? `<span style="font-size:12px;color:#666">${escapeHtml(dateStr)}</span>` : ""}</div>`;
           if (exp.bullets) html += `<ul style="margin:4px 0 0 20px;padding:0;list-style:disc">${exp.bullets.map(b => `<li style="font-size:14px">${escapeHtml(b)}</li>`).join("")}</ul>`;
           html += `</div>`;
       });
    }
    if ((data.education || []).length > 0) {
       html += sectionHeader("Education", templateId);
       data.education!.forEach(edu => {
           const dateStr = formatDateRange(edu.startDate, edu.endDate) || (edu.year || "");
           html += `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:baseline"><div><strong style="font-size:14px">${escapeHtml(edu.degree)}</strong><span style="font-size:14px"> — ${escapeHtml(edu.school)}</span></div>${dateStr ? `<span style="font-size:12px;color:#666">${escapeHtml(dateStr)}</span>` : ""}</div></div>`;
       });
    }
    html += `</div>`;
    
    html += `<div style="flex:1">`;
    if ((data.skills || []).length > 0) {
       html += sectionHeader("Skills", templateId);
       data.skills!.forEach(s => {
          html += `<div style="font-size:14px;margin-bottom:4px">• ${escapeHtml(s)}</div>`;
       });
    }
    if ((data.languages || []).length > 0) {
       html += sectionHeader("Languages", templateId);
       data.languages!.forEach(l => {
          html += `<div style="font-size:14px;margin-bottom:4px">• ${escapeHtml(l.name)}</div>`;
       });
    }
    html += `</div>`;
    
    html += `</div></div>`;
    return html;
  }

  let html = `<div style="display:flex;font-family:'Inter',sans-serif;min-height:1123px;color:#222;line-height:1.5">`;
  html += `<div style="width:35%;background:${leftBg};color:${leftText};padding:40px 30px">`;
  if (pi.photoUrl) {
     html += `<img src="${escapeHtml(pi.photoUrl)}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:3px solid #fff;margin-bottom:20px;display:block;margin-left:auto;margin-right:auto;"/>`;
  }
  html += `<div style="font-size:28px;font-weight:800;margin-bottom:20px;line-height:1.2">${escapeHtml(name)}</div>`;
  
  html += `<div style="font-size:14px;font-weight:700;color:${leftAccent};margin-bottom:8px;letter-spacing:1px">CONTACT</div>`;
  contactParts.forEach(p => {
     html += `<div style="font-size:13px;color:${leftMuted};margin-bottom:6px">${escapeHtml(p)}</div>`;
  });
  linkParts.forEach(p => {
     html += `<div style="font-size:13px;color:${leftMuted};margin-bottom:6px">${escapeHtml(p)}</div>`;
  });
  
  if ((data.skills || []).length > 0) {
     html += `<div style="font-size:14px;font-weight:700;color:${leftAccent};margin:24px 0 8px;letter-spacing:1px">SKILLS</div>`;
     data.skills!.forEach(s => {
        html += `<div style="font-size:13px;color:${leftMuted};margin-bottom:4px">• ${escapeHtml(s)}</div>`;
     });
  }

  if ((data.languages || []).length > 0) {
     html += `<div style="font-size:14px;font-weight:700;color:${leftAccent};margin:24px 0 8px;letter-spacing:1px">LANGUAGES</div>`;
     data.languages!.forEach(l => {
        html += `<div style="font-size:13px;color:${leftMuted};margin-bottom:4px">• ${escapeHtml(l.name)}</div>`;
     });
  }
  html += `</div>`;

  html += `<div style="flex:1;padding:40px 40px">`;
  if (data.summary) {
    html += `${sectionHeader("Summary", templateId)}<p style="font-size:14px;line-height:1.6">${escapeHtml(data.summary)}</p>`;
  }
  if ((data.experience || []).length > 0) {
    html += sectionHeader("Experience", templateId);
    data.experience!.forEach(exp => {
      const dateStr = formatDateRange(exp.startDate, exp.endDate);
      html += `<div style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;align-items:baseline"><div><strong style="font-size:15px">${escapeHtml(exp.title)}</strong><span style="font-size:14px;color:#555"> — ${escapeHtml(exp.company)}</span></div>${dateStr ? `<span style="font-size:12px;color:#888">${escapeHtml(dateStr)}</span>` : ""}</div>`;
      if (exp.bullets) html += `<ul style="margin:6px 0 0 20px;padding:0;list-style:disc">${exp.bullets.map(b => `<li style="margin-bottom:4px;font-size:14px;line-height:1.6">${escapeHtml(b)}</li>`).join("")}</ul>`;
      html += `</div>`;
    });
  }
  if ((data.education || []).length > 0) {
    html += sectionHeader("Education", templateId);
    data.education!.forEach(edu => {
      const dateStr = formatDateRange(edu.startDate, edu.endDate) || (edu.year || "");
      html += `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;align-items:baseline"><div><strong style="font-size:15px">${escapeHtml(edu.degree)}</strong><span style="font-size:14px;color:#555"> — ${escapeHtml(edu.school)}</span></div>${dateStr ? `<span style="font-size:12px;color:#888">${escapeHtml(dateStr)}</span>` : ""}</div></div>`;
    });
  }
  html += `</div>`;
  html += `</div>`;
  
  return html;
}
