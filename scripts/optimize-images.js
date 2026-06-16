import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const imagesDir = path.join(process.cwd(), 'public', 'images');

const filesToUpdate = [
  path.join(process.cwd(), 'src', 'constants', 'index.js'),
  path.join(process.cwd(), 'src', 'sections', 'ShowcaseSection.jsx'),
];

async function optimizeImages() {
  const files = fs.readdirSync(imagesDir);
  const imageFiles = files.filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'));

  console.log(`Found ${imageFiles.length} images to optimize...`);

  for (const file of imageFiles) {
    const filePath = path.join(imagesDir, file);
    const parsedPath = path.parse(filePath);
    
    // Ignore small files (e.g. less than 100kb maybe, but let's convert all big ones)
    const stats = fs.statSync(filePath);
    if (stats.size < 50000) {
      console.log(`Skipping ${file} (already small enough)`);
      continue;
    }

    const webpPath = path.join(imagesDir, `${parsedPath.name}.webp`);
    
    console.log(`Converting ${file} -> ${parsedPath.name}.webp`);
    try {
      await sharp(filePath)
        .webp({ quality: 80 })
        .toFile(webpPath);
      console.log(`✅ Success: ${webpPath}`);

      // Replace in source code
      for (const sourceFile of filesToUpdate) {
        if (fs.existsSync(sourceFile)) {
          let content = fs.readFileSync(sourceFile, 'utf-8');
          if (content.includes(file)) {
            content = content.replaceAll(file, `${parsedPath.name}.webp`);
            fs.writeFileSync(sourceFile, content);
            console.log(`Updated reference in ${path.basename(sourceFile)}`);
          }
        }
      }
    } catch (err) {
      console.error(`❌ Error converting ${file}:`, err);
    }
  }
}

optimizeImages();
