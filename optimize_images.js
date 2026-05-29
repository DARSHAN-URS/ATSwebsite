import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, 'public', 'images');

async function processImages() {
  const files = fs.readdirSync(dir);
  let converted = 0;
  for (const file of files) {
    if (file.match(/\.(png|jpg|jpeg)$/i) && !file.includes('favicon.png')) {
      const ext = path.extname(file);
      const name = path.basename(file, ext);
      const inputPath = path.join(dir, file);
      const outputPath = path.join(dir, `${name}.webp`);

      try {
        console.log(`Converting ${file} to webp...`);
        await sharp(inputPath)
          .webp({ quality: 80 })
          .toFile(outputPath);
        
        fs.unlinkSync(inputPath);
        converted++;
      } catch (err) {
        console.error(`Error converting ${file}:`, err);
      }
    }
  }
  console.log(`Converted ${converted} images.`);
}

processImages().catch(console.error);
