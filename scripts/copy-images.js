const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const sourceDir = path.join(projectRoot, 'images');
const targetDir = path.join(projectRoot, 'public', 'images');
const manifestPath = path.join(projectRoot, 'public', 'images-manifest.json');

if (!fs.existsSync(sourceDir)) {
  console.warn('[copy-images] images directory not found, skipping.');
  process.exit(0);
}

fs.mkdirSync(targetDir, { recursive: true });

const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
const imageFiles = entries
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name));

// Keep public/images in sync with images/ by removing stale files.
const existingTargetEntries = fs.readdirSync(targetDir, { withFileTypes: true });
for (const entry of existingTargetEntries) {
  if (!entry.isFile()) {
    continue;
  }
  if (!imageFiles.includes(entry.name)) {
    fs.unlinkSync(path.join(targetDir, entry.name));
  }
}

for (const fileName of imageFiles) {
  fs.copyFileSync(path.join(sourceDir, fileName), path.join(targetDir, fileName));
}

const manifest = {
  generatedAt: new Date().toISOString(),
  images: imageFiles,
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`[copy-images] copied ${imageFiles.length} image(s) and updated manifest.`);
