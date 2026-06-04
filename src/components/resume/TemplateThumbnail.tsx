import { useMemo, useEffect, useRef, useState } from "react";
import type { TemplateId } from "./pdfTemplates";
import { getATSConfig, isATSTemplateId, type ATSTemplateConfig } from "./atsTemplateConfig";
import { ALL_DYNAMIC_TEMPLATES } from "../../data/templates/index";
import type { ResumeData } from "@/types/resume";

const DUMMY = {
  name: "Camila Rivera",
  contact: "c.rivera@email.com • +1 (305) 555-0184 • Miami, FL • linkedin.com/in/camila-rivera",
  summary: "Results-driven sales professional with 6+ years of experience in account growth, client relationship management, and pipeline development across B2B environments. Strong track record of improving conversion rates, supporting revenue targets, and building trust with diverse customer groups. Brings a practical, people-focused approach to sales planning and long-term customer retention.",
  skills: "Account Management • CRM Management • Sales Forecasting • Negotiation • Client Retention • Pipeline Development",
  exp: [
    { 
      title: "Sales Manager", 
      company: "BrightPath Business Solutions", 
      date: "08/2021 — Present", 
      bullets: [
        "Manage a portfolio of mid-market clients across retail and service sectors.",
        "Lead quarterly sales planning and improved team conversion rates by 14%.",
        "Build strong client relationships that increased renewals and upsell."
      ] 
    },
    { 
      title: "Account Manager", 
      company: "Horizon Office Supply", 
      date: "03/2019 — 07/2021", 
      bullets: [
        "Owned inbound and outbound sales strategy for regional business accounts.",
        "Delivered tailored product proposals and consistently exceeded revenue goals.",
        "Coordinated with operations teams to improve customer satisfaction."
      ] 
    },
    { 
      title: "Sales Representative", 
      company: "SunPeak Telecom", 
      date: "06/2016 — 02/2019", 
      bullets: [
        "Supported account execs with lead tracking, reporting, and proposal preparation.",
        "Contributed to pipeline organization and improved follow-up consistency."
      ] 
    }
  ],
  edu: { degree: "Bachelor of Business Administration", school: "Florida International University", date: "2012 — 2016" },
};

const DUMMY_PHOTO = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256&h=256";

function mapResumeDataToDummy(data?: ResumeData) {
  if (!data) return DUMMY;
  
  const pi = data.personalInfo || {};
  const contactParts = [pi.email, pi.phone, pi.location].filter(Boolean);
  
  return {
    name: pi.fullName || DUMMY.name,
    photoUrl: pi.photoUrl || DUMMY_PHOTO,
    contact: contactParts.length ? contactParts.join(" • ") : DUMMY.contact,
    summary: data.summary || DUMMY.summary,
    skills: data.skills?.length ? data.skills.join(" • ") : DUMMY.skills,
    exp: data.experience?.length ? data.experience.map(e => ({
      title: e.title || "Position",
      company: e.company || "Company",
      date: `${e.startDate || ""} — ${e.endDate || ""}`.trim() || "Date",
      bullets: e.bullets?.length ? e.bullets : ["Responsible for key deliverables.", "Collaborated with cross-functional teams."]
    })) : DUMMY.exp,
    edu: data.education?.[0] ? {
      degree: data.education[0].degree || "Degree",
      school: data.education[0].school || "School",
      date: `${data.education[0].startDate || ""} — ${data.education[0].endDate || ""}`.trim()
    } : DUMMY.edu
  };
}

