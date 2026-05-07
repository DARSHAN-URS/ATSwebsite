/**
 * Config-driven ATS-safe resume template system.
 * Templates differ only in section order, spacing, font sizing, and emphasis.
 * All use single-column, standard fonts, no icons/images/tables.
 */

export type ATSSection = "summary" | "skills" | "experience" | "education" | "languages" | "custom";

export interface ATSTemplateConfig {
  id: string;
  name: string;
  description: string;
  recommendedFor: string;
  fontFamily: "helvetica" | "times" | "courier"; // jsPDF built-in fonts
  fontFamilyCSS: string; // CSS font-family for HTML preview
  baseFontSize: number;       // pt for PDF, maps to px for HTML
  headingFontSize: number;    // section heading size
  nameFontSize: number;       // name size
  lineSpacing: number;        // mm between lines in PDF
  marginSize: number;         // mm margins in PDF
  sectionOrder: ATSSection[];
  sectionVisibility: Record<ATSSection, boolean>;
  isBestForATS?: boolean;
  /** Whether to group skills by category (for technical template) */
  groupSkills?: boolean;
  /** Layout variant: chronological or combination */
  layoutVariant?: "chronological" | "combination";
}

export const ATS_TEMPLATES: ATSTemplateConfig[] = [
  {
    id: "ats-classic",
    name: "Classic ATS",
    description: "Traditional chronological layout, most ATS-compatible. The safe default.",
    recommendedFor: "All roles",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 10,
    headingFontSize: 12,
    nameFontSize: 18,
    lineSpacing: 5,
    marginSize: 20,
    sectionOrder: ["summary", "experience", "education", "skills", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    isBestForATS: true,
  },
  {
    id: "ats-modern-pro",
    name: "Modern Professional",
    description: "Larger headings, tighter spacing, improved hierarchy for a contemporary look.",
    recommendedFor: "Corporate & Tech roles",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 10,
    headingFontSize: 13,
    nameFontSize: 22,
    lineSpacing: 4.5,
    marginSize: 18,
    sectionOrder: ["summary", "experience", "skills", "education", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
  },
  {
    id: "ats-skills-first",
    name: "Skills-First",
    description: "Skills section appears before experience. Ideal for keyword-heavy roles.",
    recommendedFor: "Career switchers & Entry-level",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 10,
    headingFontSize: 12,
    nameFontSize: 18,
    lineSpacing: 5,
    marginSize: 20,
    sectionOrder: ["summary", "skills", "experience", "education", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
  },
  {
    id: "ats-experience",
    name: "Experience-Heavy",
    description: "Maximizes space for work experience and achievements. Education minimized.",
    recommendedFor: "Senior professionals & Managers",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 10,
    headingFontSize: 12,
    nameFontSize: 18,
    lineSpacing: 5,
    marginSize: 18,
    sectionOrder: ["summary", "experience", "skills", "education", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
  },
  {
    id: "ats-fresher",
    name: "Fresher / Entry-Level",
    description: "Prioritizes education, projects, and skills over work experience.",
    recommendedFor: "Students & Fresh graduates",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 10,
    headingFontSize: 12,
    nameFontSize: 18,
    lineSpacing: 5,
    marginSize: 20,
    sectionOrder: ["summary", "education", "skills", "custom", "experience", "languages"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
  },
  {
    id: "ats-technical",
    name: "Technical / Engineering",
    description: "Grouped skill categories with structured experience for engineering roles.",
    recommendedFor: "Software Engineers & IT",
    fontFamily: "courier",
    fontFamilyCSS: "'Courier New', Courier, monospace",
    baseFontSize: 9.5,
    headingFontSize: 12,
    nameFontSize: 17,
    lineSpacing: 4.8,
    marginSize: 18,
    sectionOrder: ["summary", "skills", "experience", "education", "custom", "languages"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    groupSkills: true,
  },
  {
    id: "ats-compact",
    name: "Minimal Compact",
    description: "Fits strong profiles into one page. Reduced margins and tighter spacing.",
    recommendedFor: "Experienced professionals (one-page)",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 9,
    headingFontSize: 10,
    nameFontSize: 14,
    lineSpacing: 4,
    marginSize: 12,
    sectionOrder: ["summary", "experience", "skills", "education", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
  },
  {
    id: "ats-combination",
    name: "Combination Layout",
    description: "Hybrid format blending skills emphasis with chronological experience.",
    recommendedFor: "Career changers with transferable skills",
    fontFamily: "times",
    fontFamilyCSS: "'Times New Roman', Times, serif",
    baseFontSize: 10.5,
    headingFontSize: 13,
    nameFontSize: 20,
    lineSpacing: 5,
    marginSize: 20,
    sectionOrder: ["summary", "skills", "experience", "education", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    layoutVariant: "combination",
  },
];

export function getATSConfig(templateId: string): ATSTemplateConfig | undefined {
  return ATS_TEMPLATES.find(t => t.id === templateId);
}

export function isATSTemplateId(id: string): boolean {
  return id.startsWith("ats-");
}

/** Auto-recommend an ATS template based on job title */
export function recommendATSTemplate(jobTitle: string): string {
  const title = jobTitle.toLowerCase();
  if (/engineer|developer|devops|sre|architect|programmer|software|backend|frontend|fullstack|data scientist/i.test(title)) return "ats-technical";
  if (/student|intern|fresher|graduate|junior|entry/i.test(title)) return "ats-fresher";
  if (/manager|director|vp|head|lead|chief|senior|principal/i.test(title)) return "ats-experience";
  if (/career change|transition|switching/i.test(title)) return "ats-skills-first";
  return "ats-classic";
}
