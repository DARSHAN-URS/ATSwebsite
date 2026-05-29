import { useMemo } from "react";
import type { TemplateId } from "./pdfTemplates";
import { getATSConfig, isATSTemplateId, type ATSTemplateConfig } from "./atsTemplateConfig";
import { ALL_DYNAMIC_TEMPLATES } from "../../data/templates/index";

const DUMMY = {
  name: "John Doe",
  contact: "john@email.com • (555) 123-4567 • New York, NY",
  summary: "Experienced professional with expertise in project management and team leadership.",
  skills: "React • TypeScript • Node.js • SQL • Python",
  exp: [
    { title: "Senior Developer", company: "Tech Corp", date: "2021 — Present" },
    { title: "Developer", company: "StartupXYZ", date: "2018 — 2021" },
  ],
  edu: { degree: "B.S. Computer Science", school: "State University" },
};

function getThumbnailHTML(templateId: TemplateId): string {
  const s = (fontSize: number) => `font-size:${fontSize}px;`;

  switch (templateId) {
    case "modern":
      return `<div style="font-family:Arial,sans-serif;padding:8px 7px;color:#222;line-height:1.3">
        <div style="height:2px;background:#2563eb;margin:-8px -7px 5px"></div>
        <div style="${s(7)}font-weight:700;color:#2563eb">${DUMMY.name}</div>
        <div style="${s(3.5)}color:#888;margin-bottom:3px">${DUMMY.contact}</div>
        <div style="display:flex;align-items:center;gap:2px;margin:4px 0 2px"><div style="width:1.5px;height:5px;background:#2563eb"></div><span style="${s(4)}font-weight:700;color:#2563eb">SUMMARY</span></div>
        <div style="${s(3.5)}color:#444">${DUMMY.summary}</div>
        <div style="display:flex;align-items:center;gap:2px;margin:4px 0 2px"><div style="width:1.5px;height:5px;background:#2563eb"></div><span style="${s(4)}font-weight:700;color:#2563eb">EXPERIENCE</span></div>
        ${DUMMY.exp.map(e => `<div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
      </div>`;

    case "minimal":
      return `<div style="font-family:Arial,sans-serif;padding:10px 9px;color:#222;line-height:1.3">
        <div style="${s(7)}font-weight:400">${DUMMY.name}</div>
        <div style="${s(3.5)}color:#888;margin-bottom:4px">${DUMMY.contact}</div>
        <div style="${s(3)}font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.5px;margin:4px 0 2px">SUMMARY</div>
        <div style="${s(3.5)}color:#444">${DUMMY.summary}</div>
        <div style="${s(3)}font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.5px;margin:4px 0 2px">SKILLS</div>
        <div style="${s(3.5)}color:#444">${DUMMY.skills}</div>
      </div>`;

    case "executive":
      return `<div style="font-family:Arial,sans-serif;color:#222;line-height:1.3">
        <div style="background:#1e1e1e;padding:6px 7px 5px;margin-bottom:4px">
          <div style="${s(7)}font-weight:700;color:#fff">${DUMMY.name}</div>
          <div style="${s(3)}color:#c8c8c8">${DUMMY.contact}</div>
        </div>
        <div style="padding:2px 7px">
          <div style="background:#1e1e1e;color:#fff;padding:1px 4px;margin:3px 0 2px"><span style="${s(3.5)}font-weight:700">EXPERIENCE</span></div>
          ${DUMMY.exp.map(e => `<div style="${s(3.5)}padding:0 2px"><b>${e.title}</b> — ${e.company}</div>`).join("")}
          <div style="background:#1e1e1e;color:#fff;padding:1px 4px;margin:3px 0 2px"><span style="${s(3.5)}font-weight:700">EDUCATION</span></div>
          <div style="${s(3.5)}padding:0 2px">${DUMMY.edu.degree} — ${DUMMY.edu.school}</div>
        </div>
      </div>`;

    case "sidebar":
      return `<div style="display:flex;font-family:Arial,sans-serif;height:100%;color:#222;line-height:1.3">
        <div style="width:35%;background:#1e3a5f;color:#fff;padding:6px 5px">
          <div style="${s(5)}font-weight:700;margin-bottom:4px">${DUMMY.name}</div>
          <div style="${s(3)}color:#b4d2ff;font-weight:700;margin-bottom:1px">CONTACT</div>
          <div style="${s(2.5)}color:#ddd">john@email.com</div>
          <div style="${s(2.5)}color:#ddd">(555) 123-4567</div>
          <div style="${s(3)}color:#b4d2ff;font-weight:700;margin:3px 0 1px">SKILLS</div>
          <div style="${s(2.5)}color:#ddd">• React</div>
          <div style="${s(2.5)}color:#ddd">• TypeScript</div>
          <div style="${s(2.5)}color:#ddd">• Node.js</div>
        </div>
        <div style="flex:1;padding:6px 5px">
          <div style="background:#1e3a5f;color:#fff;padding:1px 3px;margin-bottom:2px"><span style="${s(3.5)}font-weight:700">SUMMARY</span></div>
          <div style="${s(3)}color:#444;margin-bottom:3px">${DUMMY.summary.slice(0, 60)}…</div>
          <div style="background:#1e3a5f;color:#fff;padding:1px 3px;margin-bottom:2px"><span style="${s(3.5)}font-weight:700">EXPERIENCE</span></div>
          ${DUMMY.exp.map(e => `<div style="${s(3)}"><b>${e.title}</b></div>`).join("")}
        </div>
      </div>`;

    case "twocolumn":
      return `<div style="font-family:Arial,sans-serif;color:#222;line-height:1.3">
        <div style="background:#2d3748;padding:5px 7px 4px">
          <div style="${s(6)}font-weight:700;color:#fff">${DUMMY.name}</div>
          <div style="${s(3)}color:#cbd5e0">${DUMMY.contact}</div>
        </div>
        <div style="display:flex;padding:4px 7px;gap:6px">
          <div style="flex:1">
            <div style="${s(3.5)}font-weight:700;color:#2d3748;border-bottom:1px solid #2d3748;margin-bottom:2px">EXPERIENCE</div>
            ${DUMMY.exp.map(e => `<div style="${s(3)}"><b>${e.title}</b><br/>${e.company}</div>`).join("")}
          </div>
          <div style="flex:1">
            <div style="${s(3.5)}font-weight:700;color:#2d3748;border-bottom:1px solid #2d3748;margin-bottom:2px">SKILLS</div>
            <div style="${s(3)}">• React<br/>• TypeScript<br/>• Node.js</div>
          </div>
        </div>
      </div>`;

    case "creative":
      return `<div style="font-family:Arial,sans-serif;padding:8px 7px;color:#222;line-height:1.3">
        <div style="width:16px;height:2px;background:#dc3545;margin-bottom:2px"></div>
        <div style="${s(8)}font-weight:700;color:#dc3545;text-transform:uppercase;letter-spacing:0.5px">${DUMMY.name}</div>
        <div style="${s(3.5)}color:#888;margin-bottom:3px">${DUMMY.contact}</div>
        <div style="${s(4.5)}font-weight:700;color:#dc3545;margin:3px 0 1px">EXPERIENCE</div>
        <div style="width:12px;height:1px;background:#dc3545;margin-bottom:2px"></div>
        ${DUMMY.exp.map(e => `<div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
      </div>`;

    case "compact":
      return `<div style="font-family:Arial,sans-serif;padding:5px 5px;color:#222;line-height:1.3;text-align:center">
        <div style="${s(5.5)}font-weight:700">${DUMMY.name}</div>
        <div style="${s(2.5)}color:#888;margin-bottom:2px">${DUMMY.contact}</div>
        <div style="border-bottom:1px solid #000;margin:2px 0"></div>
        <div style="text-align:left">
          <div style="${s(3.5)}font-weight:700;border-bottom:1px solid #bbb;margin:2px 0 1px">EXPERIENCE</div>
          ${DUMMY.exp.map(e => `<div style="${s(3)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
          <div style="${s(3.5)}font-weight:700;border-bottom:1px solid #bbb;margin:2px 0 1px">EDUCATION</div>
          <div style="${s(3)}">${DUMMY.edu.degree}</div>
        </div>
      </div>`;

    case "professional":
      return `<div style="font-family:Arial,sans-serif;padding:8px 7px;color:#222;line-height:1.3">
        <div style="height:3px;background:#192a56;margin:-8px -7px 5px"></div>
        <div style="${s(7.5)}font-weight:700;color:#192a56">${DUMMY.name}</div>
        <div style="${s(3.5)}color:#888;margin-bottom:2px">${DUMMY.contact}</div>
        <div style="border-bottom:2px solid #192a56;margin:2px 0 3px"></div>
        <div style="${s(4)}font-weight:700;color:#192a56">EXPERIENCE</div>
        <div style="border-bottom:2px solid #192a56;margin:1px 0 2px"></div>
        ${DUMMY.exp.map(e => `<div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
      </div>`;

    case "ats":
      return `<div style="font-family:Arial,sans-serif;padding:7px 6px;color:#222;line-height:1.3">
        <div style="${s(6)}font-weight:700">${DUMMY.name}</div>
        <div style="${s(3.5)}color:#555;margin-bottom:2px">${DUMMY.contact}</div>
        <div style="border-bottom:1px solid #000;margin:2px 0 3px"></div>
        <div style="${s(4)}font-weight:700">EXPERIENCE</div>
        <div style="border-bottom:1px solid #000;margin:1px 0 2px"></div>
        ${DUMMY.exp.map(e => `<div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
        <div style="${s(4)}font-weight:700;margin-top:3px">EDUCATION</div>
        <div style="border-bottom:1px solid #000;margin:1px 0 2px"></div>
        <div style="${s(3.5)}">${DUMMY.edu.degree} — ${DUMMY.edu.school}</div>
      </div>`;

    case "simple":
      return `<div style="font-family:Arial,sans-serif;padding:8px 7px;color:#222;line-height:1.3;text-align:center">
        <div style="${s(7)}font-weight:700">${DUMMY.name}</div>
        <div style="${s(3.5)}color:#888;margin-bottom:3px">${DUMMY.contact}</div>
        <div style="text-align:left">
          <div style="${s(4)}font-weight:700">EXPERIENCE</div>
          <div style="border-bottom:1px solid #ccc;margin:1px 0 2px"></div>
          ${DUMMY.exp.map(e => `<div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
        </div>
      </div>`;

    case "elegant":
      return `<div style="font-family:Arial,sans-serif;padding:8px 7px;color:#222;line-height:1.3">
        <div style="border-top:2px solid #b49146;margin:-8px -7px 0;padding:6px 7px 0">
          <div style="${s(7)}font-weight:700;color:#3c3c3c;text-align:center">${DUMMY.name}</div>
          <div style="${s(3.5)}color:#888;text-align:center;margin-bottom:2px">${DUMMY.contact}</div>
          <div style="border-bottom:1px solid #b49146;margin:2px 0 3px"></div>
        </div>
        <div style="${s(3.5)}font-weight:700;color:#b49146;text-transform:uppercase;letter-spacing:0.5px">EXPERIENCE</div>
        <div style="border-bottom:1px solid #b49146;margin:1px 0 2px"></div>
        ${DUMMY.exp.map(e => `<div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
      </div>`;

    case "ivyleague":
      return `<div style="font-family:Arial,sans-serif;padding:8px 7px;color:#222;line-height:1.3;text-align:center">
        <div style="${s(7)}font-weight:700">${DUMMY.name}</div>
        <div style="${s(3)}color:#666;margin-bottom:2px">${DUMMY.contact}</div>
        <div style="border-top:1.5px solid #555;border-bottom:0.5px solid #555;height:2px;margin:3px 0"></div>
        <div style="text-align:left">
          <div style="${s(3.5)}font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px;margin:3px 0 1px;border-bottom:0.5px solid #888;padding-bottom:1px">EXPERIENCE</div>
          ${DUMMY.exp.map(e => `<div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
          <div style="${s(3.5)}font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px;margin:3px 0 1px;border-bottom:0.5px solid #888;padding-bottom:1px">EDUCATION</div>
          <div style="${s(3.5)}">${DUMMY.edu.degree}</div>
        </div>
      </div>`;

    case "timeline":
      return `<div style="font-family:Arial,sans-serif;padding:8px 7px;color:#222;line-height:1.3">
        <div style="height:2px;background:#2962ff;margin:-8px -7px 5px"></div>
        <div style="${s(7)}font-weight:700;color:#2962ff">${DUMMY.name}</div>
        <div style="${s(3.5)}color:#888;margin-bottom:4px">${DUMMY.contact}</div>
        <div style="${s(4)}font-weight:700;color:#2962ff;margin:3px 0 2px">EXPERIENCE</div>
        ${DUMMY.exp.map((e, i) => `<div style="display:flex;gap:3px;margin-bottom:2px"><div style="display:flex;flex-direction:column;align-items:center"><div style="width:4px;height:4px;border-radius:50%;background:#2962ff;flex-shrink:0;margin-top:1px"></div>${i < DUMMY.exp.length - 1 ? '<div style="width:0.5px;flex:1;background:#2962ff"></div>' : ''}</div><div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}<br/><span style="color:#888;${s(2.5)}">${e.date}</span></div></div>`).join("")}
      </div>`;

    case "contemporary":
      return `<div style="font-family:Arial,sans-serif;color:#222;line-height:1.3">
        <div style="background:#10a37f;padding:5px 7px 4px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="${s(7)}font-weight:700;color:#fff">${DUMMY.name}</div>
            <div style="${s(3)}color:#dcfff0">${DUMMY.contact}</div>
          </div>
          <div style="width:16px;height:16px;border-radius:50%;background:#fff;flex-shrink:0"></div>
        </div>
        <div style="padding:2px 7px">
          <div style="${s(3.5)}font-weight:700;color:#10a37f;text-transform:uppercase;border-bottom:1px solid #10a37f;margin:3px 0 2px;padding-bottom:1px">EXPERIENCE</div>
          ${DUMMY.exp.map(e => `<div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
        </div>
      </div>`;

    case "polished":
      return `<div style="display:flex;font-family:Arial,sans-serif;height:100%;color:#222;line-height:1.3">
        <div style="width:35%;background:#a64834;color:#fff;padding:6px 5px">
          <div style="${s(5)}font-weight:700;margin-bottom:4px">${DUMMY.name}</div>
          <div style="${s(3)}color:#ffd2be;font-weight:700;margin-bottom:1px">CONTACT</div>
          <div style="${s(2.5)}color:#f0d0c0">john@email.com</div>
          <div style="${s(2.5)}color:#f0d0c0">(555) 123-4567</div>
          <div style="${s(3)}color:#ffd2be;font-weight:700;margin:3px 0 1px">SKILLS</div>
          <div style="${s(2.5)}color:#f0d0c0">• React</div>
          <div style="${s(2.5)}color:#f0d0c0">• TypeScript</div>
        </div>
        <div style="flex:1;padding:6px 5px">
          <div style="${s(3.5)}font-weight:700;color:#a64834;text-transform:uppercase;border-bottom:1px solid #a64834;margin-bottom:2px;padding-bottom:1px">EXPERIENCE</div>
          ${DUMMY.exp.map(e => `<div style="${s(3)}"><b>${e.title}</b></div>`).join("")}
          <div style="${s(3.5)}font-weight:700;color:#a64834;text-transform:uppercase;border-bottom:1px solid #a64834;margin:3px 0 2px;padding-bottom:1px">EDUCATION</div>
          <div style="${s(3)}">${DUMMY.edu.degree}</div>
        </div>
      </div>`;

    case "cobalt":
      return `<div style="font-family:'Times New Roman',Times,serif;color:#222;line-height:1.3">
        <div style="background:#1d4e89;padding:6px 7px 5px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="${s(7)}font-weight:700;color:#fff">${DUMMY.name}</div>
            <div style="${s(3)}color:#d0dce8;font-family:Arial,sans-serif">${DUMMY.contact}</div>
          </div>
          <div style="width:16px;height:16px;border-radius:50%;background:rgba(255,255,255,0.3)"></div>
        </div>
        <div style="padding:4px 7px">
          <div style="${s(4)}font-weight:700;color:#1d4e89;margin-bottom:2px"><span style="border-bottom:1px solid #1d4e89;padding-bottom:1px;display:inline-block">EXPERIENCE</span></div>
          ${DUMMY.exp.map(e => `<div style="${s(3.5)}"><b>${e.title}</b> — <i>${e.company}</i></div>`).join("")}
          <div style="${s(4)}font-weight:700;color:#1d4e89;margin:4px 0 2px"><span style="border-bottom:1px solid #1d4e89;padding-bottom:1px;display:inline-block">EDUCATION</span></div>
          <div style="${s(3.5)}"><b>${DUMMY.edu.degree}</b> — <i>${DUMMY.edu.school}</i></div>
        </div>
      </div>`;

    default: {
      // Config-driven ATS templates
      if (isATSTemplateId(templateId)) {
        const config = getATSConfig(templateId);
        if (config) return buildATSThumbnail(config);
      }
      // Dynamic generated templates
      const dynamicConfig = ALL_DYNAMIC_TEMPLATES.find(t => t.template_id === templateId);
      if (dynamicConfig) return buildDynamicThumbnail(dynamicConfig);
      
      // Classic fallback
      return `<div style="font-family:Arial,sans-serif;padding:8px 7px;color:#222;line-height:1.3">
        <div style="${s(7)}font-weight:700">${DUMMY.name}</div>
        <div style="${s(3.5)}color:#888;margin-bottom:3px">${DUMMY.contact}</div>
        <div style="border-bottom:1px solid #ccc;margin:3px 0 2px;padding-bottom:1px"><span style="${s(4)}font-weight:700">EXPERIENCE</span></div>
        ${DUMMY.exp.map(e => `<div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
        <div style="border-bottom:1px solid #ccc;margin:3px 0 2px;padding-bottom:1px"><span style="${s(4)}font-weight:700">EDUCATION</span></div>
        <div style="${s(3.5)}">${DUMMY.edu.degree} — ${DUMMY.edu.school}</div>
      </div>`;
    }
  }
}

function buildDynamicThumbnail(config: any): string {
  const s = (fontSize: number) => `font-size:${fontSize}px;`;
  const layout = config.layout_metadata;
  const primary = layout.color_palette.primary;
  
  if (layout.sidebar_position === 'left' || layout.sidebar_position === 'asymmetrical-left') {
     return `<div style="display:flex;font-family:Arial,sans-serif;height:100%;color:#222;line-height:1.3">
        <div style="width:35%;background:${primary};color:#fff;padding:6px 5px">
          <div style="${s(5)}font-weight:700;margin-bottom:4px">${DUMMY.name}</div>
          <div style="${s(3)}font-weight:700;margin-bottom:1px">CONTACT</div>
          <div style="${s(2.5)}">${DUMMY.contact}</div>
        </div>
        <div style="flex:1;padding:6px 5px">
          <div style="${s(3.5)}font-weight:700;color:${primary};border-bottom:1px solid ${primary};margin-bottom:2px">EXPERIENCE</div>
          ${DUMMY.exp.map((e: any) => `<div style="${s(3)}"><b>${e.title}</b></div>`).join("")}
        </div>
      </div>`;
  } else {
     return `<div style="font-family:Arial,sans-serif;padding:8px 7px;color:#222;line-height:1.3">
        <div style="height:4px;background:${primary};margin:-8px -7px 5px"></div>
        <div style="${s(7)}font-weight:700;color:${primary}">${DUMMY.name}</div>
        <div style="${s(3.5)}color:#888;margin-bottom:3px">${DUMMY.contact}</div>
        <div style="border-bottom:1px solid ${primary};margin:3px 0 2px;padding-bottom:1px"><span style="${s(4)}font-weight:700">EXPERIENCE</span></div>
        ${DUMMY.exp.map((e: any) => `<div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
      </div>`;
  }
}

function buildATSThumbnail(config: ATSTemplateConfig): string {
  const s = (fontSize: number) => `font-size:${fontSize}px;font-family:${config.fontFamilyCSS};`;
  const nameSize = Math.min(config.nameFontSize * 0.45, 9);
  const headSize = Math.min(config.headingFontSize * 0.4, 5);
  const baseSize = Math.min(config.baseFontSize * 0.38, 4);
  const padSize = Math.max(config.marginSize * 0.35, 5);

  const sectionLabel = (label: string) =>
    `<div style="border-bottom:1px solid #000;margin:${config.lineSpacing * 0.6}px 0 ${config.lineSpacing * 0.3}px;padding-bottom:1px"><span style="${s(headSize)}font-weight:700;text-transform:uppercase">${label}</span></div>`;

  const sectionBuilders: Record<string, () => string> = {
    summary: () => `${sectionLabel("Summary")}<div style="${s(baseSize)}color:#444">${DUMMY.summary}</div>`,
    skills: () => `${sectionLabel("Skills")}<div style="${s(baseSize)}">${DUMMY.skills}</div>`,
    experience: () => `${sectionLabel("Experience")}${DUMMY.exp.map(e => `<div style="${s(baseSize)}"><b>${e.title}</b> — ${e.company} <span style="color:#888">${e.date}</span></div>`).join("")}`,
    education: () => `${sectionLabel("Education")}<div style="${s(baseSize)}">${DUMMY.edu.degree} — ${DUMMY.edu.school}</div>`,
    languages: () => "",
    custom: () => "",
  };

  const content = config.sectionOrder
    .filter(sec => config.sectionVisibility[sec])
    .map(sec => sectionBuilders[sec]?.() || "")
    .filter(Boolean)
    .join("");

  return `<div style="font-family:${config.fontFamilyCSS};padding:${padSize}px;color:#222;line-height:1.3">
    <div style="${s(nameSize)}font-weight:700">${DUMMY.name}</div>
    <div style="${s(baseSize - 0.5)}color:#888;margin-bottom:2px">${DUMMY.contact}</div>
    <div style="border-bottom:1px solid #000;margin:2px 0 3px"></div>
    ${content}
  </div>`;
}

interface TemplateThumbnailProps {
  templateId: TemplateId;
}

export default function TemplateThumbnail({ templateId }: TemplateThumbnailProps) {
  const html = useMemo(() => getThumbnailHTML(templateId), [templateId]);

  return (
    <div
      className="w-full bg-white rounded border border-border overflow-hidden"
      style={{ aspectRatio: "595 / 842" }}
    >
      <div
        className="w-full h-full pointer-events-none select-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
