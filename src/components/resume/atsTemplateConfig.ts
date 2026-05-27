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
  {
    id: "ats-academic",
    name: "Academic CV",
    description: "Detailed layout for research, publications, and academia.",
    recommendedFor: "Researchers & Academics",
    fontFamily: "times",
    fontFamilyCSS: "'Times New Roman', Times, serif",
    baseFontSize: 10,
    headingFontSize: 12,
    nameFontSize: 16,
    lineSpacing: 4.5,
    marginSize: 20,
    sectionOrder: ["summary", "education", "custom", "experience", "skills", "languages"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
  },
  {
    id: "ats-medical",
    name: "Healthcare / Medical",
    description: "Emphasizes education, licenses, and clinical experience.",
    recommendedFor: "Nurses, Doctors & Healthcare",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 9.5,
    headingFontSize: 11,
    nameFontSize: 18,
    lineSpacing: 4.5,
    marginSize: 18,
    sectionOrder: ["summary", "education", "custom", "experience", "skills", "languages"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
  },
  {
    id: "ats-legal",
    name: "Legal Professional",
    description: "Ultra-conservative, dense text format typical in law.",
    recommendedFor: "Lawyers & Paralegals",
    fontFamily: "times",
    fontFamilyCSS: "'Times New Roman', Times, serif",
    baseFontSize: 10,
    headingFontSize: 11,
    nameFontSize: 16,
    lineSpacing: 4,
    marginSize: 22,
    sectionOrder: ["summary", "education", "experience", "skills", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
  },
  {
    id: "ats-finance",
    name: "Finance & Banking",
    description: "Focus on quantifiable achievements, hard skills, and chronology.",
    recommendedFor: "Bankers, Analysts & Accountants",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 10,
    headingFontSize: 12,
    nameFontSize: 20,
    lineSpacing: 4.8,
    marginSize: 20,
    sectionOrder: ["summary", "experience", "education", "skills", "custom", "languages"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
  },
  {
    id: "ats-sales",
    name: "Sales & Account Management",
    description: "Highlights achievements, quotas, and communication skills upfront.",
    recommendedFor: "Sales Reps & Account Managers",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 10,
    headingFontSize: 13,
    nameFontSize: 22,
    lineSpacing: 5,
    marginSize: 15,
    sectionOrder: ["summary", "skills", "experience", "education", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
  },
  {
    id: "ats-marketing",
    name: "Marketing & Media",
    description: "Clean sans-serif layout emphasizing campaign results and tools.",
    recommendedFor: "Marketers & Content Creators",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 10.5,
    headingFontSize: 14,
    nameFontSize: 24,
    lineSpacing: 5.2,
    marginSize: 18,
    sectionOrder: ["summary", "experience", "skills", "education", "custom", "languages"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
  },
  {
    id: "ats-remote",
    name: "Remote Worker",
    description: "Highlights tech stack and async communication tools for global roles.",
    recommendedFor: "Remote Professionals",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 10,
    headingFontSize: 12,
    nameFontSize: 18,
    lineSpacing: 5,
    marginSize: 18,
    sectionOrder: ["summary", "skills", "experience", "education", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
  },
  {
    id: "ats-executive-pro",
    name: "Executive Pro",
    description: "Bold headings and generous spacing for leadership profiles.",
    recommendedFor: "C-Suite & Executives",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 11,
    headingFontSize: 14,
    nameFontSize: 26,
    lineSpacing: 5.5,
    marginSize: 20,
    sectionOrder: ["summary", "experience", "skills", "education", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
  },
  {
    id: "ats-freelance",
    name: "Freelancer / Contractor",
    description: "Puts custom sections (projects) and skills at the forefront.",
    recommendedFor: "Freelancers & Contractors",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 10,
    headingFontSize: 12,
    nameFontSize: 18,
    lineSpacing: 4.5,
    marginSize: 18,
    sectionOrder: ["summary", "custom", "skills", "experience", "education", "languages"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
  },
  {
    id: "ats-consultant",
    name: "Consultant",
    description: "Balanced format with equal weight on specialized skills and varied experience.",
    recommendedFor: "Consultants & Advisors",
    fontFamily: "times",
    fontFamilyCSS: "'Times New Roman', Times, serif",
    baseFontSize: 10,
    headingFontSize: 12,
    nameFontSize: 20,
    lineSpacing: 5,
    marginSize: 18,
    sectionOrder: ["summary", "skills", "experience", "custom", "education", "languages"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
  }
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
  if (/manager|director|vp|head|lead|chief|senior|principal|executive/i.test(title)) return "ats-executive-pro";
  if (/research|academic|professor|teacher|phd/i.test(title)) return "ats-academic";
  if (/nurse|doctor|medical|health|clinical/i.test(title)) return "ats-medical";
  if (/lawyer|attorney|legal|paralegal/i.test(title)) return "ats-legal";
  if (/finance|banker|accountant|analyst/i.test(title)) return "ats-finance";
  if (/sales|account manager|business development/i.test(title)) return "ats-sales";
  if (/marketing|media|content|writer/i.test(title)) return "ats-marketing";
  if (/consultant|advisor/i.test(title)) return "ats-consultant";
  if (/freelance|contractor|self-employed/i.test(title)) return "ats-freelance";
  if (/career change|transition|switching/i.test(title)) return "ats-skills-first";
  return "ats-classic";
}
