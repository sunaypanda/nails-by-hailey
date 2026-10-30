// Authoring utility. Generates only local design files; no deployment or network writes.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.dirname(here);
const visualDirectory = '/Users/sunaypanda/.codex/visualizations/2026/10/29/01a188ae-47b8-7641-9c9b-0d88466c4c2a';
const catalog = JSON.parse(await fs.readFile(path.join(here, 'catalog.json'), 'utf8'));
const inlineCatalog = [], localCatalog = [];
await fs.mkdir(path.join(here, 'assets'), { recursive: true });
for (const product of catalog) {
  const original = path.join(workspace, 'pics', product.file + '.jpeg');
  const metadata = await sharp(original).metadata();
  let pipeline = sharp(original).rotate();
  // Keep every nail in frame while trimming a little unused cloth backdrop.
  if (metadata.width > metadata.height) {
    const cropHeight = Math.round(metadata.height * .83);
    pipeline = pipeline.extract({ left: 0, top: Math.round((metadata.height - cropHeight) / 2), width: metadata.width, height: cropHeight });
  }
  const thumbnail = await pipeline.resize({ width: 480, height: 410, fit: 'inside', withoutEnlargement: true }).webp({ quality: 48, effort: 5 }).toBuffer();
  const imagePath = `assets/${product.file}.webp`;
  await sharp(original).rotate().resize({ width: 1200, height: 1100, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toFile(path.join(here, imagePath));
  inlineCatalog.push({ ...product, image: `data:image/webp;base64,${thumbnail.toString('base64')}` });
  localCatalog.push({ ...product, image: imagePath });
}
const css = await fs.readFile(path.join(here, 'showcase.css'), 'utf8');
const js = await fs.readFile(path.join(here, 'showcase.js'), 'utf8');
const template = await fs.readFile(path.join(here, 'preview.template.html'), 'utf8');
const fragment = template.replace('__NBH_STYLES__', () => css).replace('__NBH_CATALOG__', () => JSON.stringify(inlineCatalog).replace(/</g, '\\u003c')).replace('__NBH_SCRIPT__', () => js);
if (Buffer.byteLength(fragment) >= 1000000) throw new Error('Inline preview must stay under 1 MB. Reduce thumbnail dimensions or quality.');
await fs.mkdir(visualDirectory, { recursive: true });
const fragmentPath = path.join(visualDirectory, 'hailey-design-directions.html');
await fs.writeFile(fragmentPath, fragment);
const variants = [
  { key: 'blush', name: 'Blush Atelier', filename: 'blush-atelier', detail: 'Romantic blush, an arched photo, and a refined boutique layout.' },
  { key: 'cherry', name: 'Cherry Club', filename: 'cherry-club', detail: 'Bold cherry red, playful poster type, and statement photography.' },
  { key: 'blue', name: 'Blue Hour', filename: 'blue-hour', detail: 'Powder blue, a calm studio layout, and a sidebar catalog.' },
  { key: 'editorial', name: 'The Nail Edit', filename: 'the-nail-edit', detail: 'Cream and charcoal, fashion-editorial type, and a photo-led layout.' },
  { key: 'scrapbook', name: 'Hailey’s Scrapbook', filename: 'haileys-scrapbook', detail: 'Lilac and sage, handwritten notes, and little photo collages.' }
];
const section = (v, hidden = false) => `<section class="n-stage" data-variant="${v.name}" data-key="${v.key}" data-filename="${v.filename}" aria-label="${v.name} design"${hidden ? ' hidden' : ''}></section>`;
const document = (title, body, controller = false) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="strict-origin-when-cross-origin"><title>${title} · Nails by Hailey</title><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='10' fill='%23efd8d6'/%3E%3Ctext x='10' y='30' font-family='Georgia' font-style='italic' font-size='32' fill='%23725053'%3Eh%3C/text%3E%3C/svg%3E"><link rel="stylesheet" href="showcase.css"><style>html{scroll-behavior:smooth}body{margin:0;background:#e9e8e3}.design-toolbar{box-sizing:border-box;display:flex;justify-content:space-between;align-items:center;gap:25px;padding:19px 30px;background:#262c2a;color:#f4f3ea;font:400 12px/1.5 Arial,sans-serif}.design-toolbar .design-label{display:flex;flex-direction:column;gap:3px}.design-toolbar strong{font-weight:500;letter-spacing:.04em}.design-toolbar small{font-size:11px;color:#b5bcb6}.design-toolbar-controls{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.design-toolbar button,.design-toolbar select{font:inherit;background:#343b37;border:1px solid #5b645c;color:#f4f3ea;min-height:38px;border-radius:5px;padding:8px 12px;cursor:pointer}.design-toolbar select{min-width:185px}.design-toolbar a{color:#d4ddd2;font-size:11px;text-underline-offset:4px}.design-toolbar span{font-size:11px;white-space:nowrap}#nbh-designs{max-width:1400px;margin:auto}.design-toolbar-wrap{max-width:1400px;margin:auto}@media(max-width:700px){.design-toolbar{padding:17px 20px;align-items:flex-start;gap:16px;flex-direction:column}.design-toolbar-controls{gap:9px;width:100%}.design-toolbar select{min-width:0;max-width:calc(100vw - 167px);flex:1}.design-toolbar a{margin-left:auto}.design-toolbar small{font-size:10px}}</style></head><body>${body}<script type="application/json" id="nbh-catalog">${JSON.stringify(localCatalog).replace(/</g, '\\u003c')}</script><script src="showcase.js"></script>${controller ? '<script src="design-controller.js"></script>' : ''}</body></html>`;
const toolbar = `<div class="design-toolbar-wrap"><header class="design-toolbar"><div class="design-label"><strong>NAILS BY HAILEY / DESIGN STUDIO</strong><small>Five interactive directions. Your real photos. Inquiries, without checkout.</small></div><div class="design-toolbar-controls"><button id="previous-design" type="button" aria-label="Previous design">←</button><select id="design-picker" aria-label="Choose a design">${variants.map(v => `<option value="${v.key}">${v.name}</option>`).join('')}</select><button id="next-design" type="button" aria-label="Next design">→</button><span id="design-count">1 / 5</span><a id="open-design" href="blush-atelier.html" target="_blank" rel="noopener">Open separately ↗</a></div></header></div>`;
await fs.writeFile(path.join(here, 'index.html'), document('Five design directions', `${toolbar}<div id="nbh-designs" data-standalone="true"><div class="n-gallery">${variants.map((v, i) => section(v, i > 0)).join('')}</div></div>`, true));
for (const variant of variants) {
  await fs.writeFile(path.join(here, variant.filename + '.html'), document(variant.name, `<div class="design-toolbar-wrap"><header class="design-toolbar"><div class="design-label"><strong>${variant.name.toUpperCase()}</strong><small>${variant.detail}</small></div><a href="index.html?design=${variant.key}">← Compare all five designs</a></header></div><div id="nbh-designs" data-standalone="true"><div class="n-gallery">${section(variant)}</div></div>`));
}
console.log(`Prepared 5 standalone designs and the gallery. Inline preview: ${Math.round(Buffer.byteLength(fragment) / 1024)} KB.\n${fragmentPath}`);
