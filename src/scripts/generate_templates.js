import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'templates');

const categories = [
  "Modern", "Professional", "Creative", "Minimalist", "ATS Optimized", "Executive", "Technical", "Photo Profiles"
];

// Helper to generate a unique structural template
function generateTemplate(category, index, globalIndex) {
  const catPrefix = category.toLowerCase().replace(/ /g, '_').substring(0, 3);
  const id = `tpl_${catPrefix}_${(index + 1).toString().padStart(3, '0')}`;
  
  // Base properties to ensure maximum structural variety (no minor color/font tweaks)
  // Base properties to ensure maximum structural variety
  const columns = [1, 2, 2, 3, 1, 2, 1, 2][globalIndex % 8];
  const sidebars = ['none', 'left', 'right', 'top-nav', 'split-even', 'asymmetrical-left', 'asymmetrical-right', 'left'][globalIndex % 8];
  const densities = ['ultra-compact', 'standard', 'airy', 'variable', 'dense', 'spacious', 'hyper-dense', 'standard'][globalIndex % 8];
  const emphasis = ['typography', 'borders', 'background-blocks', 'timeline', 'white-space', 'icons', 'color-blocks', 'photo-led'][globalIndex % 8];
  const alignments = ['left-aligned', 'center-aligned', 'right-aligned', 'staggered', 'justified', 'mixed-alignment', 'alternating', 'left-aligned'][globalIndex % 8];
  
  // Sections tailored to category and index
  const sectionVariations = [
    ["summary", "experience", "education", "skills"],
    ["summary", "skills", "experience", "education"],
    ["experience", "education", "skills", "summary"],
    ["education", "experience", "projects", "skills"],
    ["summary", "projects", "experience", "education", "skills"],
    ["skills", "projects", "experience", "education", "summary"],
    ["experience", "projects", "skills", "education"]
  ];

  return {
    template_id: id,
    template_name: `${category} Structural Form ${index + 1}`,
    category: category,
    description: `A distinct ${category} layout featuring ${columns}-column structure, ${sidebars} sidebar, and ${emphasis}-led visual emphasis. Designed with ${densities} information density and ${alignments} text.`,
    layout_metadata: {
      column_count: columns,
      sidebar_position: sidebars,
      structural_alignment: alignments,
      information_density: densities,
      visual_emphasis: emphasis,
      typography: {
        heading: `FontStack-${index}A`,
        body: `FontStack-${index}B`,
        accent: `FontStack-${index}C`
      },
      spacing: {
        margin: `${10 + (index * 2)}px`,
        line_height: 1.2 + (index * 0.1),
        section_gap: `${16 + (index * 4)}px`
      },
      color_palette: {
        primary: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
        secondary: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
        text: '#111',
        background: '#fff'
      },
      has_photo: category === "Photo Profiles",
      responsive_behavior: index % 2 === 0 ? 'stack-on-mobile' : 'hide-sidebar-on-mobile'
    },
    sections: {
      order: sectionVariations[index % 5],
      visibility: { summary: true, skills: true, experience: true, education: true, projects: true }
    },
    ats_score: category === "ATS Optimized" ? 100 : (90 - index * 5),
    suitable_professions: [`${category} Roles`, "General Use"]
  };
}

const templates = [];

categories.forEach((category, catIdx) => {
  const catDirName = category.toLowerCase().replace(/ /g, '_');
  const catDir = path.join(OUTPUT_DIR, catDirName);
  
  if (!fs.existsSync(catDir)) {
    fs.mkdirSync(catDir, { recursive: true });
  }

  for (let i = 0; i < 5; i++) {
    const globalIndex = catIdx * 5 + i;
    const tpl = generateTemplate(category, i, globalIndex);
    templates.push(tpl);
    
    fs.writeFileSync(
      path.join(catDir, `${tpl.template_id}.json`), 
      JSON.stringify(tpl, null, 2)
    );
  }
});

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'manifest.json'),
  JSON.stringify({ 
    generated_at: new Date().toISOString(),
    total_templates: templates.length,
    templates: templates.map(t => ({ 
      id: t.template_id, 
      name: t.template_name, 
      category: t.category,
      structure: t.layout_metadata.sidebar_position
    })) 
  }, null, 2)
);

console.log(`Successfully generated ${templates.length} templates across ${categories.length} categories.`);
