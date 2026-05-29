import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.join(__dirname, '..', 'data', 'templates');

const categories = fs.readdirSync(TEMPLATES_DIR).filter(d => fs.statSync(path.join(TEMPLATES_DIR, d)).isDirectory());

let allTemplates = [];

categories.forEach(cat => {
  const catDir = path.join(TEMPLATES_DIR, cat);
  const files = fs.readdirSync(catDir).filter(f => f.endsWith('.json'));
  files.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(catDir, file), 'utf8'));
    allTemplates.push(data);
  });
});

const tsCode = `// AUTO-GENERATED
export const ALL_DYNAMIC_TEMPLATES = ${JSON.stringify(allTemplates, null, 2)};
`;

fs.writeFileSync(path.join(TEMPLATES_DIR, 'index.ts'), tsCode);
console.log('Compiled templates to index.ts');
