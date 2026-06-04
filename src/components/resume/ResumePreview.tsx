import { useEffect, useState, useRef } from "react";
import { type TemplateId } from "./pdfTemplates";
import { ALL_DYNAMIC_TEMPLATES } from "@/data/templates";
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

function buildDynamicPreviewHTML(config: any, data: ResumeData, title: string): string {
  const layout = config.layout_metadata || {};
  const primary = (layout.color_palette && layout.color_palette.primary) || "#1f2937";
  
  const pi = data.personalInfo || {};
  const name = escapeHtml(pi.fullName || title || "Resume");
  const contactLines = [pi.email, pi.phone, pi.location].filter(Boolean).map(escapeHtml).join('<br/>');
  const contactStr = [pi.email, pi.phone, pi.location].filter(Boolean).map(escapeHtml).join(' • ');
  const skillsList = (data.skills || []).map(escapeHtml);
  
  const hasPhoto = layout.has_photo && pi.photoUrl;
  const photoHtml = hasPhoto ? `<img src="${escapeHtml(pi.photoUrl!)}" style="width:130px;height:130px;border-radius:50%;object-fit:cover;margin:0 auto 24px;display:block;border:4px solid rgba(255,255,255,0.15);box-shadow:0 4px 12px rgba(0,0,0,0.1)" />` : '';

  const expHtml = (data.experience || []).map(e => `
    <div style="margin-bottom:16px;page-break-inside:avoid">
      <div style="font-size:15px"><b>${escapeHtml(e.title)}</b> — ${escapeHtml(e.company)}</div>
      <div style="font-size:12.5px;color:#666;margin-bottom:4px">${escapeHtml(formatDateRange(e.startDate, e.endDate))}</div>
      ${e.bullets ? e.bullets.map(b => `<div style="font-size:13.5px;color:#444;margin-left:12px;margin-bottom:3px">• ${escapeHtml(b)}</div>`).join("") : ''}
      ${e.description && !e.bullets ? `<div style="font-size:13.5px;color:#444">${escapeHtml(e.description)}</div>` : ''}
    </div>
  `).join("");

  const eduHtml = (data.education || []).map(e => `
    <div style="margin-bottom:12px;page-break-inside:avoid">
      <div style="font-size:15px"><b>${escapeHtml(e.degree)}</b></div>
      <div style="font-size:14px;color:#444">${escapeHtml(e.school)}</div>
      <div style="font-size:12.5px;color:#666">${escapeHtml(formatDateRange(e.startDate, e.endDate) || e.year || '')}</div>
    </div>
  `).join("");

  // Replicate thumbnail logic exactly but at ~5x scale
  if (layout.sidebar_position === 'left' || layout.sidebar_position === 'asymmetrical-left') {
    return `
      <div style="display:flex;font-family:Arial,sans-serif;min-height:1123px;color:#222;line-height:1.4">
        <div style="width:35%;background:${primary};color:#fff;padding:40px 30px">
          ${photoHtml}
          <div style="font-size:32px;font-weight:700;margin-bottom:24px;text-align:${hasPhoto ? 'center' : 'left'};line-height:1.1">${name}</div>
          
          <div style="font-size:14px;font-weight:700;margin-bottom:8px;letter-spacing:1px;opacity:0.9">CONTACT</div>
          <div style="font-size:13px;margin-bottom:32px;line-height:1.6;opacity:0.9">${contactLines}</div>
          
          ${skillsList.length ? `
            <div style="font-size:14px;font-weight:700;margin-bottom:12px;letter-spacing:1px;opacity:0.9">SKILLS</div>
            <div style="font-size:13px;line-height:1.6;opacity:0.9">
              ${skillsList.map(sk => `• ${sk}`).join('<br/>')}
            </div>
          ` : ''}
        </div>
        <div style="flex:1;padding:50px 40px;background:#fff">
          ${data.summary ? `
            <div style="font-size:16px;font-weight:700;color:${primary};border-bottom:2px solid ${primary};margin-bottom:12px;padding-bottom:4px;text-transform:uppercase">SUMMARY</div>
            <div style="font-size:13.5px;margin-bottom:32px;line-height:1.6;color:#444">${escapeHtml(data.summary)}</div>
          ` : ''}
          
          ${expHtml ? `
            <div style="font-size:16px;font-weight:700;color:${primary};border-bottom:2px solid ${primary};margin-bottom:16px;padding-bottom:4px;text-transform:uppercase">EXPERIENCE</div>
            <div style="margin-bottom:32px">${expHtml}</div>
          ` : ''}
          
          ${eduHtml ? `
            <div style="font-size:16px;font-weight:700;color:${primary};border-bottom:2px solid ${primary};margin-bottom:16px;padding-bottom:4px;text-transform:uppercase">EDUCATION</div>
            <div>${eduHtml}</div>
          ` : ''}
        </div>
      </div>
    `;
  } else {
    // Top header layout
    const headerPhotoHtml = hasPhoto ? `<img src="${escapeHtml(pi.photoUrl!)}" style="width:110px;height:110px;border-radius:50%;object-fit:cover;margin-left:24px;box-shadow:0 4px 12px rgba(0,0,0,0.1)" />` : '';
    
    return `
      <div style="font-family:Arial,sans-serif;padding:0;color:#222;line-height:1.4;min-height:1123px;background:#fff">
        <div style="height:20px;background:${primary};width:100%"></div>
        <div style="padding:40px 50px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px">
            <div style="flex:1">
              <div style="font-size:38px;font-weight:800;color:${primary};margin-bottom:8px;line-height:1.1;letter-spacing:-1px">${name}</div>
              <div style="font-size:14px;color:#666">${contactStr}</div>
            </div>
            ${headerPhotoHtml}
          </div>
          
          ${data.summary ? `
            <div style="font-size:13.5px;margin-bottom:32px;line-height:1.6;color:#444">${escapeHtml(data.summary)}</div>
          ` : ''}
          
          ${skillsList.length ? `
            <div style="border-bottom:1.5px solid ${primary};margin-bottom:16px;padding-bottom:4px">
              <span style="font-size:16px;font-weight:700;color:${primary};text-transform:uppercase;letter-spacing:1px">SKILLS</span>
            </div>
            <div style="font-size:13.5px;margin-bottom:32px;color:#444;line-height:1.6">
              ${skillsList.join(' • ')}
            </div>
          ` : ''}
          
          ${expHtml ? `
            <div style="border-bottom:1.5px solid ${primary};margin-bottom:16px;padding-bottom:4px">
              <span style="font-size:16px;font-weight:700;color:${primary};text-transform:uppercase;letter-spacing:1px">EXPERIENCE</span>
            </div>
            <div style="margin-bottom:32px">${expHtml}</div>
          ` : ''}
          
          ${eduHtml ? `
            <div style="border-bottom:1.5px solid ${primary};margin-bottom:16px;padding-bottom:4px">
              <span style="font-size:16px;font-weight:700;color:${primary};text-transform:uppercase;letter-spacing:1px">EDUCATION</span>
            </div>
            <div>${eduHtml}</div>
          ` : ''}
        </div>
      </div>
    `;
  }
}

/**
 * Returns an array of HTML blocks. The pagination engine will pack these into A4 pages.
 */
