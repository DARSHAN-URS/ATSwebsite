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
    id: "ats-pro-classic",
    name: "ATS Pro Classic",
    description: "A clean, highly readable traditional single-column format optimized for enterprise and corporate roles.",
    recommendedFor: "All corporate & traditional roles",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 10.5,
    headingFontSize: 13,
    nameFontSize: 22,
    lineSpacing: 5.2,
    marginSize: 20,
    sectionOrder: ["summary", "experience", "education", "skills", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    isBestForATS: true,
    primaryColor: "#1a365d"
  },
  {
    id: "ats-pro-modern",
    name: "ATS Pro Modern",
    description: "Modern professional look with deep teal headers, tighter spacing, and contemporary layout.",
    recommendedFor: "Technology & Startup roles",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 10,
    headingFontSize: 12,
    nameFontSize: 20,
    lineSpacing: 4.5,
    marginSize: 18,
    sectionOrder: ["summary", "skills", "experience", "education", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#0f766e"
  },
  {
    id: "ats-pro-executive",
    name: "ATS Pro Executive",
    description: "A premium serif layout tailored for senior management and C-suite profiles, using elegant burgundy accents.",
    recommendedFor: "Executives & Directors",
    fontFamily: "times",
    fontFamilyCSS: "'Times New Roman', Times, serif",
    baseFontSize: 11,
    headingFontSize: 14,
    nameFontSize: 24,
    lineSpacing: 5.5,
    marginSize: 22,
    sectionOrder: ["summary", "experience", "education", "languages", "custom", "skills"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#7f1d1d"
  },
  {
    id: "ats-pro-elite",
    name: "ATS Pro Elite",
    description: "Features a distinctive gold accent theme with experience front and center, designed to capture attention.",
    recommendedFor: "Senior Professionals & Specialists",
    fontFamily: "times",
    fontFamilyCSS: "'Times New Roman', Times, serif",
    baseFontSize: 10.5,
    headingFontSize: 13,
    nameFontSize: 22,
    lineSpacing: 5.0,
    marginSize: 20,
    sectionOrder: ["experience", "skills", "education", "languages", "custom", "summary"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#854d0e"
  },
  {
    id: "ats-pro-minimal",
    name: "ATS Pro Minimal",
    description: "A sleek, low-clutter charcoal design with minimal margins to pack deep expertise cleanly onto one page.",
    recommendedFor: "Experienced generalists",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 9.5,
    headingFontSize: 11,
    nameFontSize: 18,
    lineSpacing: 4.2,
    marginSize: 15,
    sectionOrder: ["summary", "skills", "education", "experience", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#1e293b"
  },
  {
    id: "ats-pro-corporate",
    name: "ATS Pro Corporate",
    description: "Structured layout with royal blue divider bars, best suited for banking, consulting, and finance roles.",
    recommendedFor: "Finance, Banking & Consulting",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 10.5,
    headingFontSize: 12.5,
    nameFontSize: 21,
    lineSpacing: 5.0,
    marginSize: 18,
    sectionOrder: ["summary", "experience", "skills", "education", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#1e3a8a"
  },
  {
    id: "ats-pro-recruiter",
    name: "ATS Pro Recruiter",
    description: "Monospace recruiter-friendly template built with clean borders and optimized spacing.",
    recommendedFor: "Recruiters & HR professionals",
    fontFamily: "courier",
    fontFamilyCSS: "'Courier New', Courier, monospace",
    baseFontSize: 9.5,
    headingFontSize: 11.5,
    nameFontSize: 17,
    lineSpacing: 4.8,
    marginSize: 16,
    sectionOrder: ["summary", "skills", "experience", "education", "custom", "languages"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#312e81"
  },
  {
    id: "ats-pro-premium",
    name: "ATS Pro Premium",
    description: "Highly polished template featuring warm bronze dividers, ideal for creative-leaning corporate roles.",
    recommendedFor: "Premium corporate applicants",
    fontFamily: "times",
    fontFamilyCSS: "'Times New Roman', Times, serif",
    baseFontSize: 10.5,
    headingFontSize: 13.5,
    nameFontSize: 23,
    lineSpacing: 5.3,
    marginSize: 21,
    sectionOrder: ["skills", "experience", "education", "languages", "custom", "summary"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#7c2d12"
  },
  {
    id: "ats-modern-edge",
    name: "Modern Edge",
    description: "A sharp and structured layout featuring clear block layouts and sky blue accents.",
    recommendedFor: "Technical specialists & Designers",
    fontFamily: "courier",
    fontFamilyCSS: "'Courier New', Courier, monospace",
    baseFontSize: 10,
    headingFontSize: 12.5,
    nameFontSize: 21,
    lineSpacing: 4.6,
    marginSize: 17,
    sectionOrder: ["experience", "education", "skills", "summary", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#0369a1"
  },
  {
    id: "ats-modern-clean-prof",
    name: "Clean Professional",
    description: "Low-clutter serif template focused on spacing, clean presentation, and white-space accents.",
    recommendedFor: "Consultants, Advisors & Professionals",
    fontFamily: "times",
    fontFamilyCSS: "'Times New Roman', Times, serif",
    baseFontSize: 10.5,
    headingFontSize: 13,
    nameFontSize: 22,
    lineSpacing: 5.1,
    marginSize: 19,
    sectionOrder: ["experience", "education", "skills", "custom", "summary", "languages"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#0d9488"
  },
  {
    id: "ats-modern-urban",
    name: "Urban Modern",
    description: "An elegant monospace structure featuring slate gray formatting and relaxed line spacing.",
    recommendedFor: "Operations & Admin professionals",
    fontFamily: "courier",
    fontFamilyCSS: "'Courier New', Courier, monospace",
    baseFontSize: 10,
    headingFontSize: 13,
    nameFontSize: 21,
    lineSpacing: 4.7,
    marginSize: 18,
    sectionOrder: ["summary", "experience", "skills", "education", "custom", "languages"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#475569"
  },
  {
    id: "ats-modern-nextgen",
    name: "NextGen Resume",
    description: "Clean sans-serif template utilizing distinct borders and deep indigo highlight accents.",
    recommendedFor: "Software Engineers & Tech graduates",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 10,
    headingFontSize: 12.5,
    nameFontSize: 20,
    lineSpacing: 5.0,
    marginSize: 20,
    sectionOrder: ["skills", "education", "experience", "summary", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#4f46e5"
  },
  {
    id: "ats-modern-minimal",
    name: "Minimal Modern",
    description: "A compact serif template utilizing tiny padding to optimize multi-page content cleanly.",
    recommendedFor: "Law, Research & Business Analysts",
    fontFamily: "times",
    fontFamilyCSS: "'Times New Roman', Times, serif",
    baseFontSize: 9.5,
    headingFontSize: 11.5,
    nameFontSize: 18,
    lineSpacing: 4.4,
    marginSize: 15,
    sectionOrder: ["summary", "skills", "education", "experience", "custom", "languages"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#334155"
  },
  {
    id: "ats-modern-contemporary",
    name: "Contemporary Pro",
    description: "Monospace layout emphasizing career achievements with bright emerald highlights.",
    recommendedFor: "Project Managers & Operations",
    fontFamily: "courier",
    fontFamilyCSS: "'Courier New', Courier, monospace",
    baseFontSize: 10.5,
    headingFontSize: 13.5,
    nameFontSize: 23,
    lineSpacing: 5.2,
    marginSize: 21,
    sectionOrder: ["experience", "skills", "education", "languages", "summary", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#059669"
  },
  {
    id: "ats-modern-future-ready",
    name: "Future Ready",
    description: "Clean sans-serif structure highlighting experience front and center with royal blue brand bars.",
    recommendedFor: "Modern Corporate Roles",
    fontFamily: "helvetica",
    fontFamilyCSS: "Arial, Helvetica, sans-serif",
    baseFontSize: 10,
    headingFontSize: 12.5,
    nameFontSize: 20,
    lineSpacing: 4.8,
    marginSize: 16,
    sectionOrder: ["summary", "education", "experience", "skills", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#2563eb"
  },
  {
    id: "ats-modern-smart-profile",
    name: "Smart Profile",
    description: "Elegant serif layout prioritizing skills and certification metrics with warm amber accents.",
    recommendedFor: "Product, Sales & Account Executives",
    fontFamily: "times",
    fontFamilyCSS: "'Times New Roman', Times, serif",
    baseFontSize: 10.5,
    headingFontSize: 13,
    nameFontSize: 22,
    lineSpacing: 5.0,
    marginSize: 20,
    sectionOrder: ["skills", "experience", "education", "summary", "custom", "languages"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#b45309"
  },
  {
    id: "ats-modern-digital-prof",
    name: "Digital Professional",
    description: "A monospace digital-first structure featuring bold divider frames and royal violet styling.",
    recommendedFor: "Digital Marketers & Media specialists",
    fontFamily: "courier",
    fontFamilyCSS: "'Courier New', Courier, monospace",
    baseFontSize: 9.5,
    headingFontSize: 11.5,
    nameFontSize: 18,
    lineSpacing: 4.5,
    marginSize: 17,
    sectionOrder: ["skills", "education", "summary", "experience", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#7c3aed"
  },
  {
    id: "ats-modern-impact",
    name: "Modern Impact",
    description: "Clean monospace layout built for strong readability with crisp crimson divider frames.",
    recommendedFor: "Media, PR & Creative industries",
    fontFamily: "courier",
    fontFamilyCSS: "'Courier New', Courier, monospace",
    baseFontSize: 10.5,
    headingFontSize: 14,
    nameFontSize: 24,
    lineSpacing: 5.4,
    marginSize: 22,
    sectionOrder: ["experience", "summary", "skills", "education", "languages", "custom"],
    sectionVisibility: { summary: true, skills: true, experience: true, education: true, languages: true, custom: true },
    primaryColor: "#dc2626"
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
