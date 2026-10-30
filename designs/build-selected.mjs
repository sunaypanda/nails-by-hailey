// Generates the static website and a portable, self-contained HTML copy.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
const directory = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.dirname(directory);
const outputDirectory = path.join(workspace,'dist');
const assetDirectory = path.join(outputDirectory,'assets');
await fs.mkdir(assetDirectory,{recursive:true});
const catalog = JSON.parse(await fs.readFile(path.join(directory,'catalog.json'),'utf8'));
for (const product of catalog) {
  const original = await fs.readFile(path.join(directory,'assets',product.file+'.webp'));
  const image = product.rotation ? await sharp(original).rotate(product.rotation).webp({quality:92}).toBuffer() : original;
  await fs.writeFile(path.join(assetDirectory,product.file+'.webp'),image);
  product.image = `data:image/webp;base64,${image.toString('base64')}`;
}
const sourceDirectory = path.join(workspace,'pics','branding');
const sources = {logo:'07A7DCB0-29BA-44B2-96D9-3D9AADAEFF14.png',menu:'A4375829-92E3-46D6-9FE6-C518EFA4F2EB.png',care:'AE452B1C-8B61-4370-A70F-0D0259F5C40B.png',portrait:'IMG_0216.jpeg'};
const branding = {};
for (const [key,file] of Object.entries(sources)) {
  let image = sharp(path.join(sourceDirectory,file)).rotate();
  if (key === 'logo') image = image.trim({threshold:12}).resize({width:360,height:360,fit:'inside'});
  else image = image.resize({width:1000,height:1500,fit:'inside',withoutEnlargement:true});
  const output = await image.webp({quality:key === 'portrait' ? 84 : 92}).toBuffer();
  await fs.writeFile(path.join(directory,'assets',`brand-${key}.webp`),output);
  await fs.writeFile(path.join(assetDirectory,`brand-${key}.webp`),output);
  branding[key] = `data:image/webp;base64,${output.toString('base64')}`;
}
const css = await fs.readFile(path.join(directory,'showcase.css'),'utf8');
const selectedCss = await fs.readFile(path.join(directory,'site.css'),'utf8');
const js = await fs.readFile(path.join(directory,'site.js'),'utf8');
const json = data => JSON.stringify(data).replace(/</g,'\\u003c');
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="description" content="Handmade, reusable press-on nails by Hailey Lovelady in Houston. Explore the collection or create a custom set.">
<title>Nails by Hailey · Handmade press-ons</title>
<link rel="icon" type="image/webp" href="${branding.logo}">
<style>
${css}
${selectedCss}
</style>
</head>
<body>
<div id="nbh-designs" data-standalone="true"></div>
<noscript><p>Please enable JavaScript to browse the nail catalog and inquiry forms.</p></noscript>
<script type="application/json" id="nbh-catalog">${json(catalog)}</script>
<script type="application/json" id="nbh-branding">${json(branding)}</script>
<script>
${js}
</script>
</body>
</html>`;
await fs.writeFile(path.join(workspace,'nails-by-hailey.html'),html);
await fs.writeFile(path.join(workspace,'index.html'),html);
const websiteCatalog = catalog.map(product => ({...product,image:`/assets/${product.file}.webp`}));
const websiteBrand = Object.fromEntries(Object.keys(branding).map(key => [key,`/assets/brand-${key}.webp`]));
const websiteHtml = html
  .replace(`<style>\n${css}\n${selectedCss}\n</style>`,'<link rel="stylesheet" href="/assets/site.css">')
  .replace(`<script>\n${js}\n</script>`,'<script src="/assets/site.js" defer></script>')
  .replace(json(catalog),json(websiteCatalog))
  .replace(json(branding),json(websiteBrand))
  .replace(`href="${branding.logo}"`,'href="/assets/brand-logo.webp"');
await fs.writeFile(path.join(outputDirectory,'index.html'),websiteHtml);
await fs.writeFile(path.join(assetDirectory,'site.css'),css+'\n'+selectedCss);
await fs.writeFile(path.join(assetDirectory,'site.js'),js);
console.log(`Website ready in dist/: ${catalog.length} designs with separate image, CSS, and JavaScript assets. Portable HTML copies updated.`);