function buildHTMLBlocks(data: ResumeData, title: string, templateId: TemplateId): string[] {
  if (isATSTemplateId(templateId)) {
    const config = getATSConfig(templateId);
    if (config) return buildATSBlocks(data, title, config);
  }

  if (templateId === "tpl_cre_001") return [buildCreativeBrianHTML(data, title)];
  if (templateId === "tpl_cre_002") return [buildCreativeCamilaHTML(data, title)];
  if (templateId === "tpl_cre_003") return [buildCreativeRohanHTML(data, title)];
  if (templateId === "tpl_cre_004") return [buildCreativeCatherineHTML(data, title)];
  if (templateId === "tpl_cre_005") return [buildCreativeMatteoHTML(data, title)];
  if (templateId === "tpl_cre_maria") return [buildCreativeMariaHTML(data, title)];
  if (templateId === "tpl_cre_lucia") return [buildCreativeLuciaHTML(data, title)];
  if (templateId === "tpl_cre_anna") return [buildCreativeAnnaHTML(data, title)];
  if (templateId === "tpl_cre_antoine") return [buildCreativeAntoineHTML(data, title)];

  // Check for dynamic templates (Photo / Profiles)
  const dynamicConfig = ALL_DYNAMIC_TEMPLATES.find((t: any) => t.template_id === templateId);
  if (dynamicConfig) {
    return [buildDynamicPreviewHTML(dynamicConfig, data, title)];
  }

  if (["sidebar", "ocean", "polished", "sunset", "twocolumn", "monochrome"].includes(templateId)) {
    return [buildTwoColumnHTML(data, title, templateId)];
  }
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

const SVG_ICONS = {
  mapPin: `<svg style="width:11px;height:11px;display:inline-block;vertical-align:middle;margin-right:4px;color:#555;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  mail: `<svg style="width:11px;height:11px;display:inline-block;vertical-align:middle;margin-right:4px;color:#555;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  phone: `<svg style="width:11px;height:11px;display:inline-block;vertical-align:middle;margin-right:4px;color:#555;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  linkedin: `<svg style="width:11px;height:11px;display:inline-block;vertical-align:middle;margin-right:4px;color:#555;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>`,
  user: `<svg style="width:13px;height:13px;display:inline-block;vertical-align:middle;margin-right:5px;color:#111;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  education: `<svg style="width:13px;height:13px;display:inline-block;vertical-align:middle;margin-right:5px;color:#111;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>`,
  languages: `<svg style="width:13px;height:13px;display:inline-block;vertical-align:middle;margin-right:5px;color:#111;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
  skills: `<svg style="width:13px;height:13px;display:inline-block;vertical-align:middle;margin-right:5px;color:#111;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  experience: `<svg style="width:13px;height:13px;display:inline-block;vertical-align:middle;margin-right:5px;color:#111;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>`,
  folder: `<svg style="width:13px;height:13px;display:inline-block;vertical-align:middle;margin-right:5px;color:#111;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>`,
  award: `<svg style="width:13px;height:13px;display:inline-block;vertical-align:middle;margin-right:5px;color:#111;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></svg>`
};

function getUnicodeRatingDots(proficiency: string): string {
  const clean = (proficiency || "").toLowerCase();
  let active = 3;
  if (clean.includes("5") || clean.includes("native") || clean.includes("fluent") || clean.includes("expert") || clean.includes("bilingual")) active = 5;
  else if (clean.includes("4") || clean.includes("proficient") || clean.includes("advanced") || clean.includes("full")) active = 4;
  else if (clean.includes("3") || clean.includes("conversational") || clean.includes("intermediate") || clean.includes("working")) active = 3;
  else if (clean.includes("2") || clean.includes("basic") || clean.includes("elementary") || clean.includes("limited")) active = 2;
  else if (clean.includes("1") || clean.includes("beginner") || clean.includes("novice")) active = 1;
  return `<span style="letter-spacing:1px;font-family:Arial,sans-serif;color:#111;font-size:12px;">${"●".repeat(active)}<span style="color:#d1d5db;">${"○".repeat(5 - active)}</span></span>`;
}

function chunkArray<T>(arr: T[], size = 2): T[][] {
  const chunks: T[][] = [];
  const mid = Math.ceil(arr.length / size);
  chunks.push(arr.slice(0, mid));
  chunks.push(arr.slice(mid));
  return chunks;
}

function buildATSBlocks(data: ResumeData, title: string, config: ATSTemplateConfig): string[] {
  const pi = data.personalInfo || {};
  const primary = config.primaryColor || "#000000";
  const fsCss = `${config.baseFontSize * 1.4}px`;
  const headCss = `${config.headingFontSize * 1.4}px`;
  const nameCss = `${config.nameFontSize * 1.4}px`;
  const marginCss = `${config.marginSize * 2}px`;

  // 1. ATS Classic Serif (Emily Carter PM layout)
  if (config.id === "ats-classic-serif") {
    const blocks: string[] = [];
    const contactParts: string[] = [];
    if (pi.location) contactParts.push(`${SVG_ICONS.mapPin} ${escapeHtml(pi.location)}`);
    if (pi.email) contactParts.push(`${SVG_ICONS.mail} <a href="mailto:${escapeHtml(pi.email)}" style="color:#222;text-decoration:none">${escapeHtml(pi.email)}</a>`);
    if (pi.phone) contactParts.push(`${SVG_ICONS.phone} ${escapeHtml(pi.phone)}`);
    if (pi.linkedin) contactParts.push(`${SVG_ICONS.linkedin} <a href="${escapeHtml(pi.linkedin)}" target="_blank" style="color:#222;text-decoration:none">${escapeHtml(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</a>`);

    // Centered Header Block
    let header = `<div style="font-family:${config.fontFamilyCSS};padding:${marginCss} ${marginCss} 0;text-align:center;color:#111;">`;
    header += `<div style="font-size:${nameCss};font-weight:700;margin-bottom:4px;font-family:${config.fontFamilyCSS}">${escapeHtml(pi.fullName || title || "Resume")}</div>`;
    header += `<div style="font-size:${config.baseFontSize * 1.6}px;font-style:italic;color:#333;margin-bottom:12px;font-family:${config.fontFamilyCSS}">Project Manager</div>`;
    if (contactParts.length) {
      header += `<div style="font-size:11.5px;color:#333;display:flex;justify-content:center;gap:16px;flex-wrap:wrap;font-family:${config.fontFamilyCSS}">${contactParts.join(" ")}</div>`;
    }
    header += `</div>`;
    blocks.push(header);

    const blockWrap = (content: string) => `<div style="font-family:${config.fontFamilyCSS};padding:0 ${marginCss};color:#111;line-height:1.55">${content}</div>`;
    const sectionHdr = (label: string) => `<div style="font-size:${headCss};font-weight:800;letter-spacing:0.5px;margin:24px 0 6px;text-transform:uppercase;border-bottom:1.5px solid #111;padding-bottom:3px;font-family:${config.fontFamilyCSS}">${escapeHtml(label)}</div>`;

    // Render Order sections
    config.sectionOrder.forEach(sec => {
      if (sec === "summary" && data.summary) {
        blocks.push(blockWrap(`${sectionHdr("Summary")}<p style="font-size:${fsCss};line-height:1.6;margin:0;font-family:${config.fontFamilyCSS};text-align:justify;">${escapeHtml(data.summary)}</p>`));
      } else if (sec === "experience" && (data.experience || []).length > 0) {
        let expContent = sectionHdr("Professional Experience");
        data.experience!.forEach(exp => {
          const dateRange = formatDateRange(exp.startDate, exp.endDate);
          const bullets = exp.bullets?.length ? `<ul style="margin:4px 0 0 20px;padding:0;list-style:disc">${exp.bullets.map(b => `<li style="margin-bottom:3px;font-size:${fsCss};line-height:1.5;font-family:${config.fontFamilyCSS}">${escapeHtml(b)}</li>`).join("")}</ul>` : "";
          expContent += `
            <div style="margin-bottom:14px;page-break-inside:avoid;">
              <div style="display:flex;justify-content:space-between;align-items:baseline;font-weight:bold;font-size:${fsCss}">
                <div>${escapeHtml(exp.title)}</div>
                <div style="font-weight:normal;font-size:12px;color:#333">${escapeHtml(dateRange)}</div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:baseline;font-style:italic;font-size:${fsCss};color:#444;">
                <div>${escapeHtml(exp.company)}</div>
                <div style="font-style:normal;font-size:12px;color:#555">${escapeHtml(exp.location || "Toronto, Canada")}</div>
              </div>
              ${bullets}
            </div>
          `;
        });
        blocks.push(blockWrap(expContent));
      } else if (sec === "education" && (data.education || []).length > 0) {
        let eduContent = sectionHdr("Education");
        data.education!.forEach(edu => {
          const dateStr = formatDateRange(edu.startDate, edu.endDate) || (edu.year || "");
          eduContent += `
            <div style="margin-bottom:10px;page-break-inside:avoid;">
              <div style="display:flex;justify-content:space-between;align-items:baseline;font-weight:bold;font-size:${fsCss}">
                <div>${escapeHtml(edu.degree)}</div>
                <div style="font-weight:normal;font-size:12px;color:#333">${escapeHtml(dateStr)}</div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:baseline;font-style:italic;font-size:${fsCss};color:#444;">
                <div>${escapeHtml(edu.school)}</div>
                <div style="font-style:normal;font-size:12px;color:#555">Toronto, Canada</div>
              </div>
            </div>
          `;
        });
        blocks.push(blockWrap(eduContent));
      } else if (sec === "skills" && (data.skills || []).length > 0) {
        const chunks = chunkArray(data.skills!);
        const list1 = chunks[0].map(s => `<li style="margin-bottom:3px;font-size:${fsCss};font-family:${config.fontFamilyCSS}">• ${escapeHtml(s)}</li>`).join("");
        const list2 = chunks[1].map(s => `<li style="margin-bottom:3px;font-size:${fsCss};font-family:${config.fontFamilyCSS}">• ${escapeHtml(s)}</li>`).join("");
        const skillsHtml = `
          ${sectionHdr("Skills")}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 20px;list-style:none;">
            <ul style="margin:0;padding:0;list-style:none">${list1}</ul>
            <ul style="margin:0;padding:0;list-style:none">${list2}</ul>
          </div>
        `;
        blocks.push(blockWrap(skillsHtml));
      } else if (sec === "languages" && (data.languages || []).length > 0) {
        const chunks = chunkArray(data.languages!);
        const list1 = chunks[0].map(l => `<li style="margin-bottom:3px;font-size:${fsCss};font-family:${config.fontFamilyCSS}">• ${escapeHtml(l.name)}${l.proficiency ? ` (${escapeHtml(l.proficiency)})` : ""}</li>`).join("");
        const list2 = chunks[1].map(l => `<li style="margin-bottom:3px;font-size:${fsCss};font-family:${config.fontFamilyCSS}">• ${escapeHtml(l.name)}${l.proficiency ? ` (${escapeHtml(l.proficiency)})` : ""}</li>`).join("");
        const langHtml = `
          ${sectionHdr("Languages")}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 20px;">
            <ul style="margin:0;padding:0;list-style:none">${list1}</ul>
            <ul style="margin:0;padding:0;list-style:none">${list2}</ul>
          </div>
        `;
        blocks.push(blockWrap(langHtml));
      } else if (sec === "custom" && (data.customSections || []).length > 0) {
        data.customSections!.forEach(sec => {
          if (!sec.title || !sec.items?.length) return;
          const chunks = chunkArray(sec.items);
          const list1 = chunks[0].map(item => `<li style="margin-bottom:3px;font-size:${fsCss};font-family:${config.fontFamilyCSS}">• ${escapeHtml(item)}</li>`).join("");
          const list2 = chunks[1].map(item => `<li style="margin-bottom:3px;font-size:${fsCss};font-family:${config.fontFamilyCSS}">• ${escapeHtml(item)}</li>`).join("");
          const customHtml = `
            ${sectionHdr(sec.title)}
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 20px;">
              <ul style="margin:0;padding:0;list-style:none">${list1}</ul>
              <ul style="margin:0;padding:0;list-style:none">${list2}</ul>
            </div>
          `;
          blocks.push(blockWrap(customHtml));
        });
      }
    });
    return blocks;
  }

  // 2. ATS Modern Blue (Daniel Mercer PM layout)
  if (config.id === "ats-modern-blue") {
    const blocks: string[] = [];
    const contactParts: string[] = [];
    if (pi.email) contactParts.push(`${SVG_ICONS.mail} <a href="mailto:${escapeHtml(pi.email)}" style="color:#222;text-decoration:none">${escapeHtml(pi.email)}</a>`);
    if (pi.phone) contactParts.push(`${SVG_ICONS.phone} ${escapeHtml(pi.phone)}`);
    if (pi.location) contactParts.push(`${SVG_ICONS.mapPin} ${escapeHtml(pi.location)}`);
    if (pi.linkedin) contactParts.push(`${SVG_ICONS.linkedin} <a href="${escapeHtml(pi.linkedin)}" target="_blank" style="color:#222;text-decoration:none">${escapeHtml(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</a>`);

    // Left-aligned header
    let header = `<div style="font-family:${config.fontFamilyCSS};padding:${marginCss} ${marginCss} 0;color:#111;text-align:left;">`;
    header += `<div style="font-size:${nameCss};font-weight:700;color:${primary};line-height:1.1;margin-bottom:4px;font-family:${config.fontFamilyCSS}">${escapeHtml(pi.fullName || title || "Resume")}</div>`;
    header += `<div style="font-size:${config.baseFontSize * 1.5}px;color:${primary};margin-bottom:12px;font-family:${config.fontFamilyCSS}">Vice President of Sales</div>`;
    if (contactParts.length) {
      header += `<div style="font-size:11.5px;color:#333;display:flex;gap:16px;flex-wrap:wrap;font-family:${config.fontFamilyCSS}">${contactParts.join(" ")}</div>`;
    }
    header += `</div>`;
    blocks.push(header);

    const blockWrap = (content: string) => `<div style="font-family:${config.fontFamilyCSS};padding:0 ${marginCss};color:#111;line-height:1.55">${content}</div>`;
    const sectionHdr = (label: string) => `<div style="font-size:${headCss};font-weight:700;margin:24px 0 8px;text-transform:none;border-bottom:1.5px solid ${primary};padding-bottom:3px;color:${primary};font-family:${config.fontFamilyCSS}">${escapeHtml(label)}</div>`;

    config.sectionOrder.forEach(sec => {
      if (sec === "summary" && data.summary) {
        blocks.push(blockWrap(`${sectionHdr("Summary")}<p style="font-size:${fsCss};line-height:1.55;margin:0;font-family:${config.fontFamilyCSS}">${escapeHtml(data.summary)}</p>`));
      } else if (sec === "experience" && (data.experience || []).length > 0) {
        let expContent = sectionHdr("Professional Experience");
        data.experience!.forEach(exp => {
          const dateRange = formatDateRange(exp.startDate, exp.endDate);
          const bullets = exp.bullets?.length ? `<ul style="margin:4px 0 0 20px;padding:0;list-style:disc">${exp.bullets.map(b => `<li style="margin-bottom:3px;font-size:${fsCss};line-height:1.5;font-family:${config.fontFamilyCSS}">${escapeHtml(b)}</li>`).join("")}</ul>` : "";
          expContent += `
            <div style="margin-bottom:14px;page-break-inside:avoid;">
              <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:${fsCss}">
                <div><strong style="color:#111;">${escapeHtml(exp.title)}</strong>, <span style="font-style:italic;color:#444;">${escapeHtml(exp.company)}</span></div>
                <div style="font-size:12px;color:#333">${escapeHtml(dateRange)}</div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:11.5px;color:#555;margin-bottom:4px;">
                <div></div>
                <div>${escapeHtml(exp.location || "Chicago, Illinois")}</div>
              </div>
              ${bullets}
            </div>
          `;
        });
        blocks.push(blockWrap(expContent));
      } else if (sec === "education" && (data.education || []).length > 0) {
        let eduContent = sectionHdr("Education");
        data.education!.forEach(edu => {
          const dateStr = formatDateRange(edu.startDate, edu.endDate) || (edu.year || "");
          eduContent += `
            <div style="margin-bottom:10px;page-break-inside:avoid;display:flex;justify-content:space-between;align-items:baseline;font-size:${fsCss}">
              <div><strong style="color:#111">${escapeHtml(edu.degree)}</strong>, <span style="font-style:italic;color:#444">${escapeHtml(edu.school)}</span></div>
              <div style="font-size:12px;color:#333">${escapeHtml(dateStr)}</div>
            </div>
          `;
        });
        blocks.push(blockWrap(eduContent));
      } else if (sec === "skills" && (data.skills || []).length > 0) {
        const skillsHtml = `
          ${sectionHdr("Skills")}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;">
            ${chunkArray(data.skills!).map(chunk => `
              <ul style="margin:0;padding:0;list-style:disc;margin-left:20px;">
                ${chunk.map(s => `<li style="margin-bottom:3.5px;font-size:${fsCss}">${escapeHtml(s)}</li>`).join("")}
              </ul>
            `).join("")}
          </div>
        `;
        blocks.push(blockWrap(skillsHtml));
      } else if (sec === "languages" && (data.languages || []).length > 0) {
        const langHtml = `
          ${sectionHdr("Languages")}
          <div style="display:flex;gap:40px;margin-left:10px;">
            ${data.languages!.map(l => `
              <div style="font-family:${config.fontFamilyCSS}">
                <div style="font-size:${fsCss};font-weight:700;color:#111;">${escapeHtml(l.name)}</div>
                <div style="font-size:11.5px;color:#666;">${escapeHtml(l.proficiency)}</div>
              </div>
            `).join("")}
          </div>
        `;
        blocks.push(blockWrap(langHtml));
      } else if (sec === "custom" && (data.customSections || []).length > 0) {
        data.customSections!.forEach(sec => {
          if (!sec.title || !sec.items?.length) return;
          const customHtml = `
            ${sectionHdr(sec.title)}
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;">
              ${chunkArray(sec.items).map(chunk => `
                <ul style="margin:0;padding:0;list-style:disc;margin-left:20px;">
                  ${chunk.map(item => `<li style="margin-bottom:3.5px;font-size:${fsCss}">${escapeHtml(item)}</li>`).join("")}
                </ul>
              `).join("")}
            </div>
          `;
          blocks.push(blockWrap(customHtml));
        });
      }
    });
    return blocks;
  }

  // 3. ATS Executive Serif (Andrew O'Sullivan PM layout)
  if (config.id === "ats-executive-dots") {
    const blocks: string[] = [];
    const contactParts: string[] = [];
    if (pi.location) contactParts.push(`${SVG_ICONS.mapPin} ${escapeHtml(pi.location)}`);
    if (pi.email) contactParts.push(`${SVG_ICONS.mail} <a href="mailto:${escapeHtml(pi.email)}" style="color:#222;text-decoration:none">${escapeHtml(pi.email)}</a>`);
    if (pi.phone) contactParts.push(`${SVG_ICONS.phone} ${escapeHtml(pi.phone)}`);
    if (pi.linkedin) contactParts.push(`${SVG_ICONS.linkedin} <a href="${escapeHtml(pi.linkedin)}" target="_blank" style="color:#222;text-decoration:none">${escapeHtml(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</a>`);

    // Centered header
    let header = `<div style="font-family:${config.fontFamilyCSS};padding:${marginCss} ${marginCss} 0;text-align:center;color:#111;">`;
    header += `<div style="font-size:${nameCss};font-weight:700;margin-bottom:4px;font-family:${config.fontFamilyCSS}">${escapeHtml(pi.fullName || title || "Resume")}</div>`;
    header += `<div style="font-size:${config.baseFontSize * 1.5}px;font-style:italic;color:#333;margin-bottom:12px;font-family:${config.fontFamilyCSS}">Product Manager</div>`;
    if (contactParts.length) {
      header += `<div style="font-size:11.5px;color:#333;display:flex;justify-content:center;gap:12px;flex-wrap:wrap;font-family:${config.fontFamilyCSS}">${contactParts.join(" | ")}</div>`;
    }
    header += `</div>`;
    blocks.push(header);

    const blockWrap = (content: string) => `<div style="font-family:${config.fontFamilyCSS};padding:0 ${marginCss};color:#111;line-height:1.55">${content}</div>`;
    const sectionHdr = (label: string) => `<div style="font-size:${headCss};font-weight:800;letter-spacing:0.5px;margin:24px 0 6px;text-transform:uppercase;border-bottom:1.5px solid #111;padding-bottom:3px;font-family:${config.fontFamilyCSS}">${escapeHtml(label)}</div>`;

    config.sectionOrder.forEach(sec => {
      if (sec === "summary" && data.summary) {
        blocks.push(blockWrap(`${sectionHdr("Summary")}<p style="font-size:${fsCss};line-height:1.6;margin:0;font-family:${config.fontFamilyCSS};text-align:justify;">${escapeHtml(data.summary)}</p>`));
      } else if (sec === "experience" && (data.experience || []).length > 0) {
        let expContent = sectionHdr("Professional Experience");
        data.experience!.forEach(exp => {
          const dateRange = formatDateRange(exp.startDate, exp.endDate);
          const bullets = exp.bullets?.length ? `<ul style="margin:4px 0 0 20px;padding:0;list-style:disc">${exp.bullets.map(b => `<li style="margin-bottom:3px;font-size:${fsCss};line-height:1.5;font-family:${config.fontFamilyCSS}">${escapeHtml(b)}</li>`).join("")}</ul>` : "";
          expContent += `
            <div style="margin-bottom:14px;page-break-inside:avoid;">
              <div style="display:flex;justify-content:space-between;align-items:baseline;font-weight:bold;font-size:${fsCss}">
                <div>${escapeHtml(exp.title)}</div>
                <div style="font-weight:normal;font-size:12px;color:#333">${escapeHtml(dateRange)}</div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:baseline;font-style:italic;font-size:${fsCss};color:#444;">
                <div>${escapeHtml(exp.company)}</div>
                <div style="font-style:normal;font-size:12px;color:#555">${escapeHtml(exp.location || "Dublin, Ireland")}</div>
              </div>
              ${bullets}
            </div>
          `;
        });
        blocks.push(blockWrap(expContent));
      } else if (sec === "education" && (data.education || []).length > 0) {
        let eduContent = sectionHdr("Education");
        data.education!.forEach(edu => {
          const dateStr = formatDateRange(edu.startDate, edu.endDate) || (edu.year || "");
          eduContent += `
            <div style="margin-bottom:10px;page-break-inside:avoid;">
              <div style="display:flex;justify-content:space-between;align-items:baseline;font-weight:bold;font-size:${fsCss}">
                <div>${escapeHtml(edu.degree)}</div>
                <div style="font-weight:normal;font-size:12px;color:#333">${escapeHtml(dateStr)}</div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:baseline;font-style:italic;font-size:${fsCss};color:#444;">
                <div>${escapeHtml(edu.school)}</div>
                <div style="font-style:normal;font-size:12px;color:#555">Dublin, Ireland</div>
              </div>
            </div>
          `;
        });
        blocks.push(blockWrap(eduContent));
      } else if (sec === "skills" && (data.skills || []).length > 0) {
        const skillsHtml = `
          ${sectionHdr("Skills")}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;">
            ${chunkArray(data.skills!).map(chunk => `
              <ul style="margin:0;padding:0;list-style:disc;margin-left:20px;">
                ${chunk.map(s => `<li style="margin-bottom:3.5px;font-size:${fsCss}">${escapeHtml(s)}</li>`).join("")}
              </ul>
            `).join("")}
          </div>
        `;
        blocks.push(blockWrap(skillsHtml));
      } else if (sec === "languages" && (data.languages || []).length > 0) {
        const langHtml = `
          ${sectionHdr("Languages")}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;margin-left:6px;">
            ${data.languages!.map(l => `
              <div style="display:flex;justify-content:space-between;align-items:center;font-family:${config.fontFamilyCSS}">
                <span style="font-size:${fsCss};font-weight:500;color:#111">${escapeHtml(l.name)}</span>
                ${getUnicodeRatingDots(l.proficiency)}
              </div>
            `).join("")}
          </div>
        `;
        blocks.push(blockWrap(langHtml));
      } else if (sec === "custom" && (data.customSections || []).length > 0) {
        data.customSections!.forEach(sec => {
          if (!sec.title || !sec.items?.length) return;
          const customHtml = `
            ${sectionHdr(sec.title)}
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;">
              ${chunkArray(sec.items).map(chunk => `
                <ul style="margin:0;padding:0;list-style:disc;margin-left:20px;">
                  ${chunk.map(item => `<li style="margin-bottom:3.5px;font-size:${fsCss}">${escapeHtml(item)}</li>`).join("")}
                </ul>
              `).join("")}
            </div>
          `;
          blocks.push(blockWrap(customHtml));
        });
      }
    });
    return blocks;
  }

  // 4. ATS Two Column Icon (Élodie Martin layout)
  if (config.id === "ats-two-column-icon") {
    // Generate a single block wrapping the two columns
    let html = `<div style="display:flex;font-family:${config.fontFamilyCSS};padding:${marginCss} ${marginCss} 0;color:#111;line-height:1.45;min-height:1020px;background:#fff;">`;

    // ─── LEFT COLUMN (38% width) ───
    html += `<div style="width:38%;padding-right:24px;border-right:1px solid #e2e8f0;">`;
    // Name & Title
    html += `<div style="font-size:32px;font-weight:800;letter-spacing:-1px;line-height:1.05;color:#111;font-family:${config.fontFamilyCSS}">${escapeHtml(pi.fullName || title || "Resume")}</div>`;
    html += `<div style="font-size:16px;color:#333;font-weight:500;margin-top:4px;margin-bottom:20px;font-family:${config.fontFamilyCSS}">Marketing Director</div>`;
    
    // Contact list stacked
    html += `<div style="font-size:11.5px;color:#444;display:flex;flex-direction:column;gap:8px;margin-bottom:24px;">`;
    if (pi.location) html += `<div>${SVG_ICONS.mapPin} ${escapeHtml(pi.location)}</div>`;
    if (pi.phone) html += `<div>${SVG_ICONS.phone} ${escapeHtml(pi.phone)}</div>`;
    if (pi.email) html += `<div>${SVG_ICONS.mail} <a href="mailto:${escapeHtml(pi.email)}" style="color:#333;text-decoration:none">${escapeHtml(pi.email)}</a></div>`;
    if (pi.linkedin) html += `<div>${SVG_ICONS.linkedin} <a href="${escapeHtml(pi.linkedin)}" target="_blank" style="color:#333;text-decoration:none">${escapeHtml(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</a></div>`;
    html += `</div>`;

    const leftHdr = (label: string, iconHtml: string) => `
      <div style="display:flex;align-items:center;margin:24px 0 8px;border-bottom:1.5px solid #e2e8f0;padding-bottom:4px;">
        ${iconHtml}
        <span style="font-size:13.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#111;">${escapeHtml(label)}</span>
      </div>
    `;

    // Left Summary
    if (data.summary) {
      html += leftHdr("Summary", SVG_ICONS.user);
      html += `<p style="font-size:12px;color:#444;line-height:1.5;margin:0;text-align:justify;">${escapeHtml(data.summary)}</p>`;
    }

    // Left Education
    if ((data.education || []).length > 0) {
      html += leftHdr("Education", SVG_ICONS.education);
      data.education!.forEach(edu => {
        const dateStr = formatDateRange(edu.startDate, edu.endDate) || (edu.year || "");
        html += `
          <div style="margin-bottom:10px;font-size:12px;">
            <div style="font-weight:700;color:#111;">${escapeHtml(edu.degree)}</div>
            <div style="color:#444;">${escapeHtml(edu.school)}</div>
            <div style="color:#666;font-size:11px;">${escapeHtml(dateStr)} | Jouy-en-Josas, France</div>
          </div>
        `;
      });
    }

    // Left Languages
    if ((data.languages || []).length > 0) {
      html += leftHdr("Languages", SVG_ICONS.languages);
      data.languages!.forEach(l => {
        html += `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:12px;">
            <span style="font-weight:500;color:#111;">${escapeHtml(l.name)}</span>
            ${getUnicodeRatingDots(l.proficiency)}
          </div>
        `;
      });
    }

    // Left Skills
    if ((data.skills || []).length > 0) {
      html += leftHdr("Skills", SVG_ICONS.skills);
      html += `<ul style="margin:0;padding:0;list-style:none;">`;
      data.skills!.forEach(s => {
        html += `<li style="margin-bottom:4px;font-size:12px;color:#333;">• ${escapeHtml(s)}</li>`;
      });
      html += `</ul>`;
    }
    
    html += `</div>`; // end Left Column

    // ─── RIGHT COLUMN (62% width) ───
    html += `<div style="flex:1;padding-left:24px;">`;

    const rightHdr = (label: string, iconHtml: string) => `
      <div style="display:flex;align-items:center;margin:0 0 12px;border-bottom:1.5px solid #111;padding-bottom:4px;">
        ${iconHtml}
        <span style="font-size:14.5px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:#111;">${escapeHtml(label)}</span>
      </div>
    `;

    // Right Experience
    if ((data.experience || []).length > 0) {
      html += rightHdr("Professional Experience", SVG_ICONS.experience);
      data.experience!.forEach(exp => {
        const dateRange = formatDateRange(exp.startDate, exp.endDate);
        const bullets = exp.bullets?.length ? `<ul style="margin:4px 0 10px 16px;padding:0;list-style:disc">${exp.bullets.map(b => `<li style="margin-bottom:3px;font-size:12px;line-height:1.45;color:#333;">${escapeHtml(b)}</li>`).join("")}</ul>` : "";
        html += `
          <div style="margin-bottom:14px;page-break-inside:avoid;font-size:12px;">
            <div style="font-weight:700;color:#111;font-size:13px;">${escapeHtml(exp.title)}</div>
            <div style="color:#555;font-weight:500;">${escapeHtml(exp.company)}</div>
            <div style="color:#666;font-size:11px;margin-bottom:4px;">${escapeHtml(dateRange)} | ${escapeHtml(exp.location || "Paris, France")}</div>
            ${bullets}
          </div>
        `;
      });
    }

    // Projects or other Custom Sections
    const custom = (data.customSections || []).filter(c => c.title && c.items?.length);
    if (custom.length > 0) {
      custom.forEach(sec => {
        const isCert = sec.title.toLowerCase().includes("cert");
        const icon = isCert ? SVG_ICONS.award : SVG_ICONS.folder;
        html += rightHdr(sec.title, icon);
        
        if (isCert) {
          html += `<ul style="margin:0;padding:0;list-style:none;margin-bottom:16px;">`;
          sec.items.forEach(item => {
            html += `<li style="margin-bottom:5px;font-size:12px;color:#333;">• ${escapeHtml(item)}</li>`;
          });
          html += `</ul>`;
        } else {
          // Projects style
          sec.items.forEach(item => {
            // Split title and desc if separated by ":"
            const idx = item.indexOf(":");
            if (idx > 0) {
              const name = item.substring(0, idx);
              const desc = item.substring(idx + 1);
              html += `
                <div style="margin-bottom:12px;font-size:12px;">
                  <strong style="color:#111;">${escapeHtml(name)}</strong>
                  <p style="margin:2px 0 0;color:#444;line-height:1.45;">${escapeHtml(desc)}</p>
                </div>
              `;
            } else {
              html += `
                <div style="margin-bottom:10px;font-size:12px;">
                  <p style="margin:0;color:#333;">• ${escapeHtml(item)}</p>
                </div>
              `;
            }
          });
        }
      });
    }

    html += `</div>`; // end Right Column
    html += `</div>`; // end Container

    return [html];
  }

  // 5. ATS Olivia (Olivia Bennett layout)
  if (config.id === "ats-olivia") {
    const blocks: string[] = [];
    const contactParts: string[] = [];
    if (pi.location) contactParts.push(`${SVG_ICONS.mapPin} ${escapeHtml(pi.location)}`);
    if (pi.email) contactParts.push(`${SVG_ICONS.mail} <a href="mailto:${escapeHtml(pi.email)}" style="color:#222;text-decoration:none">${escapeHtml(pi.email)}</a>`);
    if (pi.phone) contactParts.push(`${SVG_ICONS.phone} ${escapeHtml(pi.phone)}`);
    if (pi.linkedin) contactParts.push(`${SVG_ICONS.linkedin} <a href="${escapeHtml(pi.linkedin)}" target="_blank" style="color:#222;text-decoration:none">${escapeHtml(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</a>`);

    // Centered Header Block
    let header = `<div style="font-family:${config.fontFamilyCSS};padding:${marginCss} ${marginCss} 0;text-align:center;color:#111;">`;
    header += `<div style="font-size:${nameCss};font-weight:700;color:${primary};margin-bottom:4px;font-family:${config.fontFamilyCSS}">${escapeHtml(pi.fullName || title || "Resume")}</div>`;
    header += `<div style="font-size:${config.baseFontSize * 1.5}px;font-weight:500;color:#555;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;font-family:${config.fontFamilyCSS}">${escapeHtml(pi.title || "Head of Customer Service")}</div>`;
    if (contactParts.length) {
      header += `<div style="font-size:11.5px;color:#333;display:flex;justify-content:center;gap:16px;flex-wrap:wrap;font-family:${config.fontFamilyCSS}">${contactParts.join(" ")}</div>`;
    }
    header += `</div>`;
    blocks.push(header);

    const blockWrap = (content: string) => `<div style="font-family:${config.fontFamilyCSS};padding:0 ${marginCss};color:#111;line-height:1.5">${content}</div>`;
    
    // Thin double borders above/below headers
    const sectionHdr = (label: string) => `
      <div style="margin:22px 0 10px;text-align:center;page-break-inside:avoid;">
        <div style="border-top: 1.5px solid ${primary}; border-bottom: 1.5px solid ${primary}; padding: 4px 0;">
          <span style="font-size:${headCss};font-weight:800;letter-spacing:1px;text-transform:uppercase;color:${primary};font-family:${config.fontFamilyCSS}">${escapeHtml(label)}</span>
        </div>
      </div>
    `;

    // Render sections
    config.sectionOrder.forEach(sec => {
      if (sec === "summary" && data.summary) {
        blocks.push(blockWrap(`${sectionHdr("Summary")}<p style="font-size:${fsCss};line-height:1.55;margin:0;font-family:${config.fontFamilyCSS};text-align:center;">${escapeHtml(data.summary)}</p>`));
      } else if (sec === "experience" && (data.experience || []).length > 0) {
        let expContent = sectionHdr("Experience");
        data.experience!.forEach(exp => {
          const dateRange = formatDateRange(exp.startDate, exp.endDate);
          const bullets = exp.bullets?.length ? `<ul style="margin:4px 0 0 20px;padding:0;list-style:disc">${exp.bullets.map(b => `<li style="margin-bottom:3.5px;font-size:${fsCss};line-height:1.5;font-family:${config.fontFamilyCSS}">${escapeHtml(b)}</li>`).join("")}</ul>` : "";
          expContent += `
            <div style="margin-bottom:14px;page-break-inside:avoid;">
              <div style="display:flex;justify-content:space-between;align-items:baseline;font-weight:bold;font-size:${fsCss}">
                <div>${escapeHtml(exp.title)}</div>
                <div style="font-weight:normal;font-size:12px;color:#333">${escapeHtml(dateRange)}</div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:baseline;font-style:italic;font-size:${fsCss};color:#555;">
                <div>${escapeHtml(exp.company)}</div>
                <div style="font-style:normal;font-size:12px;color:#555">${escapeHtml(exp.location || "")}</div>
              </div>
              ${bullets}
            </div>
          `;
        });
        blocks.push(blockWrap(expContent));
      } else if (sec === "education" && (data.education || []).length > 0) {
        let eduContent = sectionHdr("Education");
        data.education!.forEach(edu => {
          const dateStr = formatDateRange(edu.startDate, edu.endDate) || (edu.year || "");
          eduContent += `
            <div style="margin-bottom:10px;page-break-inside:avoid;">
              <div style="display:flex;justify-content:space-between;align-items:baseline;font-weight:bold;font-size:${fsCss}">
                <div>${escapeHtml(edu.degree)}</div>
                <div style="font-weight:normal;font-size:12px;color:#333">${escapeHtml(dateStr)}</div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:baseline;font-style:italic;font-size:${fsCss};color:#555;">
                <div>${escapeHtml(edu.school)}</div>
                <div style="font-style:normal;font-size:12px;color:#555">${escapeHtml(edu.location || "")}</div>
              </div>
            </div>
          `;
        });
        blocks.push(blockWrap(eduContent));
      } else if (sec === "skills" && (data.skills || []).length > 0) {
        let skillsHtml = sectionHdr("Skills");
        skillsHtml += `<div style="display:grid;grid-template-columns: repeat(4, 1fr);gap:6px 12px;font-size:${fsCss};">`;
        data.skills!.forEach(s => {
          skillsHtml += `<div style="text-align:center;">• ${escapeHtml(s)}</div>`;
        });
        skillsHtml += `</div>`;
        blocks.push(blockWrap(skillsHtml));
      } else if (sec === "languages" && (data.languages || []).length > 0) {
        let langHtml = sectionHdr("Languages");
        langHtml += `<div style="display:grid;grid-template-columns: repeat(4, 1fr);gap:6px 12px;font-size:${fsCss};">`;
        data.languages!.forEach(l => {
          langHtml += `<div style="text-align:center;"><strong>${escapeHtml(l.name)}</strong>${l.proficiency ? `<br/><span style="font-size:11px;color:#555;">${escapeHtml(l.proficiency)}</span>` : ""}</div>`;
        });
        langHtml += `</div>`;
        blocks.push(blockWrap(langHtml));
      } else if (sec === "custom" && (data.customSections || []).length > 0) {
        data.customSections!.forEach(sec => {
          if (!sec.title || !sec.items?.length) return;
          let customHtml = sectionHdr(sec.title);
          const isGrid = sec.title.toLowerCase().includes("cert") || sec.title.toLowerCase().includes("award") || sec.title.toLowerCase().includes("skill");
          if (isGrid) {
            customHtml += `<div style="display:grid;grid-template-columns: repeat(4, 1fr);gap:6px 12px;font-size:${fsCss};">`;
            sec.items.forEach(item => {
              customHtml += `<div style="text-align:center;">• ${escapeHtml(item)}</div>`;
            });
            customHtml += `</div>`;
          } else {
            customHtml += `<ul style="margin:4px 0 0 20px;padding:0;list-style:disc">`;
            sec.items.forEach(item => {
              customHtml += `<li style="margin-bottom:3.5px;font-size:${fsCss}">${escapeHtml(item)}</li>`;
            });
            customHtml += `</ul>`;
          }
          blocks.push(blockWrap(customHtml));
        });
      }
    });
    return blocks;
  }

  // Fallback to standard config-driven layout (if any new layout is introduced)
  const blocks: string[] = [];
  const contactParts = [pi.email, pi.phone, pi.location].filter(Boolean);
  const blockWrap = (content: string) => `<div style="font-family:${config.fontFamilyCSS};padding:0 ${marginCss};color:#222;line-height:1.5">${content}</div>`;

  // Header Block
  let header = `<div style="padding-top:${marginCss};font-size:${nameCss};font-weight:800;margin-bottom:8px;font-family:${config.fontFamilyCSS};color:${primary};letter-spacing:-1px">${escapeHtml(pi.fullName || title || "Resume")}</div>`;
  if (contactParts.length) header += `<p style="font-size:13px;color:#555;margin:0 0 15px;font-family:${config.fontFamilyCSS}">${contactParts.join("  |  ")}</p>`;
  blocks.push(blockWrap(header));

  const sectionHdr = (label: string) => `<div style="margin:25px 0 10px;border-bottom:1.5px solid ${primary};padding-bottom:4px"><span style="font-size:${headCss};font-weight:700;font-family:${config.fontFamilyCSS};color:${primary};text-transform:uppercase;letter-spacing:1px">${escapeHtml(label)}</span></div>`;

  const renderSummary = () => {
    if (data.summary) {
      blocks.push(blockWrap(`${sectionHdr("Summary")}<p style="font-size:${fsCss};line-height:1.6;margin:0;font-family:${config.fontFamilyCSS}">${escapeHtml(data.summary)}</p>`));
    }
  };

  const renderExperience = () => {
    if ((data.experience || []).length > 0) {
      blocks.push(blockWrap(sectionHdr("Experience")));
      data.experience!.forEach(exp => {
        const dateStr = formatDateRange(exp.startDate, exp.endDate);
        const bullets = exp.bullets?.length ? `<ul style="margin:6px 0 0 24px;padding:0;list-style:disc">${exp.bullets.map(b => `<li style="margin-bottom:4px;font-size:${fsCss};line-height:1.6;font-family:${config.fontFamilyCSS}">${escapeHtml(b)}</li>`).join("")}</ul>` : "";
        blocks.push(blockWrap(`<div style="margin-bottom:15px"><div style="display:flex;justify-content:space-between;align-items:baseline"><div><strong style="font-size:${fsCss};font-family:${config.fontFamilyCSS}">${escapeHtml(exp.title)}</strong><span style="font-size:${fsCss};font-family:${config.fontFamilyCSS}"> — ${escapeHtml(exp.company)}</span></div>${dateStr ? `<span style="font-size:12px;color:#666;white-space:nowrap;font-family:${config.fontFamilyCSS}">${escapeHtml(dateStr)}</span>` : ""}</div>${bullets}</div>`));
      });
    }
  };

  const renderEducation = () => {
    if ((data.education || []).length > 0) {
      blocks.push(blockWrap(sectionHdr("Education")));
      data.education!.forEach(edu => {
        const dateStr = formatDateRange(edu.startDate, edu.endDate) || (edu.year || "");
        blocks.push(blockWrap(`<div style="display:flex;justify-content:space-between;align-items:baseline;margin:4px 0"><div><strong style="font-size:${fsCss};font-family:${config.fontFamilyCSS}">${escapeHtml(edu.degree)}</strong> — ${escapeHtml(edu.school)}</div>${dateStr ? `<span style="font-size:12px;color:#666;white-space:nowrap;font-family:${config.fontFamilyCSS}">${escapeHtml(dateStr)}</span>` : ""}</div>`));
      });
    }
  };

  const renderSkills = () => {
    if ((data.skills || []).length > 0) {
      blocks.push(blockWrap(`${sectionHdr("Skills")}<p style="font-size:${fsCss};margin:0;font-family:${config.fontFamilyCSS}">${escapeHtml(data.skills!.join("  •  "))}</p>`));
    }
  };

  const renderLanguages = () => {
    const langs = (data.languages || []).filter(l => l.name);
    if (langs.length > 0) {
      const langText = langs.map(l => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ""}`).join("  •  ");
      blocks.push(blockWrap(`${sectionHdr("Languages")}<p style="font-size:${fsCss};margin:0;font-family:${config.fontFamilyCSS}">${escapeHtml(langText)}</p>`));
    }
  };

  const renderCustom = () => {
    (data.customSections || []).filter(s => s.title).forEach(sec => {
      let content = `${sectionHdr(sec.title)}`;
      if (sec.items?.length) {
        content += `<ul style="margin:6px 0 0 24px;padding:0;list-style:disc">${sec.items.filter(Boolean).map(item => `<li style="margin-bottom:4px;font-size:${fsCss};line-height:1.6;font-family:${config.fontFamilyCSS}">${escapeHtml(item)}</li>`).join("")}</ul>`;
      }
      blocks.push(blockWrap(content));
    });
  };

  const sectionMap: Record<string, () => void> = {
    summary: renderSummary,
    skills: renderSkills,
    experience: renderExperience,
    education: renderEducation,
    languages: renderLanguages,
    custom: renderCustom
  };

  config.sectionOrder.forEach(sec => {
    if (config.sectionVisibility[sec] !== false) {
      sectionMap[sec]?.();
    }
  });

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

// ─── Creative Custom HTML Renderers ───────────────────────────────────────────

function buildCreativeBrianHTML(data: ResumeData, title: string): string {
  const pi = data.personalInfo || {};
  const name = escapeHtml(pi.fullName || title || "Brian T. Wayne");
  const jobTitle = escapeHtml(pi.title || "Business Development Consultant");
  
  const contactHTML = [
    pi.email ? `<div>${SVG_ICONS.mail} <a href="mailto:${escapeHtml(pi.email)}" style="color:white;text-decoration:none">${escapeHtml(pi.email)}</a></div>` : "",
    pi.phone ? `<div>${SVG_ICONS.phone} ${escapeHtml(pi.phone)}</div>` : "",
    pi.location ? `<div>${SVG_ICONS.mapPin} ${escapeHtml(pi.location)}</div>` : "",
    pi.linkedin ? `<div>${SVG_ICONS.linkedin} <a href="${escapeHtml(pi.linkedin)}" target="_blank" style="color:white;text-decoration:none">${escapeHtml(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</a></div>` : "",
    pi.portfolio ? `<div><svg style="width:11px;height:11px;display:inline-block;vertical-align:middle;margin-right:4px;color:#fff;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg> ${escapeHtml(pi.portfolio.replace(/^https?:\/\/(www\.)?/, ''))}</div>` : ""
  ].filter(Boolean).join("");

  const photoHTML = pi.photoUrl ? `<img src="${escapeHtml(pi.photoUrl)}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:4px solid rgba(255,255,255,0.15);margin:0 auto 20px;display:block;box-shadow:0 4px 12px rgba(0,0,0,0.15)"/>` : "";

  let languagesHTML = "";
  if ((data.languages || []).length > 0) {
    languagesHTML = `<div style="background:rgba(255,255,255,0.15);padding:5px 12px;border-radius:4px;text-align:center;font-weight:bold;font-size:11px;margin-top:20px;margin-bottom:12px;letter-spacing:1px;text-transform:uppercase;">LANGUAGES</div>`;
    languagesHTML += `<div style="display:flex;flex-direction:column;gap:8px;font-size:12px;">`;
    data.languages!.forEach(l => {
      languagesHTML += `<div style="display:flex;justify-content:space-between;align-items:center;">
        <span>${escapeHtml(l.name)}</span>
        <span>${getUnicodeRatingDots(l.proficiency || "3")}</span>
      </div>`;
    });
    languagesHTML += `</div>`;
  }

  let awardsHTML = "";
  const certificates = (data.customSections || []).find(s => s.title?.toLowerCase().includes("award") || s.title?.toLowerCase().includes("certificate"));
  if (certificates && certificates.items.length > 0) {
    awardsHTML = `<div style="background:rgba(255,255,255,0.15);padding:5px 12px;border-radius:4px;text-align:center;font-weight:bold;font-size:11px;margin-top:24px;margin-bottom:12px;letter-spacing:1px;text-transform:uppercase;">AWARDS</div>`;
    awardsHTML += `<div style="font-size:11.5px;line-height:1.4;display:flex;flex-direction:column;gap:8px;">`;
    certificates.items.forEach(item => {
      awardsHTML += `<div>${escapeHtml(item)}</div>`;
    });
    awardsHTML += `</div>`;
  }

  let expHTML = "";
  if ((data.experience || []).length > 0) {
    expHTML += `<div style="background:#f1f3f5;padding:6px 12px;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#111;margin-bottom:14px;border-radius:2px;display:flex;align-items:center;gap:6px;">${SVG_ICONS.experience} WORK EXPERIENCE</div>`;
    data.experience!.forEach(exp => {
      const dateRange = formatDateRange(exp.startDate, exp.endDate);
      const bullets = exp.bullets?.length ? `<ul style="margin:4px 0 0 16px;padding:0;list-style:disc">${exp.bullets.map(b => `<li style="margin-bottom:4px;font-size:13px;line-height:1.5">${escapeHtml(b)}</li>`).join("")}</ul>` : "";
      expHTML += `
        <div style="margin-bottom:18px;page-break-inside:avoid;">
          <div style="font-size:13.5px;font-weight:bold;color:#111;">${escapeHtml(exp.company)}</div>
          <div style="font-size:13px;color:#333;margin:2px 0;">${escapeHtml(exp.title)}</div>
          <div style="font-size:11.5px;color:#666;font-style:italic;">${escapeHtml(dateRange)} ${exp.location ? ` | ${escapeHtml(exp.location)}` : ""}</div>
          ${bullets}
        </div>
      `;
    });
  }

  let eduHTML = "";
  if ((data.education || []).length > 0) {
    eduHTML += `<div style="background:#f1f3f5;padding:6px 12px;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#111;margin-top:24px;margin-bottom:14px;border-radius:2px;display:flex;align-items:center;gap:6px;">${SVG_ICONS.education} EDUCATION</div>`;
    data.education!.forEach(edu => {
      const dateRange = formatDateRange(edu.startDate, edu.endDate) || edu.year || "";
      eduHTML += `
        <div style="margin-bottom:14px;page-break-inside:avoid;">
          <div style="font-size:13.5px;font-weight:bold;color:#111;">${escapeHtml(edu.degree)}</div>
          <div style="font-size:13px;color:#333;margin:2px 0;">${escapeHtml(edu.school)}</div>
          <div style="font-size:11.5px;color:#666;font-style:italic;">${escapeHtml(dateRange)}</div>
        </div>
      `;
    });
  }

  let skillsHTML = "";
  if ((data.skills || []).length > 0) {
    skillsHTML += `<div style="background:#f1f3f5;padding:6px 12px;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#111;margin-top:24px;margin-bottom:14px;border-radius:2px;display:flex;align-items:center;gap:6px;">${SVG_ICONS.skills} SKILLS</div>`;
    skillsHTML += `<ul style="margin:4px 0 0 16px;padding:0;list-style:disc;font-size:13px;line-height:1.5;">`;
    data.skills!.forEach(s => {
      skillsHTML += `<li style="margin-bottom:4px">${escapeHtml(s)}</li>`;
    });
    skillsHTML += `</ul>`;
  }

  return `
    <div style="display:flex;font-family:'Times New Roman',Times,serif;min-height:1123px;color:#222;line-height:1.45;background:#ffffff;">
      <div style="width:35%;background:#1e2d3d;color:#ffffff;padding:40px 20px;display:flex;flex-direction:column;">
        ${photoHTML}
        <div style="font-size:26px;font-weight:bold;margin-bottom:4px;text-align:center;line-height:1.15;letter-spacing:-0.5px;">${name}</div>
        <div style="font-size:13px;text-align:center;margin-bottom:24px;font-style:italic;opacity:0.9;">${jobTitle}</div>
        
        <div style="display:flex;flex-direction:column;gap:8px;font-size:11px;opacity:0.95;margin-bottom:20px;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;">
          ${contactHTML}
        </div>
        
        ${data.summary ? `
          <div style="background:rgba(255,255,255,0.15);padding:5px 12px;border-radius:4px;text-align:center;font-weight:bold;font-size:11px;margin-top:16px;margin-bottom:12px;letter-spacing:1px;text-transform:uppercase;">PROFILE</div>
          <div style="font-size:11.5px;line-height:1.5;text-align:justify;opacity:0.9;">${escapeHtml(data.summary)}</div>
        ` : ""}
        
        ${languagesHTML}
        ${awardsHTML}
      </div>
      
      <div style="flex:1;padding:40px 30px;background:#ffffff;display:flex;flex-direction:column;">
        ${expHTML}
        ${eduHTML}
        ${skillsHTML}
      </div>
    </div>
  `;
}

function buildCreativeCamilaHTML(data: ResumeData, title: string): string {
  const pi = data.personalInfo || {};
  const name = escapeHtml(pi.fullName || title || "Camila Rivera");
  const jobTitle = escapeHtml(pi.title || "Sales Manager");

  const contactItems: string[] = [];
  if (pi.email) contactItems.push(`<div>${SVG_ICONS.mail} <a href="mailto:${escapeHtml(pi.email)}" style="color:#555;text-decoration:none">${escapeHtml(pi.email)}</a></div>`);
  if (pi.phone) contactItems.push(`<div>${SVG_ICONS.phone} ${escapeHtml(pi.phone)}</div>`);
  if (pi.linkedin) contactItems.push(`<div>${SVG_ICONS.linkedin} <a href="${escapeHtml(pi.linkedin)}" target="_blank" style="color:#555;text-decoration:none">${escapeHtml(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</a></div>`);
  if (pi.location) contactItems.push(`<div>${SVG_ICONS.mapPin} ${escapeHtml(pi.location)}</div>`);

  const photoHTML = pi.photoUrl ? `<img src="${escapeHtml(pi.photoUrl)}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.1)"/>` : "";

  const sectionHdr = (label: string) => `
    <div style="background:#eef1f5;padding:6px 0;text-align:center;font-size:13px;font-weight:700;color:#333;letter-spacing:1px;margin-top:24px;margin-bottom:14px;text-transform:uppercase;">
      ${escapeHtml(label)}
    </div>
  `;

  let expHTML = "";
  if ((data.experience || []).length > 0) {
    expHTML += sectionHdr("Professional Experience");
    data.experience!.forEach(exp => {
      const dateRange = formatDateRange(exp.startDate, exp.endDate);
      const bullets = exp.bullets?.length ? `<ul style="margin:4px 0 0 16px;padding:0;list-style:disc">${exp.bullets.map(b => `<li style="margin-bottom:3.5px;font-size:13px;line-height:1.45">${escapeHtml(b)}</li>`).join("")}</ul>` : "";
      expHTML += `
        <div style="display:flex;gap:20px;margin-bottom:14px;page-break-inside:avoid;">
          <div style="width:25%;font-size:11.5px;color:#555;line-height:1.4;">
            <div>${escapeHtml(dateRange)}</div>
            <div style="font-style:italic;">${escapeHtml(exp.location || "Miami, USA")}</div>
          </div>
          <div style="width:75%;">
            <div style="font-size:13.5px;color:#111;"><strong style="font-weight:700;">${escapeHtml(exp.company)}</strong>, <span style="font-style:italic;color:#444;">${escapeHtml(exp.title)}</span></div>
            ${bullets}
          </div>
        </div>
      `;
    });
  }

  let eduHTML = "";
  if ((data.education || []).length > 0) {
    eduHTML += sectionHdr("Education");
    data.education!.forEach(edu => {
      const dateRange = formatDateRange(edu.startDate, edu.endDate) || edu.year || "";
      eduHTML += `
        <div style="display:flex;gap:20px;margin-bottom:12px;page-break-inside:avoid;">
          <div style="width:25%;font-size:11.5px;color:#555;line-height:1.4;">
            <div>${escapeHtml(dateRange)}</div>
          </div>
          <div style="width:75%;">
            <div style="font-size:13.5px;color:#111;"><strong style="font-weight:700;">${escapeHtml(edu.degree)}</strong>, <span style="font-style:italic;color:#444;">${escapeHtml(edu.school)}</span></div>
          </div>
        </div>
      `;
    });
  }

  let skillsHTML = "";
  if ((data.skills || []).length > 0) {
    skillsHTML += sectionHdr("Skills");
    skillsHTML += `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px 16px;font-size:12.5px;color:#333;padding:0 10px;">`;
    data.skills!.forEach(s => {
      skillsHTML += `<div>• ${escapeHtml(s)}</div>`;
    });
    skillsHTML += `</div>`;
  }

  let languagesHTML = "";
  if ((data.languages || []).length > 0) {
    languagesHTML += sectionHdr("Languages");
    languagesHTML += `<div style="display:flex;justify-content:space-around;font-size:12.5px;color:#333;padding:0 40px;">`;
    data.languages!.forEach(l => {
      languagesHTML += `<div style="display:flex;align-items:center;gap:12px;">
        <span style="font-weight:500;">${escapeHtml(l.name)}</span>
        <span>${getUnicodeRatingDots(l.proficiency || "3")}</span>
      </div>`;
    });
    languagesHTML += `</div>`;
  }

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#222;line-height:1.5;min-height:1123px;background:#ffffff;padding:0;">
      <div style="background:#eef1f5;padding:30px 40px;display:flex;align-items:center;gap:24px;">
        ${photoHTML}
        <div style="flex:1;">
          <div style="font-size:26px;font-weight:bold;color:#2c3e50;line-height:1.1;">${name}</div>
          <div style="font-size:14px;color:#7f8c8d;font-weight:500;margin-top:4px;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;">${jobTitle}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;font-size:12px;color:#555;">
            ${contactItems.join("")}
          </div>
        </div>
      </div>
      
      <div style="padding:20px 40px 40px;">
        ${data.summary ? `
          ${sectionHdr("Summary")}
          <p style="font-size:13px;line-height:1.55;color:#333;margin:0;text-align:justify;">${escapeHtml(data.summary)}</p>
        ` : ""}
        
        ${expHTML}
        ${eduHTML}
        ${skillsHTML}
        ${languagesHTML}
      </div>
    </div>
  `;
}

function buildCreativeRohanHTML(data: ResumeData, title: string): string {
  const pi = data.personalInfo || {};
  const name = escapeHtml(pi.fullName || title || "Rohan K. Patel");
  const jobTitle = escapeHtml(pi.title || "Project Engineer");

  const contactItems: string[] = [];
  if (pi.email) contactItems.push(`<div>${SVG_ICONS.mail} <a href="mailto:${escapeHtml(pi.email)}" style="color:#444;text-decoration:none">${escapeHtml(pi.email)}</a></div>`);
  if (pi.phone) contactItems.push(`<div>${SVG_ICONS.phone} ${escapeHtml(pi.phone)}</div>`);
  if (pi.linkedin) contactItems.push(`<div>${SVG_ICONS.linkedin} <a href="${escapeHtml(pi.linkedin)}" target="_blank" style="color:#444;text-decoration:none">${escapeHtml(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</a></div>`);
  if (pi.location) contactItems.push(`<div>${SVG_ICONS.mapPin} ${escapeHtml(pi.location)}</div>`);
  if (pi.nationality || data.languages?.[0]?.name) {
    contactItems.push(`<div>${SVG_ICONS.user} Indian</div>`);
  }
  contactItems.push(`<div><svg style="width:11px;height:11px;display:inline-block;vertical-align:middle;margin-right:4px;color:#555;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> 15.07.2002</div>`);

  const photoHTML = pi.photoUrl ? `<img src="${escapeHtml(pi.photoUrl)}" style="width:105px;height:105px;border-radius:50%;object-fit:cover;border:1px solid #ddd;"/>` : "";

  const sectionHdr = (label: string) => `
    <div style="background:#f0f4f8;padding:6px 12px;font-size:13px;font-weight:bold;color:#0a3a60;border-left:4px solid #0a3a60;margin-top:20px;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px;">
      ${escapeHtml(label)}
    </div>
  `;

  let expHTML = "";
  if ((data.experience || []).length > 0) {
    expHTML += sectionHdr("Professional Experience");
    data.experience!.forEach(exp => {
      const dateRange = formatDateRange(exp.startDate, exp.endDate);
      const bullets = exp.bullets?.length ? `<ul style="margin:4px 0 0 16px;padding:0;list-style:disc">${exp.bullets.map(b => `<li style="margin-bottom:3.5px;font-size:12.5px;line-height:1.45;color:#333;">${escapeHtml(b)}</li>`).join("")}</ul>` : "";
      expHTML += `
        <div style="display:flex;gap:20px;margin-bottom:14px;page-break-inside:avoid;">
          <div style="width:25%;font-size:11.5px;color:#555;line-height:1.4;">
            <div style="font-weight:600;color:#0a3a60;">${escapeHtml(dateRange)}</div>
            <div>${escapeHtml(exp.location || "Ahmedabad, India")}</div>
          </div>
          <div style="width:75%;">
            <div style="font-size:13px;color:#111;"><strong style="font-weight:700;">${escapeHtml(exp.company)}</strong>, <span style="font-style:italic;color:#444;">${escapeHtml(exp.title)}</span></div>
            ${bullets}
          </div>
        </div>
      `;
    });
  }

  let eduHTML = "";
  if ((data.education || []).length > 0) {
    eduHTML += sectionHdr("Education");
    data.education!.forEach(edu => {
      const dateRange = formatDateRange(edu.startDate, edu.endDate) || edu.year || "";
      eduHTML += `
        <div style="display:flex;gap:20px;margin-bottom:12px;page-break-inside:avoid;">
          <div style="width:25%;font-size:11.5px;color:#555;line-height:1.4;">
            <div style="font-weight:600;color:#0a3a60;">${escapeHtml(dateRange)}</div>
            <div>Ahmedabad, India</div>
          </div>
          <div style="width:75%;">
            <div style="font-size:13px;color:#111;"><strong style="font-weight:700;">${escapeHtml(edu.degree)}</strong>, <span style="font-style:italic;color:#444;">${escapeHtml(edu.school)}</span></div>
          </div>
        </div>
      `;
    });
  }

  let skillsHTML = "";
  if ((data.skills || []).length > 0) {
    skillsHTML += sectionHdr("Skills");
    skillsHTML += `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px 12px;font-size:12.5px;color:#333;padding:0 10px;">`;
    data.skills!.forEach(s => {
      skillsHTML += `<div>• ${escapeHtml(s)}</div>`;
    });
    skillsHTML += `</div>`;
  }

  let languagesHTML = "";
  if ((data.languages || []).length > 0) {
    languagesHTML += sectionHdr("Languages");
    languagesHTML += `<div style="display:flex;gap:40px;font-size:12.5px;color:#333;padding:0 10px;">`;
    data.languages!.forEach(l => {
      languagesHTML += `<div>• ${escapeHtml(l.name)}</div>`;
    });
    languagesHTML += `</div>`;
  }

  let certHTML = "";
  const certificates = (data.customSections || []).find(s => s.title?.toLowerCase().includes("cert") || s.title?.toLowerCase().includes("award"));
  if (certificates && certificates.items.length > 0) {
    certHTML += sectionHdr("Certificates");
    certHTML += `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px 12px;font-size:12.5px;color:#333;padding:0 10px;">`;
    certificates.items.forEach(item => {
      certHTML += `<div>• ${escapeHtml(item)}</div>`;
    });
    certHTML += `</div>`;
  }

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#222;line-height:1.5;min-height:1123px;background:#ffffff;padding:40px 45px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #eee;padding-bottom:20px;">
        <div style="flex:1;padding-right:20px;">
          <div style="display:flex;align-items:baseline;gap:12px;">
            <div style="font-size:28px;font-weight:bold;color:#0a3a60;line-height:1.1;">${name}</div>
            <div style="font-size:15px;color:#0b4c7c;font-style:italic;">${jobTitle}</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;font-size:11.5px;color:#444;margin-top:12px;">
            ${contactItems.join("")}
          </div>
        </div>
        ${photoHTML}
      </div>
      
      ${data.summary ? `
        ${sectionHdr("Summary")}
        <p style="font-size:13px;line-height:1.55;color:#333;margin:0;text-align:justify;">${escapeHtml(data.summary)}</p>
      ` : ""}
      
      ${expHTML}
      ${eduHTML}
      ${skillsHTML}
      ${languagesHTML}
      ${certHTML}
    </div>
  `;
}

function buildCreativeCatherineHTML(data: ResumeData, title: string): string {
  const pi = data.personalInfo || {};
  const name = escapeHtml(pi.fullName || title || "Catherine Bale");
  const jobTitle = escapeHtml(pi.title || "Marketing Assistant");

  const contactItems: string[] = [];
  if (pi.email) contactItems.push(`<div>${SVG_ICONS.mail} <a href="mailto:${escapeHtml(pi.email)}" style="color:#333;text-decoration:none">${escapeHtml(pi.email)}</a></div>`);
  if (pi.phone) contactItems.push(`<div>${SVG_ICONS.phone} ${escapeHtml(pi.phone)}</div>`);
  if (pi.location) contactItems.push(`<div>${SVG_ICONS.mapPin} ${escapeHtml(pi.location)}</div>`);
  if (pi.linkedin) contactItems.push(`<div>${SVG_ICONS.linkedin} <a href="${escapeHtml(pi.linkedin)}" target="_blank" style="color:#333;text-decoration:none">${escapeHtml(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</a></div>`);

  const photoHTML = pi.photoUrl ? `<img src="${escapeHtml(pi.photoUrl)}" style="width:105px;height:105px;border-radius:6px;object-fit:cover;border:1px solid #eee;"/>` : "";

  const sectionHdr = (label: string) => `
    <div style="font-size: 15px; font-weight: 700; text-transform: none; border-bottom: 2px solid #333; padding-bottom: 4px; margin-top: 24px; margin-bottom: 12px; color: #111;">
      ${escapeHtml(label)}
    </div>
  `;

  let expHTML = "";
  if ((data.experience || []).length > 0) {
    expHTML += sectionHdr("Professional Experience");
    data.experience!.forEach(exp => {
      const dateRange = formatDateRange(exp.startDate, exp.endDate);
      const bullets = exp.bullets?.length ? `<ul style="margin:4px 0 0 16px;padding:0;list-style:disc">${exp.bullets.map(b => `<li style="margin-bottom:3.5px;font-size:13px;line-height:1.45;color:#333;">${escapeHtml(b)}</li>`).join("")}</ul>` : "";
      expHTML += `
        <div style="margin-bottom:14px;page-break-inside:avoid;font-size:13px;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <div><strong style="font-weight:700;color:#111;">${escapeHtml(exp.company)}</strong>, <span style="font-style:italic;color:#444;">${escapeHtml(exp.title)}</span></div>
            <div style="font-size:11.5px;color:#555;">${escapeHtml(dateRange)} | ${escapeHtml(exp.location || "Milwaukee")}</div>
          </div>
          ${bullets}
        </div>
      `;
    });
  }

  let eduHTML = "";
  if ((data.education || []).length > 0) {
    eduHTML += sectionHdr("Education");
    data.education!.forEach(edu => {
      const dateRange = formatDateRange(edu.startDate, edu.endDate) || edu.year || "";
      eduHTML += `
        <div style="margin-bottom:12px;page-break-inside:avoid;font-size:13px;display:flex;justify-content:space-between;align-items:baseline;">
          <div><strong style="font-weight:700;color:#111;">${escapeHtml(edu.school)}</strong>, <span style="font-style:italic;color:#444;">${escapeHtml(edu.degree)}</span></div>
          <div style="font-size:11.5px;color:#555;">${escapeHtml(dateRange)}</div>
        </div>
      `;
    });
  }

  let certHTML = "";
  const certificates = (data.customSections || []).find(s => s.title?.toLowerCase().includes("cert") || s.title?.toLowerCase().includes("award"));
  if (certificates && certificates.items.length > 0) {
    certHTML += sectionHdr("Certificates");
    certHTML += `<div style="font-size:13px;color:#333;line-height:1.5;">${certificates.items.join("  •  ")}</div>`;
  }

  let languagesHTML = "";
  if ((data.languages || []).length > 0) {
    languagesHTML += sectionHdr("Languages");
    languagesHTML += `<div style="font-size:13px;color:#333;line-height:1.5;">`;
    languagesHTML += data.languages!.map(l => `${escapeHtml(l.name)}${l.proficiency ? ` (${escapeHtml(l.proficiency)})` : ""}`).join("  •  ");
    languagesHTML += `</div>`;
  }

  let skillsHTML = "";
  if ((data.skills || []).length > 0) {
    skillsHTML += sectionHdr("Skills");
    const half = Math.ceil(data.skills!.length / 2);
    const col1 = data.skills!.slice(0, half);
    const col2 = data.skills!.slice(half);
    
    skillsHTML += `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;font-size:13px;line-height:1.5;color:#333;">
        <div>
          ${col1.map(s => `<div style="margin-bottom:6px;">• <strong>${escapeHtml(s)}</strong></div>`).join("")}
        </div>
        <div>
          ${col2.map(s => `<div style="margin-bottom:6px;">• <strong>${escapeHtml(s)}</strong></div>`).join("")}
        </div>
      </div>
    `;
  }

  let leavesHTML = "";
  const leafSVG = `<svg style="width:16px;height:16px;color:#2e7d32;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58 1 9.3A7 7 0 0 1 11 20z"/><path d="M19 2c-3 3-7.5 3.5-13.5 1"/></svg>`;
  for (let i = 0; i < 12; i++) {
    leavesHTML += `<div style="margin-bottom:60px;">${leafSVG}</div>`;
  }

  return `
    <div style="display:flex;font-family:Arial,Helvetica,sans-serif;min-height:1123px;color:#222;background:#ffffff;padding:0;">
      <div style="width:45px;background:#eef7f2;border-right:2px solid #2e7d32;display:flex;flex-direction:column;align-items:center;padding-top:40px;opacity:0.95;">
        ${leavesHTML}
      </div>
      <div style="flex:1;padding:40px 35px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;border-bottom:1px solid #eee;padding-bottom:20px;">
          <div>
            <div style="font-size:30px;font-weight:bold;color:#111;line-height:1.1;">${name}</div>
            <div style="font-size:15px;color:#555;font-style:italic;margin-top:4px;margin-bottom:12px;">${jobTitle}</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px 16px;font-size:11.5px;color:#444;">
              ${contactItems.join("  |  ")}
            </div>
          </div>
          ${photoHTML}
        </div>
        
        ${data.summary ? `
          ${sectionHdr("Profile")}
          <p style="font-size:13px;line-height:1.55;color:#333;margin:0;text-align:justify;">${escapeHtml(data.summary)}</p>
        ` : ""}
        
        ${expHTML}
        ${eduHTML}
        ${certHTML}
        ${languagesHTML}
        ${skillsHTML}
      </div>
    </div>
  `;
}

function buildCreativeMatteoHTML(data: ResumeData, title: string): string {
  const pi = data.personalInfo || {};
  const name = escapeHtml(pi.fullName || title || "Matteo Ricci");
  const jobTitle = escapeHtml(pi.title || "Head of Operations");

  const contactItems: string[] = [];
  if (pi.email) contactItems.push(`<div>${SVG_ICONS.mail} <a href="mailto:${escapeHtml(pi.email)}" style="color:#444;text-decoration:none">${escapeHtml(pi.email)}</a></div>`);
  if (pi.phone) contactItems.push(`<div>${SVG_ICONS.phone} ${escapeHtml(pi.phone)}</div>`);
  if (pi.location) contactItems.push(`<div>${SVG_ICONS.mapPin} ${escapeHtml(pi.location)}</div>`);
  if (pi.linkedin) contactItems.push(`<div>${SVG_ICONS.linkedin} <a href="${escapeHtml(pi.linkedin)}" target="_blank" style="color:#444;text-decoration:none">${escapeHtml(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</a></div>`);
  if (pi.nationality) contactItems.push(`<div>${SVG_ICONS.user} ${escapeHtml(pi.nationality)}</div>`);
  if (pi.dateOfBirth) contactItems.push(`<div><svg style="width:11px;height:11px;display:inline-block;vertical-align:middle;margin-right:4px;color:#555;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ${escapeHtml(pi.dateOfBirth)}</div>`);

  const photoHTML = pi.photoUrl ? `<img src="${escapeHtml(pi.photoUrl)}" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:1px solid #ddd;"/>` : "";

  const sectionHdr = (label: string) => `
    <div style="font-size: 13px; font-weight: 700; letter-spacing: 0.5px; border-bottom: 2.5px solid #e67e22; padding-bottom: 3px; margin-top: 20px; margin-bottom: 10px; color: #111; text-transform: uppercase; font-family: Georgia, serif;">
      ${escapeHtml(label)}
    </div>
  `;

  let expHTML = "";
  if ((data.experience || []).length > 0) {
    expHTML += sectionHdr("Professional Experience");
    data.experience!.forEach(exp => {
      const dateRange = formatDateRange(exp.startDate, exp.endDate);
      const bullets = exp.bullets?.length ? `<ul style="margin:4px 0 0 16px;padding:0;list-style:disc">${exp.bullets.map(b => `<li style="margin-bottom:3.5px;font-size:12.5px;line-height:1.45;color:#333;">${escapeHtml(b)}</li>`).join("")}</ul>` : "";
      expHTML += `
        <div style="margin-bottom:14px;page-break-inside:avoid;font-size:12.5px;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;font-weight:bold;color:#111;">
            <div>${escapeHtml(exp.title)}</div>
            <div style="font-weight:normal;font-size:11.5px;color:#666;">${escapeHtml(dateRange)}</div>
          </div>
          <div style="font-style:italic;color:#555;margin:2px 0;">${escapeHtml(exp.company)} | ${escapeHtml(exp.location || "Milan, Italy")}</div>
          ${bullets}
        </div>
      `;
    });
  }

  let eduHTML = "";
  if ((data.education || []).length > 0) {
    eduHTML += sectionHdr("Education");
    data.education!.forEach(edu => {
      const dateRange = formatDateRange(edu.startDate, edu.endDate) || edu.year || "";
      eduHTML += `
        <div style="margin-bottom:12px;page-break-inside:avoid;font-size:12.5px;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;font-weight:bold;color:#111;">
            <div>${escapeHtml(edu.degree)}</div>
            <div style="font-weight:normal;font-size:11.5px;color:#666;">${escapeHtml(dateRange)}</div>
          </div>
          <div style="font-style:italic;color:#555;margin:2px 0;">${escapeHtml(edu.school)}</div>
        </div>
      `;
    });
  }

  let skillsHTML = "";
  if ((data.skills || []).length > 0) {
    skillsHTML += sectionHdr("Skills");
    skillsHTML += `<div style="font-size:12.5px;line-height:1.5;color:#333;">`;
    data.skills!.forEach(s => {
      skillsHTML += `<div style="margin-bottom:4px;">• ${escapeHtml(s)}</div>`;
    });
    skillsHTML += `</div>`;
  }

  let languagesHTML = "";
  if ((data.languages || []).length > 0) {
    languagesHTML += sectionHdr("Languages");
    languagesHTML += `<div style="font-size:12.5px;line-height:1.5;color:#333;">`;
    data.languages!.forEach(l => {
      languagesHTML += `<div style="margin-bottom:4px;"><strong>${escapeHtml(l.name)}</strong>: ${escapeHtml(l.proficiency || "Fluent")}</div>`;
    });
    languagesHTML += `</div>`;
  }

  let certHTML = "";
  const certificates = (data.customSections || []).find(s => s.title?.toLowerCase().includes("cert") || s.title?.toLowerCase().includes("award"));
  if (certificates && certificates.items.length > 0) {
    certHTML += sectionHdr("Certificates");
    certHTML += `<div style="font-size:12.5px;line-height:1.5;color:#333;">`;
    certificates.items.forEach(item => {
      certHTML += `<div style="margin-bottom:4px;">• ${escapeHtml(item)}</div>`;
    });
    certHTML += `</div>`;
  }

  return `
    <div style="font-family:Georgia,serif;color:#222;line-height:1.5;min-height:1123px;background:#ffffff;padding:40px 45px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:1px solid #eee;padding-bottom:20px;">
        ${photoHTML}
        <div style="flex:1;padding-left:24px;">
          <div style="font-size:28px;font-weight:bold;color:#111;line-height:1.1;">${name}</div>
          <div style="font-size:15px;color:#555;font-style:italic;margin-top:4px;margin-bottom:12px;">${jobTitle}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;font-size:11.5px;color:#444;">
            ${contactItems.join("")}
          </div>
        </div>
      </div>
      
      <div style="display:flex;gap:32px;">
        <div style="width:35%;display:flex;flex-direction:column;">
          ${data.summary ? `
            ${sectionHdr("Summary")}
            <p style="font-size:12.5px;line-height:1.55;color:#333;margin:0;text-align:justify;">${escapeHtml(data.summary)}</p>
          ` : ""}
          ${skillsHTML}
          ${languagesHTML}
          ${certHTML}
        </div>
        <div style="flex:1;display:flex;flex-direction:column;">
          ${expHTML}
          ${eduHTML}
        </div>
      </div>
    </div>
  `;
}

function buildCreativeMariaHTML(data: ResumeData, title: string): string {
  const pi = data.personalInfo || {};
  const name = escapeHtml(pi.fullName || title || "Maria Teresa Villanueva");
  const jobTitle = escapeHtml(pi.title || "Head of Operations");
  const primary = "#e67e22"; // Orange accent
  const darkGray = "#2c3e50"; // Dark gray header background

  const contactItems: string[] = [];
  if (pi.email) contactItems.push(`<div>${SVG_ICONS.mail} <a href="mailto:${escapeHtml(pi.email)}" style="color:white;text-decoration:none">${escapeHtml(pi.email)}</a></div>`);
  if (pi.phone) contactItems.push(`<div>${SVG_ICONS.phone} ${escapeHtml(pi.phone)}</div>`);
  if (pi.linkedin) contactItems.push(`<div>${SVG_ICONS.linkedin} <a href="${escapeHtml(pi.linkedin)}" target="_blank" style="color:white;text-decoration:none">${escapeHtml(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</a></div>`);
  if (pi.location) contactItems.push(`<div>${SVG_ICONS.mapPin} ${escapeHtml(pi.location)}</div>`);

  const photoHTML = pi.photoUrl ? `<img src="${escapeHtml(pi.photoUrl)}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid ${primary};"/>` : "";

  const sectionHdr = (label: string, iconHtml: string) => `
    <div style="display:flex;align-items:center;gap:8px;border-bottom:2px solid ${primary};padding-bottom:6px;margin-top:24px;margin-bottom:14px;page-break-inside:avoid;">
      <span style="color:${primary};display:inline-flex;align-items:center;">${iconHtml}</span>
      <span style="font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#111;">${escapeHtml(label)}</span>
    </div>
  `;

  let expHTML = "";
  if ((data.experience || []).length > 0) {
    expHTML += sectionHdr("Professional Experience", SVG_ICONS.experience);
    data.experience!.forEach(exp => {
      const dateRange = formatDateRange(exp.startDate, exp.endDate);
      const bullets = exp.bullets?.length ? `<ul style="margin:4px 0 0 16px;padding:0;list-style:disc">${exp.bullets.map(b => `<li style="margin-bottom:3.5px;font-size:13px;line-height:1.45">${escapeHtml(b)}</li>`).join("")}</ul>` : "";
      expHTML += `
        <div style="margin-bottom:14px;page-break-inside:avoid;font-size:13px;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <div><strong style="color:#111;">${escapeHtml(exp.title)}</strong> — <span style="font-style:italic;color:#444;">${escapeHtml(exp.company)}</span></div>
            <div style="font-size:11.5px;color:#555;">${escapeHtml(dateRange)}</div>
          </div>
          <div style="font-size:11.5px;color:#666;font-style:italic;margin-top:2px;">${escapeHtml(exp.location || "")}</div>
          ${bullets}
        </div>
      `;
    });
  }

  let eduHTML = "";
  if ((data.education || []).length > 0) {
    eduHTML += sectionHdr("Education", SVG_ICONS.education);
    data.education!.forEach(edu => {
      const dateRange = formatDateRange(edu.startDate, edu.endDate) || edu.year || "";
      eduHTML += `
        <div style="margin-bottom:12px;page-break-inside:avoid;font-size:13px;display:flex;justify-content:space-between;align-items:baseline;">
          <div><strong style="color:#111;">${escapeHtml(edu.degree)}</strong>, <span style="font-style:italic;color:#444;">${escapeHtml(edu.school)}</span></div>
          <div style="font-size:11.5px;color:#555;">${escapeHtml(dateRange)}</div>
        </div>
      `;
    });
  }

  let skillsHTML = "";
  if ((data.skills || []).length > 0) {
    skillsHTML += sectionHdr("Skills", SVG_ICONS.skills);
    skillsHTML += `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px 12px;font-size:13px;line-height:1.45;">`;
    data.skills!.forEach(s => {
      skillsHTML += `<div style="display:flex;align-items:baseline;gap:6px;color:#333;">
        <span style="color:${primary};font-size:14px;line-height:1;">•</span>
        <span>${escapeHtml(s)}</span>
      </div>`;
    });
    skillsHTML += `</div>`;
  }

  let languagesHTML = "";
  if ((data.languages || []).length > 0) {
    languagesHTML += sectionHdr("Languages", SVG_ICONS.languages);
    languagesHTML += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;font-size:12.5px;">`;
    data.languages!.forEach(l => {
      languagesHTML += `<div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:600;color:#333;">${escapeHtml(l.name)}</span>
        <span>${getUnicodeRatingDots(l.proficiency || "3")}</span>
      </div>`;
    });
    languagesHTML += `</div>`;
  }

  let customHTML = "";
  (data.customSections || []).filter(c => c.title && c.items?.length).forEach(sec => {
    customHTML += sectionHdr(sec.title, SVG_ICONS.folder);
    if (sec.title.toLowerCase().includes("certif")) {
      customHTML += `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px 12px;font-size:13px;line-height:1.45;">`;
      sec.items.forEach(item => {
        customHTML += `<div style="display:flex;align-items:baseline;gap:6px;color:#333;">
          <span style="color:${primary};font-size:14px;line-height:1;">•</span>
          <span>${escapeHtml(item)}</span>
        </div>`;
      });
      customHTML += `</div>`;
    } else {
      customHTML += `<ul style="margin:4px 0 0 16px;padding:0;list-style:disc;font-size:13px;line-height:1.45;">`;
      sec.items.forEach(item => {
        customHTML += `<li style="margin-bottom:4.5px;">${escapeHtml(item)}</li>`;
      });
      customHTML += `</ul>`;
    }
  });

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#222;line-height:1.5;min-height:1123px;background:#ffffff;padding:0;">
      <div style="background:${darkGray};padding:35px 40px;color:#ffffff;display:flex;justify-content:space-between;align-items:center;">
        <div style="flex:1;padding-right:24px;">
          <div style="font-size:28px;font-weight:bold;line-height:1.1;letter-spacing:-0.5px;">${name}</div>
          <div style="font-size:14px;color:${primary};font-weight:600;margin-top:6px;margin-bottom:14px;text-transform:uppercase;letter-spacing:0.5px;">${jobTitle}</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px 20px;font-size:11.5px;opacity:0.9;">
            ${contactItems.join("")}
          </div>
        </div>
        ${photoHTML}
      </div>
      
      <div style="padding:24px 40px 40px;">
        ${data.summary ? `
          ${sectionHdr("Summary", SVG_ICONS.user)}
          <p style="font-size:13px;line-height:1.55;color:#333;margin:0;text-align:justify;">${escapeHtml(data.summary)}</p>
        ` : ""}
        
        ${expHTML}
        ${eduHTML}
        ${skillsHTML}
        ${languagesHTML}
        ${customHTML}
      </div>
    </div>
  `;
}

function buildCreativeLuciaHTML(data: ResumeData, title: string): string {
  const pi = data.personalInfo || {};
  const name = escapeHtml(pi.fullName || title || "Lucía Navarro Martín");
  const jobTitle = escapeHtml(pi.title || "Director of Strategic Planning");
  const primary = "#8e44ad"; // Creative purple / elegant slate

  const contactItems: string[] = [];
  if (pi.email) contactItems.push(`<div>${SVG_ICONS.mail} <a href="mailto:${escapeHtml(pi.email)}" style="color:#333;text-decoration:none">${escapeHtml(pi.email)}</a></div>`);
  if (pi.phone) contactItems.push(`<div>${SVG_ICONS.phone} ${escapeHtml(pi.phone)}</div>`);
  if (pi.linkedin) contactItems.push(`<div>${SVG_ICONS.linkedin} <a href="${escapeHtml(pi.linkedin)}" target="_blank" style="color:#333;text-decoration:none">${escapeHtml(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</a></div>`);
  if (pi.location) contactItems.push(`<div>${SVG_ICONS.mapPin} ${escapeHtml(pi.location)}</div>`);

  const photoHTML = pi.photoUrl ? `<img src="${escapeHtml(pi.photoUrl)}" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:1px solid #ddd;"/>` : "";

  const sectionHdr = (label: string) => `
    <div style="margin:20px 0 12px;page-break-inside:avoid;text-align:center;">
      <div style="border-top: 1.5px solid ${primary}; border-bottom: 1.5px solid ${primary}; padding: 3px 0;">
        <span style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${primary};">${escapeHtml(label)}</span>
      </div>
    </div>
  `;

  // Left column content: Summary, Experience, Custom
  let leftContent = "";
  if (data.summary) {
    leftContent += `
      ${sectionHdr("Summary")}
      <p style="font-size:13px;line-height:1.55;color:#333;margin:0 0 20px;text-align:justify;">${escapeHtml(data.summary)}</p>
    `;
  }
  if ((data.experience || []).length > 0) {
    leftContent += sectionHdr("Experience");
    data.experience!.forEach(exp => {
      const dateRange = formatDateRange(exp.startDate, exp.endDate);
      const bullets = exp.bullets?.length ? `<ul style="margin:4px 0 0 16px;padding:0;list-style:disc">${exp.bullets.map(b => `<li style="margin-bottom:3.5px;font-size:12.5px;line-height:1.45;color:#333;">${escapeHtml(b)}</li>`).join("")}</ul>` : "";
      leftContent += `
        <div style="margin-bottom:14px;page-break-inside:avoid;font-size:12.5px;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;font-weight:bold;color:#111;">
            <div>${escapeHtml(exp.title)}</div>
            <div style="font-weight:normal;font-size:11.5px;color:#666;">${escapeHtml(dateRange)}</div>
          </div>
          <div style="font-style:italic;color:#555;margin:2px 0;">${escapeHtml(exp.company)} | ${escapeHtml(exp.location || "")}</div>
          ${bullets}
        </div>
      `;
    });
  }

  // Right column content: Education, Skills, Languages, Custom
  let rightContent = "";
  if ((data.education || []).length > 0) {
    rightContent += sectionHdr("Education");
    data.education!.forEach(edu => {
      const dateRange = formatDateRange(edu.startDate, edu.endDate) || edu.year || "";
      rightContent += `
        <div style="margin-bottom:12px;page-break-inside:avoid;font-size:12px;line-height:1.4;">
          <div style="font-weight:700;color:#111;">${escapeHtml(edu.degree)}</div>
          <div style="color:#333;">${escapeHtml(edu.school)}</div>
          <div style="font-size:11px;color:#666;">${escapeHtml(dateRange)}</div>
        </div>
      `;
    });
  }
  if ((data.skills || []).length > 0) {
    rightContent += sectionHdr("Skills");
    rightContent += `<div style="font-size:12px;line-height:1.5;color:#333;text-align:left;">`;
    data.skills!.forEach(s => {
      const colonIndex = s.indexOf(":");
      if (colonIndex !== -1) {
        const title = s.substring(0, colonIndex).trim();
        const desc = s.substring(colonIndex + 1).trim();
        rightContent += `<div style="margin-bottom:8px;">
          <strong style="color:#111;font-size:12.5px;display:block;">${escapeHtml(title)}</strong>
          <div style="margin:2px 0 0;font-size:12px;color:#444;line-height:1.4;">${escapeHtml(desc)}</div>
        </div>`;
      } else {
        rightContent += `<div style="margin-bottom:8px;">
          <strong style="color:#111;font-size:12.5px;display:block;">${escapeHtml(s)}</strong>
        </div>`;
      }
    });
    rightContent += `</div>`;
  }
  if ((data.languages || []).length > 0) {
    rightContent += sectionHdr("Languages");
    rightContent += `<div style="font-size:12px;line-height:1.5;color:#333;">`;
    data.languages!.forEach(l => {
      rightContent += `<div style="margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:500;">${escapeHtml(l.name)}</span>
        <span style="font-size:11px;color:#666;">${escapeHtml(l.proficiency)}</span>
      </div>`;
    });
    rightContent += `</div>`;
  }

  // Add custom section to left or right based on content
  const custom = (data.customSections || []).filter(c => c.title && c.items?.length);
  custom.forEach(sec => {
    let customHtml = sectionHdr(sec.title);
    customHtml += `<ul style="margin:4px 0 0 16px;padding:0;list-style:disc;font-size:12px;line-height:1.45;color:#333;">`;
    sec.items.forEach(item => {
      customHtml += `<li style="margin-bottom:4.5px;">${escapeHtml(item)}</li>`;
    });
    customHtml += `</ul>`;
    if (sec.title.toLowerCase().includes("cert") || sec.title.toLowerCase().includes("award") || sec.title.toLowerCase().includes("interest")) {
      rightContent += customHtml;
    } else {
      leftContent += customHtml;
    }
  });

  return `
    <div style="font-family:Georgia,serif;color:#222;line-height:1.5;min-height:1123px;background:#ffffff;padding:40px 45px;">
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eee;padding-bottom:20px;margin-bottom:20px;">
        <div style="flex:1;">
          <div style="font-size:28px;font-weight:bold;color:#111;line-height:1.1;">${name}</div>
          <div style="font-size:15px;color:#555;font-style:italic;margin-top:4px;margin-bottom:12px;">${jobTitle}</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px 16px;font-size:11.5px;color:#555;">
            ${contactItems.join("  |  ")}
          </div>
        </div>
        ${photoHTML}
      </div>
      
      <div style="display:flex;gap:36px;">
        <div style="width:60%;display:flex;flex-direction:column;">
          ${leftContent}
        </div>
        <div style="width:40%;display:flex;flex-direction:column;">
          ${rightContent}
        </div>
      </div>
    </div>
  `;
}

function buildCreativeAnnaHTML(data: ResumeData, title: string): string {
  const pi = data.personalInfo || {};
  const name = escapeHtml(pi.fullName || title || "Anna Field");
  const jobTitle = escapeHtml(pi.title || "Junior Project Manager");
  const lavenderBg = "#f5f3ff"; // light purple/lavender background
  const primary = "#7c3aed"; // Violet/purple accent
  
  const contactParts: string[] = [];
  if (pi.location) contactParts.push(`${SVG_ICONS.mapPin} ${escapeHtml(pi.location)}`);
  if (pi.email) contactParts.push(`${SVG_ICONS.mail} <a href="mailto:${escapeHtml(pi.email)}" style="color:#555;text-decoration:none">${escapeHtml(pi.email)}</a>`);
  if (pi.phone) contactParts.push(`${SVG_ICONS.phone} ${escapeHtml(pi.phone)}`);
  if (pi.linkedin) contactParts.push(`${SVG_ICONS.linkedin} <a href="${escapeHtml(pi.linkedin)}" target="_blank" style="color:#555;text-decoration:none">${escapeHtml(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</a>`);

  const photoHTML = pi.photoUrl ? `<img src="${escapeHtml(pi.photoUrl)}" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:3px solid white;box-shadow:0 4px 10px rgba(0,0,0,0.1);margin:0 auto 12px;display:block;"/>` : "";

  const sectionHdr = (label: string) => `
    <div style="margin:22px 0 12px;text-align:center;page-break-inside:avoid;">
      <div style="background:${lavenderBg};padding:6px 12px;border-radius:4px;display:inline-block;border-bottom:2px solid ${primary};">
        <span style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${primary};">${escapeHtml(label)}</span>
      </div>
    </div>
  `;

  let expHTML = "";
  if ((data.experience || []).length > 0) {
    expHTML += sectionHdr("Experience");
    data.experience!.forEach(exp => {
      const dateRange = formatDateRange(exp.startDate, exp.endDate);
      const bullets = exp.bullets?.length ? `<ul style="margin:4px 0 0 20px;padding:0;list-style:disc">${exp.bullets.map(b => `<li style="margin-bottom:3.5px;font-size:13px;line-height:1.5;color:#333;">${escapeHtml(b)}</li>`).join("")}</ul>` : "";
      expHTML += `
        <div style="margin-bottom:16px;page-break-inside:avoid;font-size:13px;text-align:left;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;font-weight:bold;color:#111;">
            <div>${escapeHtml(exp.title)} — <span style="font-weight:normal;font-style:italic;color:#444;">${escapeHtml(exp.company)}</span></div>
            <div style="font-weight:normal;font-size:11.5px;color:#555;">${escapeHtml(dateRange)}</div>
          </div>
          <div style="font-size:11.5px;color:#666;font-style:italic;margin-top:2px;">${escapeHtml(exp.location || "")}</div>
          ${bullets}
        </div>
      `;
    });
  }

  let eduHTML = "";
  if ((data.education || []).length > 0) {
    eduHTML += sectionHdr("Education");
    data.education!.forEach(edu => {
      const dateRange = formatDateRange(edu.startDate, edu.endDate) || edu.year || "";
      eduHTML += `
        <div style="margin-bottom:12px;page-break-inside:avoid;font-size:13px;display:flex;justify-content:space-between;align-items:baseline;">
          <div><strong style="color:#111;">${escapeHtml(edu.degree)}</strong> — <span style="font-style:italic;color:#444;">${escapeHtml(edu.school)}</span></div>
          <div style="font-size:11.5px;color:#555;">${escapeHtml(dateRange)}</div>
        </div>
      `;
    });
  }

  let skillsHTML = "";
  if ((data.skills || []).length > 0) {
    skillsHTML += sectionHdr("Skills");
    skillsHTML += `<div style="max-width:680px;margin:0 auto 10px;text-align:left;font-size:13px;line-height:1.55;color:#333;">`;
    skillsHTML += `<ul style="margin:4px 0 0 20px;padding:0;list-style:disc;">`;
    data.skills!.forEach(s => {
      skillsHTML += `<li style="margin-bottom:4.5px;">${escapeHtml(s)}</li>`;
    });
    skillsHTML += `</ul>`;
    skillsHTML += `</div>`;
  }

  let languagesHTML = "";
  if ((data.languages || []).length > 0) {
    languagesHTML += sectionHdr("Languages");
    languagesHTML += `<div style="display:flex;justify-content:center;gap:30px;font-size:12.5px;">`;
    data.languages!.forEach(l => {
      languagesHTML += `<div style="text-align:center;">
        <span style="font-weight:600;color:#333;">${escapeHtml(l.name)}</span>
        <span style="color:#666;font-size:11px;">(${escapeHtml(l.proficiency || "Fluent")})</span>
      </div>`;
    });
    languagesHTML += `</div>`;
  }

  let customHTML = "";
  (data.customSections || []).filter(c => c.title && c.items?.length).forEach(sec => {
    customHTML += sectionHdr(sec.title);
    customHTML += `<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;font-size:12.5px;">`;
    sec.items.forEach(item => {
      customHTML += `<span style="background:#fff;border:1px solid #eee;color:#333;padding:4px 12px;border-radius:4px;">${escapeHtml(item)}</span>`;
    });
    customHTML += `</div>`;
  });

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#222;line-height:1.5;min-height:1123px;background:#ffffff;padding:0;text-align:center;">
      <div style="background:${lavenderBg};padding:35px 40px;border-bottom:3px solid ${primary};">
        ${photoHTML}
        <div style="font-size:28px;font-weight:bold;color:${primary};line-height:1.1;">${name}</div>
        <div style="font-size:14px;color:#555;font-weight:500;margin-top:6px;margin-bottom:14px;text-transform:uppercase;letter-spacing:1px;">${jobTitle}</div>
        <div style="display:flex;justify-content:center;flex-wrap:wrap;gap:8px 20px;font-size:11.5px;color:#555;">
          ${contactParts.join("  •  ")}
        </div>
      </div>
      
      <div style="padding:24px 45px 40px;">
        ${data.summary ? `
          ${sectionHdr("Profile")}
          <p style="font-size:13px;line-height:1.55;color:#333;margin:0 auto;max-width:680px;text-align:center;">${escapeHtml(data.summary)}</p>
        ` : ""}
        
        ${expHTML}
        ${eduHTML}
        ${skillsHTML}
        ${languagesHTML}
        ${customHTML}
      </div>
    </div>
  `;
}

function buildCreativeAntoineHTML(data: ResumeData, title: string): string {
  const pi = data.personalInfo || {};
  const name = escapeHtml(pi.fullName || title || "Antoine Delorme");
  const jobTitle = escapeHtml(pi.title || "Consulting Director");
  const lightBlue = "#e0f2fe"; // Light blue background
  const primary = "#0284c7"; // Blue accent

  const contactGrid: string[] = [];
  if (pi.email) contactGrid.push(`<div>${SVG_ICONS.mail} <a href="mailto:${escapeHtml(pi.email)}" style="color:#333;text-decoration:none">${escapeHtml(pi.email)}</a></div>`);
  if (pi.phone) contactGrid.push(`<div>${SVG_ICONS.phone} ${escapeHtml(pi.phone)}</div>`);
  if (pi.location) contactGrid.push(`<div>${SVG_ICONS.mapPin} ${escapeHtml(pi.location)}</div>`);
  if (pi.linkedin) contactGrid.push(`<div>${SVG_ICONS.linkedin} <a href="${escapeHtml(pi.linkedin)}" target="_blank" style="color:#333;text-decoration:none">${escapeHtml(pi.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</a></div>`);

  const photoHTML = pi.photoUrl ? `<img src="${escapeHtml(pi.photoUrl)}" style="width:100px;height:100px;border-radius:8px;object-fit:cover;border:3px solid white;box-shadow:0 4px 8px rgba(0,0,0,0.1);"/>` : "";

  const sectionHdr = (label: string) => `
    <div style="margin:20px 0 10px;page-break-inside:avoid;border-bottom:2px solid ${primary};padding-bottom:4px;">
      <span style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${primary};">${escapeHtml(label)}</span>
    </div>
  `;

  let leftContent = "";
  if (data.summary) {
    leftContent += `
      ${sectionHdr("Summary")}
      <p style="font-size:13px;line-height:1.55;color:#333;margin:0 0 20px;text-align:justify;">${escapeHtml(data.summary)}</p>
    `;
  }
  if ((data.skills || []).length > 0) {
    leftContent += sectionHdr("Skills");
    leftContent += `<div style="display:flex;flex-direction:column;gap:6px;text-align:left;">`;
    data.skills!.forEach(s => {
      const colonIndex = s.indexOf(":");
      if (colonIndex !== -1) {
        const title = s.substring(0, colonIndex).trim();
        const desc = s.substring(colonIndex + 1).trim();
        leftContent += `<div style="font-size:12.5px;line-height:1.4;"><strong style="color:#111;">${escapeHtml(title)}</strong> — <span style="color:#444;">${escapeHtml(desc)}</span></div>`;
      } else {
        leftContent += `<div style="font-size:12.5px;line-height:1.4;"><strong style="color:#111;">${escapeHtml(s)}</strong></div>`;
      }
    });
    leftContent += `</div>`;
  }
  if ((data.languages || []).length > 0) {
    leftContent += sectionHdr("Languages");
    leftContent += `<div style="font-size:12.5px;line-height:1.5;color:#333;text-align:left;">`;
    leftContent += data.languages!.map(l => {
      return `<span style="font-weight:600;">${escapeHtml(l.name)}</span>${l.proficiency ? ` (${escapeHtml(l.proficiency)})` : ""}`;
    }).join(" • ");
    leftContent += `</div>`;
  }

  let rightContent = "";
  if ((data.experience || []).length > 0) {
    rightContent += sectionHdr("Professional Experience");
    data.experience!.forEach(exp => {
      const dateRange = formatDateRange(exp.startDate, exp.endDate);
      const bullets = exp.bullets?.length ? `<ul style="margin:4px 0 0 16px;padding:0;list-style:disc">${exp.bullets.map(b => `<li style="margin-bottom:3.5px;font-size:12.5px;line-height:1.45;color:#333;">${escapeHtml(b)}</li>`).join("")}</ul>` : "";
      rightContent += `
        <div style="margin-bottom:14px;page-break-inside:avoid;font-size:12.5px;text-align:left;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;font-weight:bold;color:#111;">
            <div>${escapeHtml(exp.title)}</div>
            <div style="font-weight:normal;font-size:11.5px;color:#666;">${escapeHtml(dateRange)}</div>
          </div>
          <div style="font-style:italic;color:#555;margin:2px 0;">${escapeHtml(exp.company)} | ${escapeHtml(exp.location || "")}</div>
          ${bullets}
        </div>
      `;
    });
  }
  if ((data.education || []).length > 0) {
    rightContent += sectionHdr("Education");
    data.education!.forEach(edu => {
      const dateRange = formatDateRange(edu.startDate, edu.endDate) || edu.year || "";
      rightContent += `
        <div style="margin-bottom:12px;page-break-inside:avoid;font-size:12px;line-height:1.4;text-align:left;">
          <div style="font-weight:700;color:#111;">${escapeHtml(edu.degree)}</div>
          <div style="color:#333;">${escapeHtml(edu.school)}</div>
          <div style="font-size:11px;color:#666;">${escapeHtml(dateRange)}</div>
        </div>
      `;
    });
  }

  const custom = (data.customSections || []).filter(c => c.title && c.items?.length);
  custom.forEach(sec => {
    let customHtml = sectionHdr(sec.title);
    customHtml += `<ul style="margin:4px 0 0 16px;padding:0;list-style:disc;font-size:12px;line-height:1.45;color:#333;text-align:left;">`;
    sec.items.forEach(item => {
      customHtml += `<li style="margin-bottom:4.5px;">${escapeHtml(item)}</li>`;
    });
    customHtml += `</ul>`;
    
    // Certificates and awards go to left column, other custom go to right column
    if (sec.title.toLowerCase().includes("cert") || sec.title.toLowerCase().includes("award") || sec.title.toLowerCase().includes("interest")) {
      leftContent += customHtml;
    } else {
      rightContent += customHtml;
    }
  });

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#222;line-height:1.5;min-height:1123px;background:#ffffff;padding:0;">
      <div style="background:${lightBlue};padding:30px 40px;display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid ${primary};">
        <div style="flex:1;padding-right:24px;">
          <div style="font-size:28px;font-weight:bold;color:#0f172a;line-height:1.1;">${name}</div>
          <div style="font-size:15px;color:${primary};font-weight:600;margin-top:4px;margin-bottom:16px;">${jobTitle}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;font-size:11.5px;color:#334155;">
            ${contactGrid.join("")}
          </div>
        </div>
        ${photoHTML}
      </div>
      
      <div style="padding:24px 40px 40px;display:flex;gap:36px;">
        <div style="width:45%;display:flex;flex-direction:column;">
          ${leftContent}
        </div>
        <div style="width:55%;display:flex;flex-direction:column;">
          ${rightContent}
        </div>
      </div>
    </div>
  `;
}