function getThumbnailHTML(templateId: TemplateId, rawData?: ResumeData): string {
  const dummyData = mapResumeDataToDummy(rawData);
  const s = (fontSize: number) => `font-size:${fontSize}px;`;

  switch (templateId) {
    case "modern":
      return `<div style="font-family:Arial,sans-serif;padding:8px 7px;color:#222;line-height:1.3">
        <div style="height:2px;background:#2563eb;margin:-8px -7px 5px"></div>
        <div style="${s(7)}font-weight:700;color:#2563eb">${dummyData.name}</div>
        <div style="${s(3.5)}color:#888;margin-bottom:3px">${dummyData.contact}</div>
        <div style="display:flex;align-items:center;gap:2px;margin:4px 0 2px"><div style="width:1.5px;height:5px;background:#2563eb"></div><span style="${s(4)}font-weight:700;color:#2563eb">SUMMARY</span></div>
        <div style="${s(3.5)}color:#444">${dummyData.summary}</div>
        <div style="display:flex;align-items:center;gap:2px;margin:4px 0 2px"><div style="width:1.5px;height:5px;background:#2563eb"></div><span style="${s(4)}font-weight:700;color:#2563eb">EXPERIENCE</span></div>
        ${dummyData.exp.map((e: any) => `<div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
      </div>`;

    case "minimal":
      return `<div style="font-family:Arial,sans-serif;padding:10px 9px;color:#222;line-height:1.3">
        <div style="${s(7)}font-weight:400">${dummyData.name}</div>
        <div style="${s(3.5)}color:#888;margin-bottom:4px">${dummyData.contact}</div>
        <div style="${s(3)}font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.5px;margin:4px 0 2px">SUMMARY</div>
        <div style="${s(3.5)}color:#444">${dummyData.summary}</div>
        <div style="${s(3)}font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.5px;margin:4px 0 2px">SKILLS</div>
        <div style="${s(3.5)}color:#444">${dummyData.skills}</div>
      </div>`;

    case "executive":
      return `<div style="font-family:Arial,sans-serif;color:#222;line-height:1.3">
        <div style="background:#1e1e1e;padding:6px 7px 5px;margin-bottom:4px">
          <div style="${s(7)}font-weight:700;color:#fff">${dummyData.name}</div>
          <div style="${s(3)}color:#c8c8c8">${dummyData.contact}</div>
        </div>
        <div style="padding:2px 7px">
          <div style="background:#1e1e1e;color:#fff;padding:1px 4px;margin:3px 0 2px"><span style="${s(3.5)}font-weight:700">EXPERIENCE</span></div>
          ${dummyData.exp.map((e: any) => `<div style="${s(3.5)}padding:0 2px"><b>${e.title}</b> — ${e.company}</div>`).join("")}
          <div style="background:#1e1e1e;color:#fff;padding:1px 4px;margin:3px 0 2px"><span style="${s(3.5)}font-weight:700">EDUCATION</span></div>
          <div style="${s(3.5)}padding:0 2px">${dummyData.edu.degree} — ${dummyData.edu.school}</div>
        </div>
      </div>`;

    case "sidebar":
      return `<div style="display:flex;font-family:Arial,sans-serif;height:100%;color:#222;line-height:1.3">
        <div style="width:35%;background:#1e3a5f;color:#fff;padding:6px 5px">
          <div style="${s(5)}font-weight:700;margin-bottom:4px">${dummyData.name}</div>
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
          <div style="${s(3)}color:#444;margin-bottom:3px">${dummyData.summary.slice(0, 60)}…</div>
          <div style="background:#1e3a5f;color:#fff;padding:1px 3px;margin-bottom:2px"><span style="${s(3.5)}font-weight:700">EXPERIENCE</span></div>
          ${dummyData.exp.map((e: any) => `<div style="${s(3)}"><b>${e.title}</b></div>`).join("")}
        </div>
      </div>`;

    case "twocolumn":
      return `<div style="font-family:Arial,sans-serif;color:#222;line-height:1.3">
        <div style="background:#2d3748;padding:5px 7px 4px">
          <div style="${s(6)}font-weight:700;color:#fff">${dummyData.name}</div>
          <div style="${s(3)}color:#cbd5e0">${dummyData.contact}</div>
        </div>
        <div style="display:flex;padding:4px 7px;gap:6px">
          <div style="flex:1">
            <div style="${s(3.5)}font-weight:700;color:#2d3748;border-bottom:1px solid #2d3748;margin-bottom:2px">EXPERIENCE</div>
            ${dummyData.exp.map((e: any) => `<div style="${s(3)}"><b>${e.title}</b><br/>${e.company}</div>`).join("")}
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
        <div style="${s(8)}font-weight:700;color:#dc3545;text-transform:uppercase;letter-spacing:0.5px">${dummyData.name}</div>
        <div style="${s(3.5)}color:#888;margin-bottom:3px">${dummyData.contact}</div>
        <div style="${s(4.5)}font-weight:700;color:#dc3545;margin:3px 0 1px">EXPERIENCE</div>
        <div style="width:12px;height:1px;background:#dc3545;margin-bottom:2px"></div>
        ${dummyData.exp.map((e: any) => `<div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
      </div>`;

    case "compact":
      return `<div style="font-family:Arial,sans-serif;padding:5px 5px;color:#222;line-height:1.3;text-align:center">
        <div style="${s(5.5)}font-weight:700">${dummyData.name}</div>
        <div style="${s(2.5)}color:#888;margin-bottom:2px">${dummyData.contact}</div>
        <div style="border-bottom:1px solid #000;margin:2px 0"></div>
        <div style="text-align:left">
          <div style="${s(3.5)}font-weight:700;border-bottom:1px solid #bbb;margin:2px 0 1px">EXPERIENCE</div>
          ${dummyData.exp.map((e: any) => `<div style="${s(3)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
          <div style="${s(3.5)}font-weight:700;border-bottom:1px solid #bbb;margin:2px 0 1px">EDUCATION</div>
          <div style="${s(3)}">${dummyData.edu.degree}</div>
        </div>
      </div>`;

    case "professional":
      return `<div style="font-family:Arial,sans-serif;padding:8px 7px;color:#222;line-height:1.3">
        <div style="height:3px;background:#192a56;margin:-8px -7px 5px"></div>
        <div style="${s(7.5)}font-weight:700;color:#192a56">${dummyData.name}</div>
        <div style="${s(3.5)}color:#888;margin-bottom:2px">${dummyData.contact}</div>
        <div style="border-bottom:2px solid #192a56;margin:2px 0 3px"></div>
        <div style="${s(4)}font-weight:700;color:#192a56">EXPERIENCE</div>
        <div style="border-bottom:2px solid #192a56;margin:1px 0 2px"></div>
        ${dummyData.exp.map((e: any) => `<div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
      </div>`;

    case "ats":
      return `<div style="font-family:Arial,sans-serif;padding:7px 6px;color:#222;line-height:1.3">
        <div style="${s(6)}font-weight:700">${dummyData.name}</div>
        <div style="${s(3.5)}color:#555;margin-bottom:2px">${dummyData.contact}</div>
        <div style="border-bottom:1px solid #000;margin:2px 0 3px"></div>
        <div style="${s(4)}font-weight:700">EXPERIENCE</div>
        <div style="border-bottom:1px solid #000;margin:1px 0 2px"></div>
        ${dummyData.exp.map((e: any) => `<div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
        <div style="${s(4)}font-weight:700;margin-top:3px">EDUCATION</div>
        <div style="border-bottom:1px solid #000;margin:1px 0 2px"></div>
        <div style="${s(3.5)}">${dummyData.edu.degree} — ${dummyData.edu.school}</div>
      </div>`;

    case "simple":
      return `<div style="font-family:Arial,sans-serif;padding:8px 7px;color:#222;line-height:1.3;text-align:center">
        <div style="${s(7)}font-weight:700">${dummyData.name}</div>
        <div style="${s(3.5)}color:#888;margin-bottom:3px">${dummyData.contact}</div>
        <div style="text-align:left">
          <div style="${s(4)}font-weight:700">EXPERIENCE</div>
          <div style="border-bottom:1px solid #ccc;margin:1px 0 2px"></div>
          ${dummyData.exp.map((e: any) => `<div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
        </div>
      </div>`;

    case "elegant":
      return `<div style="font-family:Arial,sans-serif;padding:8px 7px;color:#222;line-height:1.3">
        <div style="border-top:2px solid #b49146;margin:-8px -7px 0;padding:6px 7px 0">
          <div style="${s(7)}font-weight:700;color:#3c3c3c;text-align:center">${dummyData.name}</div>
          <div style="${s(3.5)}color:#888;text-align:center;margin-bottom:2px">${dummyData.contact}</div>
          <div style="border-bottom:1px solid #b49146;margin:2px 0 3px"></div>
        </div>
        <div style="${s(3.5)}font-weight:700;color:#b49146;text-transform:uppercase;letter-spacing:0.5px">EXPERIENCE</div>
        <div style="border-bottom:1px solid #b49146;margin:1px 0 2px"></div>
        ${dummyData.exp.map((e: any) => `<div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
      </div>`;

    case "ivyleague":
      return `<div style="font-family:Arial,sans-serif;padding:8px 7px;color:#222;line-height:1.3;text-align:center">
        <div style="${s(7)}font-weight:700">${dummyData.name}</div>
        <div style="${s(3)}color:#666;margin-bottom:2px">${dummyData.contact}</div>
        <div style="border-top:1.5px solid #555;border-bottom:0.5px solid #555;height:2px;margin:3px 0"></div>
        <div style="text-align:left">
          <div style="${s(3.5)}font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px;margin:3px 0 1px;border-bottom:0.5px solid #888;padding-bottom:1px">EXPERIENCE</div>
          ${dummyData.exp.map((e: any) => `<div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
          <div style="${s(3.5)}font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px;margin:3px 0 1px;border-bottom:0.5px solid #888;padding-bottom:1px">EDUCATION</div>
          <div style="${s(3.5)}">${dummyData.edu.degree}</div>
        </div>
      </div>`;

    case "timeline":
      return `<div style="font-family:Arial,sans-serif;padding:8px 7px;color:#222;line-height:1.3">
        <div style="height:2px;background:#2962ff;margin:-8px -7px 5px"></div>
        <div style="${s(7)}font-weight:700;color:#2962ff">${dummyData.name}</div>
        <div style="${s(3.5)}color:#888;margin-bottom:4px">${dummyData.contact}</div>
        <div style="${s(4)}font-weight:700;color:#2962ff;margin:3px 0 2px">EXPERIENCE</div>
        ${dummyData.exp.map((e: any, i: number) => `<div style="display:flex;gap:3px;margin-bottom:2px"><div style="display:flex;flex-direction:column;align-items:center"><div style="width:4px;height:4px;border-radius:50%;background:#2962ff;flex-shrink:0;margin-top:1px"></div>${i < dummyData.exp.length - 1 ? '<div style="width:0.5px;flex:1;background:#2962ff"></div>' : ''}</div><div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}<br/><span style="color:#888;${s(2.5)}">${e.date}</span></div></div>`).join("")}
      </div>`;

    case "contemporary":
      return `<div style="font-family:Arial,sans-serif;color:#222;line-height:1.3">
        <div style="background:#10a37f;padding:5px 7px 4px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="${s(7)}font-weight:700;color:#fff">${dummyData.name}</div>
            <div style="${s(3)}color:#dcfff0">${dummyData.contact}</div>
          </div>
          <div style="width:16px;height:16px;border-radius:50%;background:#fff;flex-shrink:0"></div>
        </div>
        <div style="padding:2px 7px">
          <div style="${s(3.5)}font-weight:700;color:#10a37f;text-transform:uppercase;border-bottom:1px solid #10a37f;margin:3px 0 2px;padding-bottom:1px">EXPERIENCE</div>
          ${dummyData.exp.map((e: any) => `<div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
        </div>
      </div>`;

    case "polished":
      return `<div style="display:flex;font-family:Arial,sans-serif;height:100%;color:#222;line-height:1.3">
        <div style="width:35%;background:#a64834;color:#fff;padding:6px 5px">
          <div style="${s(5)}font-weight:700;margin-bottom:4px">${dummyData.name}</div>
          <div style="${s(3)}color:#ffd2be;font-weight:700;margin-bottom:1px">CONTACT</div>
          <div style="${s(2.5)}color:#f0d0c0">john@email.com</div>
          <div style="${s(2.5)}color:#f0d0c0">(555) 123-4567</div>
          <div style="${s(3)}color:#ffd2be;font-weight:700;margin:3px 0 1px">SKILLS</div>
          <div style="${s(2.5)}color:#f0d0c0">• React</div>
          <div style="${s(2.5)}color:#f0d0c0">• TypeScript</div>
        </div>
        <div style="flex:1;padding:6px 5px">
          <div style="${s(3.5)}font-weight:700;color:#a64834;text-transform:uppercase;border-bottom:1px solid #a64834;margin-bottom:2px;padding-bottom:1px">EXPERIENCE</div>
          ${dummyData.exp.map((e: any) => `<div style="${s(3)}"><b>${e.title}</b></div>`).join("")}
          <div style="${s(3.5)}font-weight:700;color:#a64834;text-transform:uppercase;border-bottom:1px solid #a64834;margin:3px 0 2px;padding-bottom:1px">EDUCATION</div>
          <div style="${s(3)}">${dummyData.edu.degree}</div>
        </div>
      </div>`;

    case "cobalt":
      return `<div style="font-family:'Times New Roman',Times,serif;color:#222;line-height:1.3">
        <div style="background:#1d4e89;padding:6px 7px 5px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="${s(7)}font-weight:700;color:#fff">${dummyData.name}</div>
            <div style="${s(3)}color:#d0dce8;font-family:Arial,sans-serif">${dummyData.contact}</div>
          </div>
          <div style="width:16px;height:16px;border-radius:50%;background:rgba(255,255,255,0.3)"></div>
        </div>
        <div style="padding:4px 7px">
          <div style="${s(4)}font-weight:700;color:#1d4e89;margin-bottom:2px"><span style="border-bottom:1px solid #1d4e89;padding-bottom:1px;display:inline-block">EXPERIENCE</span></div>
          ${dummyData.exp.map((e: any) => `<div style="${s(3.5)}"><b>${e.title}</b> — <i>${e.company}</i></div>`).join("")}
          <div style="${s(4)}font-weight:700;color:#1d4e89;margin:4px 0 2px"><span style="border-bottom:1px solid #1d4e89;padding-bottom:1px;display:inline-block">EDUCATION</span></div>
          <div style="${s(3.5)}"><b>${dummyData.edu.degree}</b> — <i>${dummyData.edu.school}</i></div>
        </div>
      </div>`;

    case "ats-olivia":
      return `<div style="font-family:Arial,sans-serif;padding:8px 8px;color:#222;line-height:1.25;text-align:center">
        <div style="${s(6)}font-weight:700;color:#0f3c5f;margin-bottom:1px">${dummyData.name}</div>
        <div style="${s(3)}color:#555;text-transform:uppercase;letter-spacing:0.3px;margin-bottom:2px">Head of Customer Service</div>
        <div style="${s(2.8)}color:#666;margin-bottom:3px">${dummyData.contact}</div>
        
        <div style="border-top:1px solid #0f3c5f;border-bottom:1px solid #0f3c5f;padding:1px 0;margin:3px auto 2px;width:90%">
          <span style="${s(3.2)}font-weight:700;color:#0f3c5f;text-transform:uppercase;letter-spacing:0.5px">Summary</span>
        </div>
        <div style="${s(2.8)}color:#444;margin-bottom:4px">${dummyData.summary.slice(0, 100)}…</div>
        
        <div style="border-top:1px solid #0f3c5f;border-bottom:1px solid #0f3c5f;padding:1px 0;margin:3px auto 2px;width:90%">
          <span style="${s(3.2)}font-weight:700;color:#0f3c5f;text-transform:uppercase;letter-spacing:0.5px">Experience</span>
        </div>
        <div style="text-align:left;padding:0 4px">
          ${dummyData.exp.slice(0, 2).map((e: any) => `
            <div style="margin-bottom:2px">
              <div style="display:flex;justify-content:space-between;${s(2.8)}">
                <b>${e.title}</b>
                <span style="color:#666">${e.date.split(" — ")[1] || e.date}</span>
              </div>
              <div style="${s(2.5)}color:#555;font-style:italic">${e.company}</div>
            </div>
          `).join("")}
        </div>
        
        <div style="border-top:1px solid #0f3c5f;border-bottom:1px solid #0f3c5f;padding:1px 0;margin:3px auto 2px;width:90%">
          <span style="${s(3.2)}font-weight:700;color:#0f3c5f;text-transform:uppercase;letter-spacing:0.5px">Skills</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1.5px;${s(2.6)};padding:0 4px">
          ${dummyData.skills.split(" • ").slice(0, 8).map((sk: string) => `<div style="text-align:center">• ${sk}</div>`).join("")}
        </div>
      </div>`;

    case "tpl_cre_maria":
      return `<div style="font-family:Arial,sans-serif;color:#222;line-height:1.25">
        <div style="background:#2c3e50;padding:6px 8px;color:#fff;display:flex;justify-content:space-between;align-items:center">
          <div style="flex:1">
            <div style="${s(6)}font-weight:700">${dummyData.name}</div>
            <div style="${s(3)}color:#e67e22;font-weight:600;text-transform:uppercase;letter-spacing:0.3px;margin-top:1px">Head of Operations</div>
            <div style="${s(2.5)}color:#ccc;margin-top:2px;display:flex;gap:4px">${dummyData.contact.split(" • ").slice(0, 3).join(" • ")}</div>
          </div>
          <div style="width:14px;height:14px;border-radius:50%;background:#eee;border:1px solid #e67e22;flex-shrink:0;margin-left:4px"></div>
        </div>
        <div style="padding:4px 8px">
          <div style="display:flex;align-items:center;gap:3px;border-bottom:1px solid #e67e22;padding-bottom:1px;margin:3px 0 2px">
            <span style="${s(3.2)}font-weight:700;text-transform:uppercase;color:#111">Summary</span>
          </div>
          <div style="${s(2.8)}color:#444;margin-bottom:3px">${dummyData.summary.slice(0, 100)}…</div>
          
          <div style="display:flex;align-items:center;gap:3px;border-bottom:1px solid #e67e22;padding-bottom:1px;margin:3px 0 2px">
            <span style="${s(3.2)}font-weight:700;text-transform:uppercase;color:#111">Experience</span>
          </div>
          ${dummyData.exp.slice(0, 2).map((e: any) => `
            <div style="margin-bottom:2px;${s(2.8)}">
              <div style="display:flex;justify-content:space-between;font-weight:bold;color:#111">
                <span>${e.title}</span>
                <span style="font-weight:normal;color:#666">${e.date.split(" — ")[1] || e.date}</span>
              </div>
              <div style="color:#555;font-style:italic">${e.company}</div>
            </div>
          `).join("")}
          
          <div style="display:flex;align-items:center;gap:3px;border-bottom:1px solid #e67e22;padding-bottom:1px;margin:3px 0 2px">
            <span style="${s(3.2)}font-weight:700;text-transform:uppercase;color:#111">Skills</span>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:2px;margin-top:2px">
            ${dummyData.skills.split(" • ").slice(0, 5).map((sk: string) => `
              <span style="background:#fdf6f0;color:#e67e22;border:0.5px solid #fbe6d5;padding:1px 3px;border-radius:6px;${s(2.5)};font-weight:500">${sk}</span>
            `).join("")}
          </div>
        </div>
      </div>`;

    case "tpl_cre_lucia":
      return `<div style="font-family:Georgia,serif;padding:6px 8px;color:#222;line-height:1.25">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:0.5px solid #eee;padding-bottom:3px;margin-bottom:3px">
          <div>
            <div style="${s(5.5)}font-weight:700;color:#111">${dummyData.name}</div>
            <div style="${s(3)}color:#555;font-style:italic;margin-top:1px">Director of Strategic Planning</div>
            <div style="${s(2.5)}color:#666;margin-top:1px">${dummyData.contact.split(" • ").slice(0, 3).join(" | ")}</div>
          </div>
          <div style="width:14px;height:14px;border-radius:50%;background:#eee;border:0.5px solid #ddd;flex-shrink:0"></div>
        </div>
        
        <div style="display:flex;gap:6px">
          <div style="width:60%">
            <div style="text-align:center;margin:3px 0 2px">
              <div style="border-top:0.8px solid #8e44ad;border-bottom:0.8px solid #8e44ad;padding:0.5px 0">
                <span style="${s(3)}font-weight:700;text-transform:uppercase;color:#8e44ad;letter-spacing:0.5px">Profile</span>
              </div>
            </div>
            <div style="${s(2.6)}color:#333;margin-bottom:3px">${dummyData.summary.slice(0, 70)}…</div>
            
            <div style="text-align:center;margin:3px 0 2px">
              <div style="border-top:0.8px solid #8e44ad;border-bottom:0.8px solid #8e44ad;padding:0.5px 0">
                <span style="${s(3)}font-weight:700;text-transform:uppercase;color:#8e44ad;letter-spacing:0.5px">Experience</span>
              </div>
            </div>
            ${dummyData.exp.slice(0, 2).map((e: any) => `
              <div style="margin-bottom:2px;${s(2.6)}">
                <div style="font-weight:bold;color:#111">${e.title}</div>
                <div style="color:#555;font-style:italic">${e.company}</div>
              </div>
            `).join("")}
          </div>
          
          <div style="width:40%">
            <div style="text-align:center;margin:3px 0 2px">
              <div style="border-top:0.8px solid #8e44ad;border-bottom:0.8px solid #8e44ad;padding:0.5px 0">
                <span style="${s(3)}font-weight:700;text-transform:uppercase;color:#8e44ad;letter-spacing:0.5px">Education</span>
              </div>
            </div>
            <div style="${s(2.5)};color:#333">
              <b>BBA</b><br/>
              <span style="color:#555">Florida Intl Univ</span>
            </div>
            
            <div style="text-align:center;margin:3px 0 2px">
              <div style="border-top:0.8px solid #8e44ad;border-bottom:0.8px solid #8e44ad;padding:0.5px 0">
                <span style="${s(3)}font-weight:700;text-transform:uppercase;color:#8e44ad;letter-spacing:0.5px">Skills</span>
              </div>
            </div>
            <div style="${s(2.5)};color:#333">
              ${dummyData.skills.split(" • ").slice(0, 4).map((sk: string) => `
                <div style="border-left:1px solid #8e44ad;padding-left:3px;margin-bottom:1.5px;font-weight:500">${sk}</div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>`;

    case "tpl_cre_anna":
      return `<div style="font-family:Arial,sans-serif;color:#222;line-height:1.25;text-align:center">
        <div style="background:#f5f3ff;padding:6px 8px;border-bottom:1.5px solid #7c3aed">
          <div style="width:14px;height:14px;border-radius:50%;background:#eee;border:1px solid #fff;margin:0 auto 2px;box-shadow:0 1px 3px rgba(0,0,0,0.1)"></div>
          <div style="${s(5.5)}font-weight:700;color:#7c3aed">${dummyData.name}</div>
          <div style="${s(2.8)}color:#555;text-transform:uppercase;letter-spacing:0.3px">Junior Project Manager</div>
          <div style="${s(2.5)}color:#666;margin-top:1.5px">${dummyData.contact.split(" • ").slice(0, 3).join(" • ")}</div>
        </div>
        <div style="padding:4px 8px">
          <div style="margin:3px auto;background:#f5f3ff;padding:1px 6px;border-radius:3px;display:inline-block;border-bottom:1px solid #7c3aed">
            <span style="${s(3)}font-weight:700;text-transform:uppercase;color:#7c3aed">Profile</span>
          </div>
          <div style="${s(2.6)}color:#333;margin-bottom:3px">${dummyData.summary.slice(0, 80)}…</div>
          
          <div style="margin:3px auto;background:#f5f3ff;padding:1px 6px;border-radius:3px;display:inline-block;border-bottom:1px solid #7c3aed">
            <span style="${s(3)}font-weight:700;text-transform:uppercase;color:#7c3aed">Experience</span>
          </div>
          <div style="text-align:left">
            ${dummyData.exp.slice(0, 2).map((e: any) => `
              <div style="margin-bottom:2px;${s(2.6)}">
                <div style="font-weight:bold;color:#111">${e.title} <span style="font-weight:normal;font-style:italic;color:#555">— ${e.company}</span></div>
              </div>
            `).join("")}
          </div>
          
          <div style="margin:3px auto;background:#f5f3ff;padding:1px 6px;border-radius:3px;display:inline-block;border-bottom:1px solid #7c3aed">
            <span style="${s(3)}font-weight:700;text-transform:uppercase;color:#7c3aed">Skills</span>
          </div>
          <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:2px;margin-top:2px">
            ${dummyData.skills.split(" • ").slice(0, 5).map((sk: string) => `
              <span style="background:#f5f3ff;color:#7c3aed;padding:1px 3px;border-radius:3px;border:0.5px dashed #ccc;${s(2.5)}">${sk}</span>
            `).join("")}
          </div>
        </div>
      </div>`;

    case "tpl_cre_antoine":
      return `<div style="font-family:Arial,sans-serif;color:#222;line-height:1.25">
        <div style="background:#e0f2fe;padding:6px 8px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="${s(5.5)}font-weight:700;color:#111">${dummyData.name}</div>
            <div style="${s(2.8)}color:#0284c7;font-weight:600;margin-top:1px">Consulting Director</div>
            <div style="${s(2.4)}color:#444;margin-top:1.5px;display:grid;grid-template-columns:1fr 1fr;gap:1px 4px">
              ${dummyData.contact.split(" • ").slice(0, 4).map((c: string) => `<div>${c.slice(0, 15)}</div>`).join("")}
            </div>
          </div>
          <div style="width:16px;height:16px;border-radius:3px;background:#eee;border:1px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.1);flex-shrink:0"></div>
        </div>
        <div style="display:flex;padding:4px 8px;gap:6px">
          <div style="width:60%">
            <div style="border-bottom:1px solid #0284c7;padding-bottom:0.5px;margin:3px 0 2px">
              <span style="${s(3)}font-weight:700;text-transform:uppercase;color:#0284c7">Summary</span>
            </div>
            <div style="${s(2.6)}color:#333;margin-bottom:3px">${dummyData.summary.slice(0, 80)}…</div>
            
            <div style="border-bottom:1px solid #0284c7;padding-bottom:0.5px;margin:3px 0 2px">
              <span style="${s(3)}font-weight:700;text-transform:uppercase;color:#0284c7">Experience</span>
            </div>
            ${dummyData.exp.slice(0, 2).map((e: any) => `
              <div style="margin-bottom:2px;${s(2.6)}">
                <div style="font-weight:bold;color:#111">${e.title}</div>
                <div style="color:#555;font-style:italic">${e.company}</div>
              </div>
            `).join("")}
          </div>
          <div style="width:40%">
            <div style="border-bottom:1px solid #0284c7;padding-bottom:0.5px;margin:3px 0 2px">
              <span style="${s(3)}font-weight:700;text-transform:uppercase;color:#0284c7">Education</span>
            </div>
            <div style="${s(2.5)};color:#333">
              <b>BBA</b><br/>
              <span style="color:#555">Florida Intl Univ</span>
            </div>
            
            <div style="border-bottom:1px solid #0284c7;padding-bottom:0.5px;margin:3px 0 2px">
              <span style="${s(3)}font-weight:700;text-transform:uppercase;color:#0284c7">Skills</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:1.5px;margin-top:2px">
              ${dummyData.skills.split(" • ").slice(0, 4).map((sk: string) => `
                <span style="background:#f0f9ff;border:0.5px solid #bae6fd;color:#0369a1;padding:1px 3px;border-radius:2px;${s(2.3)};font-weight:500">${sk}</span>
              `).join("")}
            </div>
          </div>
        </div>
      </div>`;

    default: {
      // Config-driven ATS templates
      if (isATSTemplateId(templateId)) {
        const config = getATSConfig(templateId);
        if (config) return buildATSThumbnail(config, dummyData);
      }
      // Dynamic generated templates
      const dynamicConfig = ALL_DYNAMIC_TEMPLATES.find(t => t.template_id === templateId);
      if (dynamicConfig) return buildDynamicThumbnail(dynamicConfig, dummyData);
      
      // Classic fallback
      return `<div style="font-family:Arial,sans-serif;padding:8px 7px;color:#222;line-height:1.3">
        <div style="${s(7)}font-weight:700">${dummyData.name}</div>
        <div style="${s(3.5)}color:#888;margin-bottom:3px">${dummyData.contact}</div>
        <div style="border-bottom:1px solid #ccc;margin:3px 0 2px;padding-bottom:1px"><span style="${s(4)}font-weight:700">EXPERIENCE</span></div>
        ${dummyData.exp.map((e: any) => `<div style="${s(3.5)}"><b>${e.title}</b> — ${e.company}</div>`).join("")}
        <div style="border-bottom:1px solid #ccc;margin:3px 0 2px;padding-bottom:1px"><span style="${s(4)}font-weight:700">EDUCATION</span></div>
        <div style="${s(3.5)}">${dummyData.edu.degree} — ${dummyData.edu.school}</div>
      </div>`;
    }
  }
}

function buildDynamicThumbnail(config: any, dummyData: any): string {
  const s = (fontSize: number) => `font-size:${fontSize}px;`;
  const layout = config.layout_metadata;
  const primary = layout.color_palette.primary;
  
  if (layout.sidebar_position === 'left' || layout.sidebar_position === 'asymmetrical-left') {
     return `<div style="display:flex;font-family:Arial,sans-serif;height:100%;color:#222;line-height:1.3;overflow:hidden">
        <div style="width:35%;background:${primary};color:#fff;padding:6px 5px">
          ${layout.has_photo ? `<img src="${dummyData.photoUrl}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;margin:0 auto 4px;display:block" />` : ''}
          <div style="${s(5)}font-weight:700;margin-bottom:4px;text-align:${layout.has_photo ? 'center' : 'left'}">${dummyData.name}</div>
          <div style="${s(3)}font-weight:700;margin-bottom:1px">CONTACT</div>
          <div style="${s(2.5)}margin-bottom:4px">${dummyData.contact.split(' • ').join('<br/>')}</div>
          <div style="${s(3)}font-weight:700;margin-bottom:1px">SKILLS</div>
          <div style="${s(2.5)}margin-bottom:4px">${dummyData.skills.split(' • ').map((sk: string) => `• ${sk}`).join('<br/>')}</div>
        </div>
        <div style="flex:1;padding:6px 5px">
          <div style="${s(3.5)}font-weight:700;color:${primary};border-bottom:1px solid ${primary};margin-bottom:2px">SUMMARY</div>
          <div style="${s(3)}margin-bottom:4px">${dummyData.summary}</div>
          <div style="${s(3.5)}font-weight:700;color:${primary};border-bottom:1px solid ${primary};margin-bottom:2px">EXPERIENCE</div>
          ${dummyData.exp.map((e: any) => `<div style="margin-bottom:3px"><div style="${s(3)}"><b>${e.title}</b> — ${e.company}</div>${e.bullets.map((b: string) => `<div style="${s(2.5)}color:#555">• ${b}</div>`).join("")}</div>`).join("")}
          <div style="${s(3.5)}font-weight:700;color:${primary};border-bottom:1px solid ${primary};margin-bottom:2px">EDUCATION</div>
          <div style="${s(3)}"><b>${dummyData.edu.degree}</b><br/>${dummyData.edu.school} | ${dummyData.edu.date || ''}</div>
        </div>
      </div>`;
  } else {
     return `<div style="font-family:Arial,sans-serif;padding:8px 7px;color:#222;line-height:1.3;overflow:hidden;height:100%">
        <div style="height:4px;background:${primary};margin:-8px -7px 5px"></div>
        <div style="display:flex;justify-content:space-between;align-items:center">
           <div>
              <div style="${s(7)}font-weight:700;color:${primary}">${dummyData.name}</div>
              <div style="${s(3.5)}color:#888;margin-bottom:3px">${dummyData.contact}</div>
           </div>
           ${layout.has_photo ? `<img src="${dummyData.photoUrl}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;margin-right:2px" />` : ''}
        </div>
        <div style="${s(3)}margin-bottom:4px">${dummyData.summary}</div>
        <div style="border-bottom:1px solid ${primary};margin:3px 0 2px;padding-bottom:1px"><span style="${s(4)}font-weight:700">EXPERIENCE</span></div>
        ${dummyData.exp.map((e: any) => `<div style="margin-bottom:3px"><div style="${s(3.5)}"><b>${e.title}</b> — ${e.company} <span style="color:#888;font-size:2.5px">${e.date}</span></div>${e.bullets.map((b: string) => `<div style="${s(3)}color:#555">• ${b}</div>`).join("")}</div>`).join("")}
        <div style="border-bottom:1px solid ${primary};margin:3px 0 2px;padding-bottom:1px"><span style="${s(4)}font-weight:700">EDUCATION</span></div>
        <div style="${s(3.5)}"><b>${dummyData.edu.degree}</b> — ${dummyData.edu.school}</div>
      </div>`;
  }
}

function buildATSThumbnail(config: ATSTemplateConfig, dummyData: any): string {
  const s = (fontSize: number) => `font-size:${fontSize}px;font-family:${config.fontFamilyCSS};`;
  const nameSize = Math.min(config.nameFontSize * 0.45, 9);
  const headSize = Math.min(config.headingFontSize * 0.4, 5);
  const baseSize = Math.min(config.baseFontSize * 0.38, 4);
  const padSize = Math.max(config.marginSize * 0.35, 5);
  const primary = config.primaryColor || "#000000";

  const sectionLabel = (label: string) =>
    `<div style="border-bottom:1px solid ${primary};margin:${config.lineSpacing * 0.6}px 0 ${config.lineSpacing * 0.3}px;padding-bottom:1px"><span style="${s(headSize)}font-weight:700;color:${primary};text-transform:uppercase">${label}</span></div>`;

  const sectionBuilders: Record<string, () => string> = {
    summary: () => `${sectionLabel("Summary")}<div style="${s(baseSize)}color:#444">${dummyData.summary}</div>`,
    skills: () => `${sectionLabel("Skills")}<div style="${s(baseSize)}">${dummyData.skills}</div>`,
    experience: () => `${sectionLabel("Experience")}${dummyData.exp.map((e: any) => `<div style="${s(baseSize)}"><b>${e.title}</b> — ${e.company} <span style="color:#888">${e.date}</span></div>`).join("")}`,
    education: () => `${sectionLabel("Education")}<div style="${s(baseSize)}">${dummyData.edu.degree} — ${dummyData.edu.school}</div>`,
    languages: () => "",
    custom: () => "",
  };

  const content = config.sectionOrder
    .filter(sec => config.sectionVisibility[sec])
    .map(sec => sectionBuilders[sec]?.() || "")
    .filter(Boolean)
    .join("");

  return `<div style="font-family:${config.fontFamilyCSS};padding:${padSize}px;color:#222;line-height:1.3">
    <div style="${s(nameSize)}font-weight:700;color:${primary}">${dummyData.name}</div>
    <div style="${s(baseSize - 0.5)}color:#888;margin-bottom:2px">${dummyData.contact}</div>
    <div style="border-bottom:1px solid ${primary};margin:2px 0 3px"></div>
    ${content}
  </div>`;
}

const STATIC_THUMBNAILS: Record<string, string> = {
  "ats-olivia": "/templates/thumbnails/ats-olivia.png",
  "tpl_cre_maria": "/templates/thumbnails/tpl_cre_maria.png",
  "tpl_cre_lucia": "/templates/thumbnails/tpl_cre_lucia.png",
  "tpl_cre_anna": "/templates/thumbnails/tpl_cre_anna.png",
  "tpl_cre_antoine": "/templates/thumbnails/tpl_cre_antoine.png",
};

interface TemplateThumbnailProps {
  templateId: TemplateId;
  data?: ResumeData;
}

export default function TemplateThumbnail({ templateId, data }: TemplateThumbnailProps) {
  const staticSrc = STATIC_THUMBNAILS[templateId];
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (staticSrc) return;
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          setScale(entry.contentRect.width / 140);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [staticSrc]);

  if (staticSrc) {
    return (
      <div
        ref={containerRef}
        className="w-full bg-white rounded border border-border overflow-hidden relative"
        style={{ aspectRatio: "595 / 842" }}
      >
        <img
          src={staticSrc}
          alt={templateId}
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>
    );
  }

  const html = useMemo(() => getThumbnailHTML(templateId, data), [templateId, data]);

  return (
    <div
      ref={containerRef}
      className="w-full bg-white rounded border border-border overflow-hidden relative"
      style={{ aspectRatio: "595 / 842" }}
    >
      <div
        className="absolute top-0 left-0 pointer-events-none select-none"
        style={{
          width: "140px",
          height: "198px",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
