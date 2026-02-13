import { useMemo } from "react";
import type { TemplateId } from "./pdfTemplates";

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

    default: // classic
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
