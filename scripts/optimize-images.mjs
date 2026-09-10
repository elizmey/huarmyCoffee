import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const walk = (dir) => {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(jpe?g|png)$/i.test(entry.name) && !entry.name.startsWith('favicon')) out.push(full);
  }
  return out;
};

const maxWidthFor = (file) => {
  const rel = file.replace(root, '').replace(/\\/g, '/').toLowerCase();
  if (rel.includes('logo-lugar')) return 256;
  if (rel.endsWith('/logo.jpg')) return 256;
  if (rel.includes('/local/lugar1.jpg')) return 1400;
  if (rel.includes('/clientes/')) return 1000;
  if (rel.includes('/nosotros/')) return 1200;
  if (rel.includes('/servicios/')) return 1100;
  return 1400;
};

const files = walk(root);
let saved = 0;

for (const file of files) {
  const dest = file.replace(/\.(jpe?g|png)$/i, '.webp');
  const maxWidth = maxWidthFor(file);
  const quality = file.toLowerCase().includes('lugar1') ? 74 : 70;
  try {
    const img = sharp(file).rotate().resize({ width: maxWidth, withoutEnlargement: true });
    await img.webp({ quality, effort: 4 }).toFile(dest);
    const before = fs.statSync(file).size;
    const after = fs.statSync(dest).size;
    saved += Math.max(0, before - after);
    console.log(`${path.relative(root, dest)}  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`);
  } catch (err) {
    console.warn('skip', file, err.message);
  }
}

await sharp(path.join(root, 'imagenes/local/logo-lugar.jpg'))
  .rotate()
  .resize(96, 96, { fit: 'cover' })
  .webp({ quality: 78 })
  .toFile(path.join(root, 'imagenes/local/logo-lugar-sm.webp'));

await sharp(path.join(root, 'imagenes/local/logo-lugar.jpg'))
  .rotate()
  .resize(32, 32, { fit: 'cover' })
  .png({ compressionLevel: 9 })
  .toFile(path.join(root, 'favicon-32.png'));

console.log(`saved ~${(saved / 1024).toFixed(0)}KB plus logo variants`);
