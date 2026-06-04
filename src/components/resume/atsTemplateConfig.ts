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
  primaryColor?: string;
}

export const ATS_TEMPLATES: ATSTemplateConfig[] = [
  {
    id: "ats-classic-serif",
    name: "ATS Classic Serif",
    description: "Traditional centered layout with elegant serif typography and horizontal dividers.",
    recommendedFor: "Corporate Roles, Management & Finance",
    fontFamily: "times",
    fontFamilyCSS: "'Times New Roman', Times, serif",
    baseFontSize: 10.5,
    headingFontSize: 13,
    nameFontSize: 24,
    lineSpacing: 5.2,
    marginSize: 20,
    sectionOrder: ["summary", "experience", "education", "skills", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    isBestForATS: true,
    primaryColor: "#111111"
  },
  {
    id: "ats-modern-blue",
    name: "ATS Modern Blue",
    description: "Sleek left-aligned layout with blue accent headings and styled language proficiencies.",
    recommendedFor: "Sales, Marketing & Tech",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 10,
    headingFontSize: 12,
    nameFontSize: 22,
    lineSpacing: 4.8,
    marginSize: 18,
    sectionOrder: ["summary", "experience", "education", "skills", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#2b5c8f"
  },
  {
    id: "ats-executive-dots",
    name: "ATS Executive Serif",
    description: "Executive centered format featuring serif headings and inline language proficiency ratings.",
    recommendedFor: "Executives & Product Leaders",
    fontFamily: "times",
    fontFamilyCSS: "'Times New Roman', Times, serif",
    baseFontSize: 10.5,
    headingFontSize: 13.5,
    nameFontSize: 23,
    lineSpacing: 5.0,
    marginSize: 20,
    sectionOrder: ["summary", "experience", "education", "skills", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#111111"
  },
  {
    id: "ats-two-column-icon",
    name: "ATS Two Column Icon",
    description: "Modern two-column layout with section icons, left-hand skills and languages, and right-hand professional history.",
    recommendedFor: "Marketing, Creatives & Directors",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 10,
    headingFontSize: 12,
    nameFontSize: 22,
    lineSpacing: 4.6,
    marginSize: 18,
    sectionOrder: ["summary", "education", "skills", "languages", "experience", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#111111"
  },
  {
    id: "ats-olivia",
    name: "ATS Olivia",
    description: "Centered sans-serif layout with thin double borders and multi-column lists.",
    recommendedFor: "Customer Service, HR & Administrative Roles",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 10,
    headingFontSize: 12,
    nameFontSize: 24,
    lineSpacing: 4.8,
    marginSize: 18,
    sectionOrder: ["summary", "skills", "experience", "education", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#0f3c5f"
  }
];

export function getATSConfig(templateId: string): ATSTemplateConfig | undefined {
  return ATS_TEMPLATES.find(t => t.id === templateId);
}

export function isATSTemplateId(id: string): boolean {
  return id.startsWith("ats-");
}

export function recommendATSTemplate(jobTitle: string): string {
  return "ats";
}
