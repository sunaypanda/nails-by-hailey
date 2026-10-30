(() => {
  'use strict';
  const root = document.getElementById('nbh-designs');
  if (!root) return;
  const products = JSON.parse(document.getElementById('nbh-catalog').textContent);
  const brand = JSON.parse(document.getElementById('nbh-branding').textContent);
  const instagram = 'https://www.instagram.com/pressonnailsbyhailey/';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
  const byId = id => products.find(product => product.id === id);
  const button = (action, text, classes = 'n-btn', extra = '') => `<button type="button" class="${classes}" data-action="${action}" ${extra}>${text}</button>`;
  const field = (text, control, classes = '') => `<label class="n-field ${classes}">${text}${control}</label>`;
  const options = (values, current) => values.map(value => `<option${value === current ? ' selected' : ''}>${escape(value)}</option>`).join('');
  const select = (name, values, current = values[0]) => `<select name="${name}">${options(values, current)}</select>`;
  const sizeHelp = 'Help Me / Custom';
  const shapes = ['Help me choose','Almond','Square','Coffin','Custom shape'];
  const lengths = ['Help me choose','Short','Medium','Long','Extra long'];
  const charmChoices = ['None','1–2 charms','3 or more charms','Help me decide'];
  const freshSelection = () => ({size:sizeHelp,shape:'Help me choose',length:'Help me choose',style:'Help me decide',charms:'None'});
  const state = {view:'home',product:'',filter:'All designs',favorites:new Set(),selection:freshSelection(),photoUrls:[],lastRow:null,lastSubmissionLive:false};
  const rows = [];
  try { state.favorites = new Set(JSON.parse(localStorage.getItem('hailey-saved-designs') || '[]').filter(id => byId(id))); } catch {}
  const wordmark = `<img class="n-brand-logo" src="${brand.logo}" alt=""><span>Nails <i>by Hailey</i><small class="n-brand-heart" aria-hidden="true">♡</small></span>`;
  root.innerHTML = `<div class="n-site n-blush"><div class="n-announcement"><span>HANDMADE IN HOUSTON</span><span>With lots of love ♡</span></div><header class="n-nav n-wrap"><button type="button" class="n-brand" data-action="home" aria-label="Nails by Hailey home">${wordmark}</button><nav class="n-navlinks" aria-label="Main navigation">${[['catalog','Shop designs'],['custom','Custom nails'],['about','About Hailey']].map(([action,text]) => button(action,text,'')).join('')}</nav><div class="n-nav-end">${button('contact','Contact','n-nav-contact')}${button('saved','♡ <small class="n-saved-count">0</small>','n-nav-heart','aria-label="Saved designs"')}${button('menu','☰','n-mobile-menu','aria-label="Open navigation" aria-expanded="false"')}</div></header><nav class="n-mobile-panel" hidden aria-label="Mobile navigation">${[['catalog','Shop designs'],['custom','Custom nails'],['about','About Hailey'],['contact','Contact'],['faq','Pricing & care']].map(([action,text]) => button(action,`${text}`,'')).join('')}</nav><main class="n-main"></main><footer class="n-footer"><div class="n-wrap"><div class="n-footer-top"><button type="button" class="n-brand" data-action="home" aria-label="Nails by Hailey home">${wordmark}</button><div class="n-footer-links"><a href="${instagram}" target="_blank" rel="noopener noreferrer">Instagram</a>${button('faq','Pricing & care','')}${button('contact','Contact','')}</div></div><div class="n-footer-bottom"><span>© ${new Date().getFullYear()} Nails by Hailey · Houston, Texas</span><button type="button" class="n-preview-link" data-action="sheet">Inquiry preview</button><span>With lots of love.</span></div></div></footer></div>`;
  const main = root.querySelector('.n-main');
  const accordion = (title, content) => `<details><summary>${title}</summary><div class="n-disclosure-content">${content}</div></details>`;
  // Transcribed from Hailey’s supplied price flyer in pics/branding.
  const priceTiers = [
    {style:'Solid color',label:'Solid color set',amount:10},
    {style:'French tips',label:'French tip set',amount:13},
    {style:'Simple nail art',label:'Simple nail art',amount:15},
    {style:'Detailed designs',label:'Detailed designs',amount:20},
    {style:'Luxury / 3D',label:'Luxury sets',amount:28,starting:true}
  ];
  const extras = {extraLong:2,customShape:2,charms:2,replacement:1};
  const money = value => '$' + value;
  const prices = priceTiers.map(tier => [tier.label,money(tier.amount)+(tier.starting ? '+' : '')]);
  const addOns = [['Extra long length','+ '+money(extras.extraLong)],['Custom shape','+ '+money(extras.customShape)],['Charms (1–2)','Free'],['Charms (3+)','+ '+money(extras.charms)],['Replacement nail (each)','+ '+money(extras.replacement)]];
  const designTypeSelect = (name,current = 'Help me decide') => `<select name="${name}"><option value="Help me decide"${current === 'Help me decide' ? ' selected' : ''}>Help me decide</option>${priceTiers.map(tier => `<option value="${escape(tier.style)}"${current === tier.style ? ' selected' : ''}>${escape(tier.style)} · ${money(tier.amount)}${tier.starting ? '+' : ''}</option>`).join('')}</select>`;
  function estimateSelection(selection) {
    const tier = priceTiers.find(item => item.style === selection.style);
    const quantity = Math.min(20,Math.max(1,Math.trunc(Number(selection.quantity) || 1)));
    const items = [];
    if (selection.shape === 'Custom shape') items.push(['Custom shape',extras.customShape]);
    if (selection.length === 'Extra long') items.push(['Extra long length',extras.extraLong]);
    if (selection.charms === '1–2 charms') items.push(['Charms (1–2)',0]);
    if (selection.charms === '3 or more charms') items.push(['Charms (3+)',extras.charms]);
    const total = tier ? (tier.amount + items.reduce((sum,item) => sum + item[1],0))*quantity : null;
    return {tier,quantity,items,total,starting:!!tier?.starting};
  }
  const estimatePanel = () => '<section class="n-estimate" aria-label="Price estimate" aria-live="polite" aria-atomic="true"></section>';
  function currentEstimate() {
    const form = main.querySelector('.n-inquiry-form');
    if (!form) return estimateSelection(state.selection);
    const value = name => form.elements.namedItem(name)?.value || '';
    return estimateSelection({style:value('style'),shape:value('shape'),length:value('length'),charms:value('charms'),quantity:value('quantity')});
  }
  function updateEstimate() {
    const panel = main.querySelector('.n-estimate'); if (!panel) return;
    const estimate = currentEstimate(), {tier,items,quantity,total,starting} = estimate;
    const itemRows = items.map(([label,amount]) => `<div><dt>${escape(label)}</dt><dd>${amount ? '+ '+money(amount) : 'Free'}</dd></div>`).join('');
    panel.innerHTML = `<div class="n-estimate-heading"><span>Estimated ${quantity > 1 ? 'total' : 'price'}</span><strong>${total === null ? '—' : (starting ? 'From ' : '')+money(total)}</strong></div>${tier || items.length ? `<dl>${tier ? `<div><dt>${escape(tier.label)}</dt><dd>${money(tier.amount)}${tier.starting ? '+' : ''}</dd></div>` : ''}${itemRows}</dl>` : ''}${quantity > 1 ? `<p class="n-estimate-quantity">${quantity} sets · prices above are per set</p>` : ''}<p>${tier ? 'Size has no menu surcharge. Hailey confirms your final quote.' : 'Choose a design type for your estimate. Hailey can help if you’re unsure.'}</p>`;
  }
  const priceRows = items => `<dl>${items.map(([name,price]) => `<div class="n-price-row"><dt>${name}</dt><dd>${price}</dd></div>`).join('')}</dl>`;
  function priceMenu(compact = false) {
    return `<section class="n-price-menu${compact ? ' n-price-menu-compact' : ''}" aria-label="Press-on nail prices"><div class="n-price-menu-heading"><span class="n-price-heart" aria-hidden="true">♡</span><h2>Press-on nail menu</h2><span class="n-price-heart" aria-hidden="true">♡</span></div>${priceRows(prices)}<div class="n-price-extras"><section><h3>Add-ons <span aria-hidden="true">♡</span></h3>${priceRows(addOns)}</section><section><h3>Includes <span aria-hidden="true">♡</span></h3><ul><li>Handmade Gel-X press-on nails</li><li>Application kit<small>Adhesive tabs, nail glue, prep tools, file, and alcohol pad</small></li><li>Care instructions</li></ul></section></div><p class="n-price-signature">With lots of love, Hailey</p></section>`;
  }
  const menuImage = () => priceMenu(true);
  const careImage = () => `<img class="n-brand-card" src="${brand.care}" alt="Hailey’s application guide: prep nails, clean with an alcohol pad, apply adhesive, press and hold for 10–15 seconds, then repeat on the remaining nails." loading="lazy">`;
  const pageTitle = (title, text = '') => `<div class="n-page-title n-wrap"><h1>${title}</h1>${text ? `<p>${text}</p>` : ''}</div>`;
  function customBanner() {
    return `<section class="n-custom-banner"><span class="n-custom-doodle" aria-hidden="true">♡</span><div><h2>Your ideas. <em>Your set.</em></h2><p>Classic French tips or something completely your own. Salon-inspired press-ons, handmade for you.</p></div>${button('custom','Create a custom set')}</section>`;
  }
  function newSetsNote() {
    return `<section class="n-new-sets n-wrap"><div><h2>Always creating <em>new sets.</em></h2><p>Still looking for your favorite? Bookmark the site and check back often, or follow me on Instagram for the latest designs.</p></div><a class="n-btn n-btn-light" href="${instagram}" target="_blank" rel="noopener noreferrer">Follow on Instagram</a></section>`;
  }
  function filtered() { return products.filter(p => state.filter === 'All designs' || (state.filter === 'Saved' ? state.favorites.has(p.id) : p.category === state.filter)); }
  function cards(list) {
    if (!list.length) return `<div class="n-no-results"><h3>No saved designs yet.</h3><p>Tap a heart to keep your favorites here.</p></div>`;
    return list.map(p => `<article class="n-product"><a class="n-product-link" href="#product/${p.id}" aria-label="View ${escape(p.name)}"><div class="n-product-image"><img src="${p.image}" alt="${escape(p.name)} — handmade nails by Hailey" loading="lazy"></div><div class="n-product-caption"><span class="n-product-title">${escape(p.name)}</span><span class="n-product-chevron" aria-hidden="true">&gt;</span></div></a>${button('favorite',state.favorites.has(p.id) ? '♥' : '♡','n-product-favorite',`data-id="${p.id}" aria-pressed="${state.favorites.has(p.id)}" aria-label="${state.favorites.has(p.id) ? 'Unsave' : 'Save'} ${escape(p.name)}"`)}</article>`).join('');
  }
  function catalogContent(home = false) {
    const list = home ? products.slice(0,6) : filtered();
    return `${home ? '' : `<div class="n-filters">${['All designs','Minimal','Statement','Seasonal','Miscellaneous','Saved'].map(name => button('filter',name === 'Saved' ? '♡ Saved' : name,'',`data-filter="${name}" aria-pressed="${state.filter === name}"`)).join('')}<span class="n-result-count">${list.length} designs</span></div>`}<div class="n-grid" aria-live="polite">${cards(list)}</div>${home ? `<div class="n-more-wrap">${button('catalog',`Explore all ${products.length} designs`,'n-btn n-btn-light')}</div>` : '<p class="n-catalog-note">Design names are preview labels. Hailey confirms each quote and availability.</p>'}`;
  }
  function home() {
    return `<section class="n-hero n-wrap"><div class="n-hero-copy"><span class="n-kicker">Handmade press-on nails</span><h1>A little detail.<br>A lot of <em>you.</em></h1><p>Reusable press-ons, made by Hailey.<br>Choose a design or dream up your own.</p><div class="n-actions">${button('catalog','Find your next set')}${button('custom','Make it custom','n-link')}</div></div><figure class="n-hero-figure"><div class="n-hero-photo"><img src="${byId('merry-little-details').image}" alt="Hailey’s handmade carnival-inspired Funhouse press-on nails"></div><figcaption>With lots of love, Hailey ♡</figcaption></figure></section><div class="n-values"><span>Handmade with care</span><span>Reusable press-ons</span><span>Houston, Texas</span></div><section class="n-section n-wrap"><div class="n-section-head"><h2>Find your next <em>favorite.</em></h2></div><div class="n-catalog-container">${catalogContent(true)}</div></section><div class="n-wrap">${customBanner()}</div>${newSetsNote()}<div class="n-pricing-section n-wrap">${priceMenu()}</div><section class="n-how n-wrap"><div class="n-how-grid">${[['01','Choose a design.','Shop the collection or start a custom set.'],['02','Share your details.','Hailey confirms your fit, quote, and timing.'],['03','Order directly.','Arrange your order with Hailey.']].map(([n,title,text]) => `<article class="n-how-item"><small>${n}</small><h3>${title}</h3><p>${text}</p></article>`).join('')}</div></section>`;
  }
  function product() {
    const p = byId(state.product);
    return `<div class="n-wrap"><div class="n-crumb">${button('catalog','All designs','n-link')}<span>/</span><span>${escape(p.name)}</span></div><section class="n-product-detail"><div>${button('zoom',`<img src="${p.image}" alt="${escape(p.name)}: ${escape(p.description)}">`,'n-detail-photo',`aria-label="Zoom ${escape(p.name)} photo" aria-pressed="false"`)}<p class="n-photo-caption">Tap for a closer look.</p></div><div class="n-detail-copy"><span class="n-kicker">${p.inspiration ? 'Design inspiration' : 'Handmade by Hailey'}</span><h1>${escape(p.name)}</h1><p>${escape(p.description)}</p>${p.inspiration ? '' : `<div class="n-choices"><div class="n-field-label"><span>Your size</span>${button('size','Size help','n-link')}</div><div class="n-size-buttons">${['XS','S','M','L',sizeHelp].map(size => button('size-choice',size,'',`data-size="${size}" aria-pressed="${state.selection.size === size}"`)).join('')}</div><div class="n-detail-selects">${field('Shape',select('detail-shape',shapes,state.selection.shape))}${field('Length',select('detail-length',lengths,state.selection.length))}${field('Design type',designTypeSelect('detail-style',state.selection.style))}${field('Charms',select('detail-charms',charmChoices,state.selection.charms))}</div>${estimatePanel()}</div>`}${button('inquire',p.inspiration ? 'Create a custom set' : 'Request this set','n-btn n-detail-cta',`data-id="${p.id}"`)}<p class="n-inline-note">Hailey confirms your price, fit, and availability.</p><div class="n-detail-accordion">${accordion('Price menu',menuImage())}${accordion('What’s included?', '<p>Handmade press-ons, an application kit, and care instructions. Confirm the exact details with Hailey before ordering.</p>')}${accordion('Application & care',`${careImage()}<p>For removal, follow your adhesive’s instructions. Never pull or force nails off.</p>`)}</div></div></section></div>`;
  }
  function measurementFields(hand) {
    return `<div class="n-field n-full" data-measurements><span>${hand === 'left' ? 'Left' : 'Right'} hand · widths in mm</span><div class="n-measure-row">${['Thumb','Index','Middle','Ring','Pinky'].map(finger => field(finger,`<input name="${hand}_${finger.toLowerCase()}" type="number" min="1" max="30" step="0.1" inputmode="decimal" aria-label="${hand} ${finger} width in millimeters">`)).join('')}</div></div>`;
  }
  function contactFields() {
    return `${field('Name *','<input name="name" required autocomplete="name" maxlength="100">')}${field('Email *','<input name="email" type="email" required autocomplete="email" maxlength="200">')}${field('Reply by',select('contact_method',['Email','Text message','Instagram']),'n-full')}<label class="n-field n-full n-channel-field" data-channel="Text message" hidden>Phone *<input name="phone" type="tel" autocomplete="tel" maxlength="35" disabled></label><label class="n-field n-full n-channel-field" data-channel="Instagram" hidden>Instagram handle *<input name="instagram" placeholder="@yourhandle" maxlength="100" disabled></label>`;
  }
  function inquiry() {
    const p = byId(state.product), custom = state.view === 'custom', contact = state.view === 'contact';
    const selectedSize = state.selection.size;
    const title = contact ? 'Say <em>hello.</em>' : custom ? 'Make it <em>yours.</em>' : 'Your next <em>set.</em>';
    const today = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    return `${pageTitle(title,contact ? 'Questions? Leave Hailey a note.' : custom ? 'French tips, your favorite colors, or your own design. Salon-inspired nails, made for you.' : 'Share your details. Hailey will confirm your quote and availability.')}<div class="n-simple-form n-wrap"><form class="n-inquiry-form">${p && !custom && !contact ? `<div class="n-selected-design"><img src="${p.image}" alt="${escape(p.name)}"><strong>${escape(p.name)}</strong></div>` : ''}<fieldset class="n-form-section"><legend>Your details</legend><div class="n-form-grid">${contactFields()}</div></fieldset>${contact ? '' : `<fieldset class="n-form-section"><legend>Your set</legend><div class="n-form-grid">${custom ? '<input type="hidden" name="design" value="My own custom design">' : field('Design',select('design',['Help me choose',...products.filter(item => !item.inspiration).map(item => item.name)],p?.name || 'Help me choose'),'n-full')}${field('Shape',select('shape',shapes,state.selection.shape))}${field('Length',select('length',lengths,state.selection.length))}${field('Size',select('size',[sizeHelp,'XS','S','M','L'],selectedSize),'n-full')}<details class="n-measurement-details n-full" data-custom-size><summary>Add measurements <small>(optional)</small></summary><p>Leave these blank if you need help finding your size.</p><div class="n-form-grid">${measurementFields('left')}${measurementFields('right')}</div></details>${field('Design type',designTypeSelect('style',state.selection.style))}${field('Charms',select('charms',charmChoices,state.selection.charms))}${custom ? `${field('Colors','<input name="colors" placeholder="Blush, berry, a little gold…" maxlength="300">')}` : ''}</div>${button('size','Not sure of your size?','n-link n-size-help')}</fieldset>${custom ? `<fieldset class="n-form-section"><legend>Your inspiration <small>(optional)</small></legend>${photoUpload()}</fieldset>` : ''}<details class="n-extra-details"><summary>A few more details <span class="muted">(optional)</span></summary><div class="n-form-grid">${field('Sets','<input name="quantity" type="number" min="1" max="20" value="1" required>')}${field('Requested date',`<input name="requested_date" type="date" min="${today}">`,'n-full')}${!custom ? `${field('Colors','<input name="colors" maxlength="300">')}<div class="n-full">${photoUpload()}</div>` : ''}</div><p class="n-inline-note">Dates and add-ons are confirmed with your quote.</p></details>`}<label class="n-field n-notes">${contact ? 'Message *' : 'Anything else?'}<textarea name="notes" ${contact ? 'required' : ''} maxlength="3000" placeholder="${contact ? 'How can Hailey help?' : 'A detail you love, an occasion, or a question…'}"></textarea></label><div class="n-form-error" role="alert" hidden></div>${!contact ? estimatePanel() : ''}<button class="n-btn n-form-submit" type="submit">${contact ? 'Send your note' : custom ? 'Send custom request' : 'Contact to purchase'}</button><p class="n-inline-note">${contact ? '' : 'An inquiry, not an order. '}Preview only—no message is sent.</p></form>${!contact ? `<div class="n-form-menu">${accordion('View Hailey’s price menu',menuImage())}</div>` : `<div class="n-contact-social"><a href="${instagram}" target="_blank" rel="noopener noreferrer">@pressonnailsbyhailey</a><span>Houston, Texas</span></div>`}</div>`;
  }
  function photoUpload() {
    return `<div class="n-upload"><label>Reference photos<input type="file" name="reference_photos" accept="image/jpeg,image/png,image/webp" multiple></label><p class="n-inline-note">Up to 3 photos · 3 MB total · JPG, PNG, WebP</p><div class="n-upload-preview"></div></div>`;
  }
  function about() {
    return `${pageTitle('Hi, I’m <em>Hailey.</em>')}<section class="n-about-grid n-wrap"><img class="n-hailey-portrait" src="${brand.portrait}" alt="Hailey Lovelady, the maker behind Nails by Hailey"><div><h2>Handmade in Houston.<br><em>Made for you.</em></h2><p>I’m Hailey Lovelady. I make reusable press-on nails, from simple everyday sets to custom designs full of personality.</p><p>Find a look you love, or share your ideas. I’d love to make a set that feels like you.</p><span class="n-signature">With lots of love, Hailey ♡</span><div class="n-actions">${button('catalog','Shop designs')}<a class="n-link" href="${instagram}" target="_blank" rel="noopener noreferrer">Instagram</a></div></div></section>`;
  }
  function sizeGuide() {
    return `${pageTitle('Find your <em>fit.</em>','Measure each natural nail at its widest point.')}<div class="n-guide-grid n-wrap"><section class="n-guide-card">${[['01','Tape.','Lay clear tape across your nail, following its curve.'],['02','Measure.','Mark both edges, lift the tape, and measure between the marks in millimeters.'],['03','Repeat.','Measure all ten nails. Keep left and right hands separate.']].map(([n,title,text]) => `<div class="n-guide-step"><span>${n}</span><div><h3>${title}</h3><p>${text}</p></div></div>`).join('')}</section><section><div class="n-guide-note"><h3>Not sure? I can help.</h3><p>Choose “Help Me / Custom” on the form. Standard XS–L measurements will be confirmed by Hailey.</p>${button('contact','Ask about sizing','n-link')}</div><div class="n-guide-note"><h3>Your own measurements.</h3><p>Choose “Help Me / Custom” and add your measurements if you know them.</p>${button('custom','Create your set','n-link')}</div></section></div>`;
  }
  function faq() {
    return `${pageTitle('Good to <em>know.</em>')}<div class="n-faq n-wrap">${accordion('Price menu',menuImage())}${accordion('How to apply',careImage())}${accordion('How do I order?','<p>Choose a design and send an inquiry. Hailey confirms your quote, fit, and timing, then arranges the order with you directly.</p>')}${accordion('Are press-ons reusable?','<p>Yes, with gentle removal and care. Rewear depends on your adhesive, application, and removal. Never pull nails off.</p>')}${accordion('Shipping, pickup & returns','<p>Confirm delivery arrangements, processing times, and returns terms with Hailey before ordering.</p>')}<div class="n-actions">${button('contact','Ask Hailey','n-btn')}</div></div>`;
  }
  const headers = ['Reference','Name','Email','Phone','Instagram','Contact via','Design','Shape','Length','Size','Left widths','Right widths','Quantity','Colors','Style','Charms','Requested date','Notes','Reference files','Estimated total','Estimate type','Status','Submitted'];
  function sheet() {
    return `${pageTitle('Inquiry <em>preview.</em>','Live inquiries are sent to Google Sheets; this page also shows local preview rows.')}<div class="n-wrap n-sheet-page"><div class="n-actions">${button('custom','Try a request')}${rows.length ? button('export','Download CSV','n-btn n-btn-light') + button('clear','Clear demo rows','n-link') : ''}</div><div class="n-sheet-wrap"><table class="n-sheet"><thead><tr>${headers.map(h => `<th scope="col">${escape(h)}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.map(row => `<tr>${headers.map(h => `<td>${escape(row[h] || '—')}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}">Submit sample details to see an inquiry row here.</td></tr>`}</tbody></table></div></div>`;
  }
  function success() {
    return `<div class="n-wrap"><div class="n-success"><span aria-hidden="true">♡</span><h1>${state.lastSubmissionLive ? 'Request <em>sent.</em>' : 'Preview <em>saved.</em>'}</h1><p>${state.lastSubmissionLive ? 'Your inquiry was sent to Hailey.' : 'This local preview saved a sample inquiry in the browser only.'}</p><div class="n-reference">${escape(state.lastRow.Reference)}</div><div class="n-actions">${button('sheet','View inquiry row')}${button('catalog','Back to designs','n-link')}</div></div></div>`;
  }
  function releasePhotos() { state.photoUrls.forEach(url => URL.revokeObjectURL(url)); state.photoUrls = []; }
  function paint() {
    releasePhotos();
    main.classList.toggle('n-form-page',['custom','inquiry','contact'].includes(state.view));
    const templates = {home,catalog:() => `${pageTitle('The <em>collection.</em>','Choose a design. Hailey will help make it yours.')}<section class="n-section n-wrap n-collection-page"><div class="n-catalog-container">${catalogContent()}</div></section>${newSetsNote()}`,product,inquiry,custom:inquiry,contact:inquiry,about,size:sizeGuide,faq,sheet,sent:success};
    main.innerHTML = (templates[state.view] || home)();
    root.querySelector('.n-saved-count').textContent = state.favorites.size;
    root.querySelector('.n-mobile-panel').hidden = true;
    root.querySelector('.n-mobile-menu').setAttribute('aria-expanded','false');
    root.querySelectorAll('.n-navlinks button').forEach(el => { if (el.dataset.action === state.view) el.setAttribute('aria-current','page'); else el.removeAttribute('aria-current'); });
    toggleMeasurements();
    updateEstimate();
  }
  function navigate(view, id = '') {
    const next = '#' + view + (id ? '/' + id : '');
    if (location.hash === next) route(); else location.hash = next;
  }
  function route() {
    const [view = 'home',id] = location.hash.slice(1).split('/');
    state.view = ['home','catalog','product','inquiry','custom','contact','about','size','faq','sheet','sent'].includes(view) ? view : 'home';
    if (['product','inquiry'].includes(state.view)) {
      if (!byId(id)) state.view = 'catalog';
      else { if (state.product !== id) state.selection = freshSelection(); state.product = id; }
    }
    if (state.view === 'sent' && !state.lastRow) state.view = 'contact';
    paint(); window.scrollTo({top:0,behavior:'auto'});
    document.title = `${state.view === 'product' ? byId(state.product).name : ({home:'Handmade press-ons',catalog:'Shop designs',custom:'Custom nails',about:'About Hailey',size:'Size guide',faq:'Pricing & care',contact:'Contact',inquiry:'Your inquiry',sent:'Preview saved',sheet:'Inquiry preview'})[state.view]} · Nails by Hailey`;
  }
  function toggleMeasurements() {
    const form = main.querySelector('.n-inquiry-form'), size = form?.elements.namedItem('size'); if (!size) return;
    const measurements = form.querySelector('[data-custom-size]');
    if (!measurements) return;
    measurements.hidden = size.value !== sizeHelp;
    measurements.querySelectorAll('input').forEach(input => { input.required = false; input.disabled = measurements.hidden; });
  }
  function formError(form, text) { const el = form.querySelector('.n-form-error'); el.className = 'n-form-error n-error'; el.textContent = text; el.hidden = !text; }
  root.addEventListener('invalid',event => {
    // A required field inside optional details must be visible for native validation.
    const details = event.target.closest('details'); if (details) details.open = true;
  },true);
  root.addEventListener('click', event => {
    const el = event.target.closest('button[data-action]'); if (!el) return;
    const action = el.dataset.action;
    if (action === 'menu') { const menu = root.querySelector('.n-mobile-panel'); menu.hidden = !menu.hidden; el.setAttribute('aria-expanded',String(!menu.hidden)); return; }
    if (action === 'filter') { state.filter = el.dataset.filter; main.querySelector('.n-catalog-container').innerHTML = catalogContent(); return; }
    if (action === 'favorite') {
      state.favorites.has(el.dataset.id) ? state.favorites.delete(el.dataset.id) : state.favorites.add(el.dataset.id);
      try { localStorage.setItem('hailey-saved-designs',JSON.stringify([...state.favorites])); } catch {}
      main.querySelector('.n-catalog-container').innerHTML = catalogContent(state.view === 'home'); root.querySelector('.n-saved-count').textContent = state.favorites.size; return;
    }
    if (action === 'saved') { state.filter = 'Saved'; navigate('catalog'); return; }
    if (action === 'catalog') state.filter = 'All designs';
    if (action === 'product') { navigate('product',el.dataset.id); return; }
    if (action === 'inquire') {
      if (byId(el.dataset.id)?.inspiration) { state.selection = freshSelection(); state.product = ''; navigate('custom'); }
      else navigate('inquiry',el.dataset.id);
      return;
    }
    if (action === 'custom') { state.selection = freshSelection(); state.product = ''; }
    if (action === 'zoom') { el.setAttribute('aria-pressed',String(el.classList.toggle('n-zoom'))); return; }
    if (action === 'size-choice') { state.selection.size = el.dataset.size; main.querySelectorAll('[data-action="size-choice"]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.size === state.selection.size))); return; }
    if (action === 'clear') { rows.length = 0; paint(); return; }
    if (action === 'export') {
      const cell = value => { let text = String(value ?? ''); if (/^[\s]*[=+@\-]/.test(text)) text = "'" + text; return '"' + text.replaceAll('"','""') + '"'; };
      const csv = '\uFEFF' + [headers,...rows.map(row => headers.map(h => row[h]))].map(row => row.map(cell).join(',')).join('\r\n');
      const url = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'})), link = document.createElement('a'); link.href = url; link.download = 'hailey-demo-inquiries.csv'; root.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url),1000); return;
    }
    if (['home','catalog','custom','contact','about','size','faq','sheet'].includes(action)) navigate(action);
  });
  root.addEventListener('change',event => {
    const input = event.target;
    if (input.name === 'detail-shape') state.selection.shape = input.value;
    if (input.name === 'detail-length') state.selection.length = input.value;
    if (input.name === 'detail-style') state.selection.style = input.value;
    if (input.name === 'detail-charms') state.selection.charms = input.value;
    if (['detail-shape','detail-length','detail-style','detail-charms','shape','length','style','charms','quantity','size'].includes(input.name)) updateEstimate();
    if (input.name === 'size') toggleMeasurements();
    if (input.name === 'contact_method') input.form.querySelectorAll('.n-channel-field').forEach(group => { group.hidden = group.dataset.channel !== input.value; const field = group.querySelector('input'); field.disabled = group.hidden; field.required = !group.hidden; });
    if (input.name === 'reference_photos') {
      const files = [...input.files], form = input.form; releasePhotos(); formError(form,''); const preview = form.querySelector('.n-upload-preview'); preview.replaceChildren();
      if (files.length > 3 || files.reduce((sum,file) => sum + file.size,0) > 3*1024*1024 || files.some(file => !['image/jpeg','image/png','image/webp'].includes(file.type))) { input.value = ''; formError(form,'Choose up to 3 JPG, PNG, or WebP photos, under 3 MB total.'); return; }
      files.forEach(file => { const url = URL.createObjectURL(file), image = document.createElement('img'); state.photoUrls.push(url); image.src = url; image.alt = file.name; preview.appendChild(image); });
    }
  });
  root.addEventListener('input',event => { if (event.target.name === 'quantity') updateEstimate(); });
  root.addEventListener('submit', async event => {
    const form = event.target; if (!form.matches('.n-inquiry-form')) return; event.preventDefault(); if (!form.reportValidity()) return;
    const data = new FormData(form), get = name => String(data.get(name) || '').trim();
    if (!get('name') || !get('email')) { formError(form,'Please add your name and email.'); return; }
    const widths = hand => { const values = ['thumb','index','middle','ring','pinky'].map(f => get(hand+'_'+f)); return values.some(Boolean) ? values.join(', ') : ''; };
    const row = {Reference:`NBH-${String(Date.now()).slice(-8)}`,Name:get('name'),Email:get('email'),Phone:get('phone'),Instagram:get('instagram'),'Contact via':get('contact_method') || 'Email',Design:get('design') || 'General question',Shape:get('shape'),Length:get('length'),Size:get('size'),'Left widths':get('size') === sizeHelp ? widths('left') : '','Right widths':get('size') === sizeHelp ? widths('right') : '',Quantity:get('quantity') || (state.view === 'contact' ? '' : '1'),Colors:get('colors'),Style:get('style'),Charms:get('charms'),'Requested date':get('requested_date'),Notes:get('notes'),'Reference files':[...(form.elements.namedItem('reference_photos')?.files || [])].map(file => file.name).join(', '),Status:'New inquiry',Submitted:new Date().toISOString()};
    if (state.view !== 'contact') { const estimate = currentEstimate(); row['Estimated total'] = estimate.total === null ? 'Quote needed' : money(estimate.total); row['Estimate type'] = !estimate.tier ? 'Quote needed' : estimate.starting ? 'Starting estimate' : 'Estimate'; }
    const submitButton = form.querySelector('.n-form-submit'), originalLabel = submitButton.textContent;
    submitButton.disabled = true; submitButton.textContent = 'Sending…'; formError(form,'');
    const localPreview = location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    try {
      if (!localPreview) {
        const response = await fetch('/.netlify/functions/submit-inquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(row)});
        const result = await response.json().catch(() => ({ok:false}));
        if (!response.ok || !result.ok) throw new Error(result.error || 'Could not send inquiry');
        state.lastSubmissionLive = true;
      } else {
        state.lastSubmissionLive = false;
      }
      rows.push(row); state.lastRow = row; navigate('sent');
    } catch (error) {
      submitButton.disabled = false; submitButton.textContent = originalLabel;
      formError(form,'We could not send this inquiry right now. Please try again.');
    }
  });
  window.addEventListener('hashchange',route);
  route();
})();
