// Makes one self-contained file that opens directly in Chrome, without a server.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const directory = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.dirname(directory);
const catalog = JSON.parse(await fs.readFile(path.join(directory, 'catalog.json'), 'utf8'));
for (const product of catalog) {
  const image = await fs.readFile(path.join(directory, 'assets', product.file + '.webp'));
  product.image = `data:image/webp;base64,${image.toString('base64')}`;
}
const css = await fs.readFile(path.join(directory, 'showcase.css'), 'utf8');
const js = await fs.readFile(path.join(directory, 'showcase.js'), 'utf8');
const variants = [['blush', 'Blush Atelier'], ['cherry', 'Cherry Club'], ['blue', 'Blue Hour'], ['editorial', 'The Nail Edit'], ['scrapbook', 'Hailey’s Scrapbook']];
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Nails by Hailey — interactive website designs</title>
<style>
${css}
html,body{margin:0;padding:0;height:auto;min-height:100%;overflow-x:hidden;overflow-y:auto;background:#fcf8f4;scroll-behavior:smooth}
body{font-family:'DM Sans',Arial,sans-serif}
.review-tools{background:#f0eee9;color:#3f443f;border-bottom:1px solid #d8d9d3;padding:14px 26px;display:flex;align-items:center;justify-content:space-between;gap:20px;font:400 12px/1.5 'DM Sans',Arial,sans-serif}
.review-tools-brand{font-size:11px;letter-spacing:.07em;white-space:nowrap}
.review-tools-controls{display:flex;gap:17px;align-items:center;flex-wrap:wrap}
.review-tools label{display:flex;align-items:center;gap:9px;font-size:11px}
.review-tools select{background:#fffdf8;color:#41463e;border:1px solid #cfcec5;border-radius:5px;padding:9px 11px;font:400 12px/1.4 'DM Sans',Arial,sans-serif;min-height:37px;max-width:210px}
#nbh-designs{max-width:1440px;margin:auto}
#nbh-designs .n-stage,#nbh-designs .n-site,#nbh-designs .n-main{min-height:0!important;height:auto!important}
#nbh-designs .n-site{overflow:visible}
#nbh-designs .n-review{display:none}
#nbh-designs .n-blush .n-hero-photo{border-radius:12px;box-shadow:10px 12px 0 #eee3dd;aspect-ratio:1.12}
#nbh-designs .n-blush .n-hero-photo>img{border-radius:12px;object-fit:contain;background:#dfb4bf}
#nbh-designs .n-photo-note{font-size:21px}
#nbh-designs .n-product-image img{object-fit:contain;background:#e9c3ce}
#nbh-designs .n-footer{margin-top:15px}
@media(max-width:700px){.review-tools{padding:13px 18px;align-items:flex-start;flex-direction:column;gap:11px}.review-tools-controls{width:100%;gap:10px}.review-tools label{flex:1;flex-direction:column;align-items:flex-start;gap:4px;min-width:0}.review-tools select{width:100%;max-width:100%;font-size:12px}.review-tools-brand{font-size:10px}#nbh-designs .n-blush .n-hero-photo{aspect-ratio:1.35;margin-bottom:5px}}
@media(prefers-reduced-motion:reduce){html,body{scroll-behavior:auto}}
</style>
</head>
<body>
<div class="review-tools">
  <span class="review-tools-brand">NAILS BY HAILEY · WEBSITE DESIGNS</span>
  <div class="review-tools-controls">
    <label>Design<select id="standalone-design" aria-label="Choose website design">${variants.map(([key, name]) => `<option value="${key}">${name}</option>`).join('')}</select></label>
    <label>Opening photo<select id="standalone-photo" aria-label="Choose opening photo">${catalog.map(product => `<option value="${product.id}"${product.id === 'barely-blush' ? ' selected' : ''}>${escape(product.name)}</option>`).join('')}</select></label>
  </div>
</div>
<div id="nbh-designs" data-standalone="true" data-hero="barely-blush">
  <div class="n-gallery">${variants.map(([key, name], index) => `<section class="n-stage" data-variant="${name}" data-key="${key}" aria-label="${name} website design"${index ? ' hidden' : ''}></section>`).join('')}</div>
</div>
<script type="application/json" id="nbh-catalog">${JSON.stringify(catalog).replace(/</g, '\\u003c')}</script>
<script>
${js}
</script>
<script>
(() => {
  const root = document.getElementById('nbh-designs');
  document.getElementById('standalone-design').addEventListener('change', event => {
    root.querySelectorAll('[data-variant]').forEach(section => { section.hidden = section.dataset.key !== event.target.value; });
    window.scrollTo({top:0,behavior:'auto'});
  });
  document.getElementById('standalone-photo').addEventListener('change', event => {
    root.dispatchEvent(new CustomEvent('hailey:hero-photo', {detail:{id:event.target.value}}));
  });
})();
</script>
</body>
</html>`;
await fs.writeFile(path.join(workspace, 'nails-by-hailey.html'), html);
await fs.writeFile(path.join(workspace, 'index.html'), html);
console.log(`Created nails-by-hailey.html and index.html (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MB each). All photos, styles, and interactions are embedded. No iframe or local server.`);
