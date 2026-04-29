import type { ResumeColors } from "@/hooks/useResumeColors";
import type { TemplateId } from "@/components/resume/pdfTemplates";

/**
 * Each template's hardcoded brand hexes mapped to a slot
 * (primary / accent / heading). Used to recolor preview HTML
 * and PDF render output when the user picks custom colors.
 *
 * Hexes are matched case-insensitively. Only the slots present
 * in a template need entries — extra entries are ignored safely.
 */
type Slot = keyof ResumeColors;

interface TemplatePalette {
  primary: string[];
  accent: string[];
  heading: string[];
}

const EMPTY: TemplatePalette = { primary: [], accent: [], heading: [] };

const PALETTES: Partial<Record<TemplateId, TemplatePalette>> = {
  classic:      { primary: [], accent: ["#0066cc"], heading: [] },
  modern:       { primary: ["#2563eb"], accent: ["#2563eb"], heading: ["#2563eb"] },
  minimal:      { primary: [], accent: ["#0066cc"], heading: [] },
  executive:    { primary: ["#1e1e1e"], accent: ["#c8c8c8"], heading: ["#1e1e1e"] },
  creative:     { primary: ["#dc3545"], accent: ["#dc3545"], heading: ["#dc3545"] },
  professional: { primary: ["#192a56"], accent: ["#192a56"], heading: ["#192a56"] },
  ats:          { primary: [], accent: [], heading: [] },
  simple:       { primary: [], accent: ["#0066cc"], heading: [] },
  elegant:      { primary: ["#b49146"], accent: ["#b49146"], heading: ["#3c3c3c"] },
  ivyleague:    { primary: ["#555"], accent: [], heading: [] },
  contemporary: { primary: ["#10a37f"], accent: ["#dcfff0"], heading: [] },
  timeline:     { primary: ["#2962ff"], accent: ["#2962ff"], heading: ["#2962ff"] },
  sidebar:      { primary: ["#1e3a5f"], accent: ["#b4d2ff"], heading: [] },
  twocolumn:    { primary: ["#2d3748"], accent: ["#2d3748"], heading: [] },
  polished:     { primary: ["#a64834"], accent: ["#ffd2be", "#f0d0c0"], heading: [] },
};

function getPalette(templateId: TemplateId): TemplatePalette {
  return PALETTES[templateId] ?? EMPTY;
}

/**
 * Replace each brand hex in the HTML string with the user's chosen color.
 * Case-insensitive whole-token match (avoids partial-hex matches).
 */
export function applyColorsToHTML(html: string, templateId: TemplateId, colors: ResumeColors): string {
  const palette = getPalette(templateId);
  let out = html;
  (Object.keys(palette) as Slot[]).forEach((slot) => {
    const replacement = colors[slot];
    palette[slot].forEach((hex) => {
      // Match the literal hex preceded by ":" or "#" boundary, not as part of a longer token
      const escaped = hex.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(escaped, "gi");
      out = out.replace(re, replacement);
    });
  });
  return out;
}

/**
 * Hex (#RRGGBB or #RGB) -> [r,g,b]
 */
export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const num = parseInt(h, 16);
  if (Number.isNaN(num)) return [0, 0, 0];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Build an RGB-tuple map (key "r,g,b") for use by the PDF renderer
 * to remap brand RGB calls to the user-chosen colors.
 */
export function buildPdfRgbMap(templateId: TemplateId, colors: ResumeColors): Record<string, [number, number, number]> {
  const palette = getPalette(templateId);
  const map: Record<string, [number, number, number]> = {};
  (Object.keys(palette) as Slot[]).forEach((slot) => {
    const [nr, ng, nb] = hexToRgb(colors[slot]);
    palette[slot].forEach((hex) => {
      const [r, g, b] = hexToRgb(hex);
      map[`${r},${g},${b}`] = [nr, ng, nb];
    });
  });
  return map;
}

