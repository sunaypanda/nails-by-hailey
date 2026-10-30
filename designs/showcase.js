(() => {
  'use strict';
  const root = document.getElementById('nbh-designs');
  const dataElement = document.getElementById('nbh-catalog');
  if (!root || !dataElement) return;
  const products = JSON.parse(dataElement.textContent);
  const instagram = 'https://www.instagram.com/pressonnailsbyhailey/';
  const directions = [
    { key: 'blush', name: 'Blush Atelier', kicker: 'Little details. A whole lot of you.', title: 'A little detail.<br>A lot of <em>you.</em>', description: 'Handmade press-on nails for your everyday main-character moments. Made by Hailey, with lots of love.', hero: 'pink-reverie', note: 'your next little obsession', collection: 'Meet your next <em>favorite.</em>', collectionKicker: 'Small sets. Big personality.', custom: 'Dream it. <em>I’ll make it.</em>' },
    { key: 'cherry', name: 'Cherry Club', kicker: 'Your nails called. They want a little personality.', title: 'cute nails.<br><em>big energy.</em>', description: 'A little playful. A little extra. A whole lot of you. Meet handmade press-ons with a personality of their own.', hero: 'ribbon-romance', note: 'made you look ♡', collection: 'pick your <em>personality.</em>', collectionKicker: 'The little details club', custom: 'Your idea. <em>My tiny canvas.</em>' },
    { key: 'blue', name: 'Blue Hour', kicker: 'Houston-made. Personally yours.', title: 'Your style.<br>Down to the<br><em>fingertips.</em>', description: 'Thoughtfully handmade press-ons. A fresh little detail for whatever your day looks like.', hero: 'blue-daydream', note: 'a little color, just for you', collection: 'A set for every <em>version of you.</em>', collectionKicker: 'The design studio', custom: 'Something <em>just for you.</em>' },
    { key: 'editorial', name: 'The Nail Edit', kicker: 'Nails by Hailey — the handmade edit', title: 'The art of<br><em>little details.</em>', description: 'Handmade press-ons. Considered details. Your own point of view. Explore the designs, then make them yours.', hero: 'after-hours', note: 'The handmade edit / Houston, TX', collection: 'The <em>design edit.</em>', collectionKicker: 'Explore the collection', custom: 'An idea. <em>An original.</em>' },
    { key: 'scrapbook', name: 'Hailey’s Scrapbook', kicker: 'A little corner of happy, handmade things.', title: 'Made with love.<br>Made for<br><em>your kind of cute.</em>', description: 'Your favorite colors. Your little details. Handmade press-ons that feel like a tiny piece of you.', hero: 'pink-reverie', note: 'from my hands to yours ♡', collection: 'A few things to <em>fall for.</em>', collectionKicker: 'Pages from my little nail diary', custom: 'Let’s make your <em>little daydream.</em>' }
  ];
  // Standalone review files can choose a different opening photo without changing
  // the original design examples.
  if (root.dataset.hero && products.some(p => p.id === root.dataset.hero)) {
    directions.forEach(direction => { direction.hero = root.dataset.hero; });
  }
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const arrow = '<span aria-hidden="true">↗</span>';
  const byId = id => products.find(product => product.id === id);
  const previewRows = [];
  const states = new Map();
  const saved = window.openai?.widgetState;
  const savedPreferences = saved?.privateContent?.preferences || saved?.preferences || {};
  const label = (text, content, classes = '') => `<label class="n-field ${classes}">${text}${content}</label>`;
  const optionList = (values, current, placeholder = '') => `${placeholder ? `<option value="">${escape(placeholder)}</option>` : ''}${values.map(value => `<option${value === current ? ' selected' : ''}>${escape(value)}</option>`).join('')}`;
  const input = (name, attrs = '') => `<input name="${name}" ${attrs}>`;
  const select = (name, values, current = '', placeholder = '') => `<select name="${name}">${optionList(values, current, placeholder)}</select>`;
  const fieldButton = (action, text, classes = 'n-btn', extra = '') => `<button type="button" class="${classes}" data-action="${action}" ${extra}>${text}</button>`;

  function savePreferences() {
    if (!window.openai?.setWidgetState) return;
    const preferences = {};
    states.forEach((state, key) => { preferences[key] = { filter: state.filter, favorites: [...state.favorites], expanded: state.expanded }; });
    window.openai.setWidgetState({ modelContent: { savedNailDesigns: [...new Set([...states.values()].flatMap(s => [...s.favorites]))].map(id => byId(id)?.name).filter(Boolean) }, privateContent: { preferences } }).catch(() => {});
  }

  function shell(state) {
    const d = state.direction;
    state.stage.innerHTML = `<div class="n-review"><span><span class="n-review-dot"></span>${escape(d.name.toUpperCase())} <span aria-hidden="true">/</span> INTERACTIVE DESIGN PREVIEW</span><button type="button" data-action="sheet" class="n-inbox-label">Excel preview · ${previewRows.length}</button></div><div class="n-site n-${d.key}" aria-label="${escape(d.name)} storefront"><div class="n-announcement"><span>HANDMADE IN HOUSTON, TEXAS</span><span>With lots of love ♡</span></div><header class="n-nav n-wrap"><button type="button" class="n-brand" data-action="home" aria-label="Nails by Hailey home">nails <i>by Hailey</i><small aria-hidden="true">♡</small></button><nav class="n-navlinks" aria-label="Main navigation"><button type="button" data-action="catalog">The collection</button><button type="button" data-action="custom">Make it custom</button><button type="button" data-action="size">Find your fit</button><button type="button" data-action="about">Meet Hailey</button></nav><div class="n-nav-end"><button type="button" class="n-nav-contact" data-action="contact">Say hello ${arrow}</button><button type="button" class="n-nav-heart" data-action="saved" aria-label="View your saved designs"><span aria-hidden="true">♡</span><small class="n-saved-count">${state.favorites.size}</small></button><button type="button" class="n-mobile-menu" data-action="menu" aria-label="Open navigation" aria-expanded="false">☰</button></div></header><nav class="n-mobile-panel" hidden aria-label="Mobile navigation">${[['catalog', 'Explore the collection'], ['custom', 'Create a custom set'], ['size', 'Find your fit'], ['about', 'Meet Hailey'], ['contact', 'Contact Hailey'], ['faq', 'FAQs & nail care']].map(([action, text]) => fieldButton(action, `${text} ↗`, '')).join('')}</nav><main class="n-main"></main><footer class="n-footer n-wrap"><div class="n-footer-top"><button type="button" class="n-brand" data-action="home">nails <i>by Hailey</i><small aria-hidden="true">♡</small></button><p>From my hands to yours.</p><div class="n-footer-links"><a href="${instagram}" target="_blank" rel="noopener noreferrer">Instagram ↗</a><button type="button" data-action="faq">Nail care & FAQs</button><button type="button" data-action="contact">Get in touch</button></div></div><div class="n-footer-bottom"><span>© ${new Date().getFullYear()} Nails by Hailey · Houston, Texas</span><span>With lots of love, always.</span></div></footer></div>`;
    state.site = state.stage.querySelector('.n-site');
    state.main = state.site.querySelector('.n-main');
    paint(state);
    if (globalThis.Tweak) {
      const style = { accent: state.direction.key === 'cherry' ? '#bd3040' : state.direction.key === 'blue' ? '#4f748b' : state.direction.key === 'editorial' ? '#72594d' : state.direction.key === 'scrapbook' ? '#826797' : '#96515d', radius: state.direction.key === 'cherry' ? 15 : state.direction.key === 'scrapbook' ? 7 : state.direction.key === 'editorial' ? 0 : state.direction.key === 'blue' ? 2 : 3 };
      const tweak = new Tweak({ container: state.site, onChange: () => { state.site.style.setProperty('--n-accent', style.accent); state.site.style.setProperty('--n-radius', `${style.radius}px`); } });
      tweak.addColorPicker(style, 'accent', { label: 'Accent color', reference: '--n-accent' });
      tweak.addSlider(style, 'radius', { label: 'Card corners', min: 0, max: 24, unit: 'px', reference: '--n-radius' });
    }
  }

  function home(state) {
    const d = state.direction, hero = byId(d.hero), secondary = byId('barely-blush');
    return `<section class="n-hero n-wrap"><div class="n-hero-copy"><span class="n-kicker">${d.kicker}</span><h1>${d.title}</h1><p>${d.description}</p><div class="n-actions">${fieldButton('catalog', `Find your next set ${arrow}`)}${fieldButton('custom', `Make it custom ${arrow}`, 'n-link')}</div><div class="n-hero-footnote">YOUR STYLE. YOUR FIT. YOUR LITTLE WORK OF ART.</div></div><div class="n-hero-photo"><img src="${hero.image}" alt="${escape(hero.name)} — actual handmade nail designs by Hailey"><div class="n-stamp"><b aria-hidden="true">♡</b><span>MADE BY HAND<br>WITH LOTS OF LOVE</span></div><span class="n-photo-note">${d.note}</span></div><div class="n-hero-secondary"><img src="${secondary.image}" alt="Hailey’s handmade glossy blush design"><span>A LITTLE UNDERSTATED. COMPLETELY YOU.</span></div></section><div class="n-values"><span>Handmade with care</span><span>Made to express you</span><span>Reusable press-ons</span><span>Houston, Texas</span></div>${catalogSection(state)}<div class="n-wrap">${customBanner(state)}</div>${howItWorks()}`;
  }
  function customBanner(state) {
    return `<section class="n-custom-banner"><div class="n-custom-doodle" aria-hidden="true">your little<br>daydream ♡</div><div><span class="n-kicker">Your ideas. My little canvas.</span><h2>${state.direction.custom}</h2><p>A saved photo, a favorite color, or something wonderfully extra. Let’s turn your ideas into your next set.</p></div>${fieldButton('custom', `Let’s create ${arrow}`)}</section>`;
  }
  function howItWorks() {
    return `<section class="n-how n-wrap"><span class="n-kicker">Good nails, without the appointment</span><h2>From a little idea to <em>your fingertips.</em></h2><div class="n-how-grid">${[['01', 'Find your favorite.', 'Choose a design you love, or tell Hailey about something completely your own.'], ['02', 'Make it your fit.', 'Share your size and preferences. Hailey will confirm pricing, availability, and the details.'], ['03', 'Let’s make it happen.', 'Arrange your order directly with Hailey, then apply your press-ons yourself at home.']].map(([n, title, copy]) => `<article class="n-how-item"><small>${n}</small><h3>${title}</h3><p>${copy}</p></article>`).join('')}</div></section>`;
  }
  function filterButtons(state) {
    const names = ['All designs', 'Minimal', 'Statement', 'Seasonal', 'Saved'];
    return `<div class="n-filters">${names.map(name => `<button type="button" data-action="filter" data-filter="${name}" aria-pressed="${state.filter === name}">${name === 'Saved' ? '♡ Saved' : name}</button>`).join('')}<span class="n-result-count">${filtered(state).length} designs</span></div>`;
  }
  function filtered(state) { return products.filter(p => state.filter === 'All designs' || state.filter === 'Saved' ? state.filter !== 'Saved' || state.favorites.has(p.id) : p.category === state.filter); }
  function productCards(state) {
    const all = filtered(state), visible = state.expanded || state.filter !== 'All designs' ? all : all.slice(0, 6);
    if (!visible.length) return `<div class="n-no-results"><h3>${state.filter === 'Saved' ? 'A little room for favorites.' : 'Nothing here just yet.'}</h3><p>${state.filter === 'Saved' ? 'Tap a little heart on any design to save it here.' : 'Try another collection, or dream up your own design.'}</p></div>`;
    return visible.map(p => `<article class="n-product"><button type="button" class="n-product-image" data-action="product" data-id="${p.id}" aria-label="Explore ${escape(p.name)}"><img src="${p.image}" alt="${escape(p.name)}: actual handmade nail artwork by Hailey" loading="lazy"><span class="n-image-view" aria-hidden="true">↗</span></button><button type="button" class="n-product-favorite" data-action="favorite" data-id="${p.id}" aria-pressed="${state.favorites.has(p.id)}" aria-label="${state.favorites.has(p.id) ? 'Unsave' : 'Save'} ${escape(p.name)}">${state.favorites.has(p.id) ? '♥' : '♡'}</button><div class="n-product-caption"><button type="button" class="n-product-title" data-action="product" data-id="${p.id}">${escape(p.name)}</button><button type="button" class="n-link" data-action="inquire" data-id="${p.id}">Ask about this ${arrow}</button></div><div class="n-product-meta">${p.category} · Handmade design</div></article>`).join('');
  }
  function catalogSection(state) {
    return `<section class="n-section n-wrap" aria-label="Nail design catalog"><div class="n-section-head"><div><span class="n-kicker">${state.direction.collectionKicker}</span><h2>${state.direction.collection}</h2></div><p>See something you love?<br>Contact Hailey to make it yours.</p></div><div class="n-catalog-container">${catalogContents(state)}</div></section>`;
  }
  function catalogContents(state) {
    const all = filtered(state);
    return `<div class="n-collection-layout"><aside class="n-side-filter"><span>FIND YOUR MOOD</span>${filterButtons(state)}</aside><div><div class="n-main-filters">${filterButtons(state)}</div><div class="n-grid" aria-live="polite">${productCards(state)}</div>${all.length > 6 && state.filter === 'All designs' ? `<div class="n-more-wrap">${fieldButton('more', `${state.expanded ? 'Show a little less' : `See all ${products.length} designs`} ${arrow}`, 'n-btn n-btn-light')}</div>` : ''}<p class="n-catalog-note">Actual photos by Hailey. Design names are preview labels. Pricing, sizing, and availability are confirmed directly with Hailey.</p></div></div>`;
  }
  function pageTitle(kicker, title, copy = '') { return `<div class="n-page-title n-wrap"><span class="n-kicker">${kicker}</span><h1>${title}</h1>${copy ? `<p>${copy}</p>` : ''}</div>`; }
  function breadcrumbs(state, end) { return `<div class="n-crumb"><button type="button" data-action="home">Home</button><span>/</span><button type="button" data-action="catalog">The collection</button><span>/</span><span>${escape(end)}</span></div>`; }
  function details(state) {
    const p = byId(state.product), selected = state.selection;
    return `<div class="n-wrap">${breadcrumbs(state, p.name)}<section class="n-product-detail"><div><button type="button" class="n-detail-photo" data-action="zoom" aria-label="Zoom actual photo of ${escape(p.name)}" aria-pressed="false"><img src="${p.image}" alt="${escape(p.description)}"></button><p class="n-photo-caption">Actual design by Hailey · Tap the photo for a closer look</p></div><div class="n-detail-copy"><span class="n-kicker">Handmade with lots of love</span><h1>${escape(p.name)}</h1><p>${escape(p.description)}</p><span class="n-quote-label">Made personal. Price confirmed with Hailey.</span><div class="n-choices"><div class="n-field-label"><span>Your size</span>${fieldButton('size', 'Need a hand? ↗', 'n-link')}</div><div class="n-size-buttons">${['XS', 'S', 'M', 'L', 'Custom', 'Help me'].map(size => `<button type="button" data-action="size-choice" data-size="${size}" aria-pressed="${selected.size === size}">${size}</button>`).join('')}</div><div class="n-detail-selects">${label('Shape preference', select('detail-shape', ['Help me choose', 'Almond', 'Square', 'Coffin'], selected.shape))}${label('Length preference', select('detail-length', ['Help me choose', 'Short', 'Medium'], selected.length))}</div></div>${fieldButton('inquire', `Contact to purchase <span aria-hidden="true">→</span>`, 'n-btn n-detail-cta', `data-id="${p.id}"`)}<p class="n-inline-note">Share your details with Hailey to confirm fit, price, and availability. Sending an inquiry doesn’t place an order.</p><div class="n-detail-accordion">${accordion('The little details', 'This is a handmade design reference. Hailey will confirm the available shape, length, sizing, and exactly what’s included before you order.')}${accordion('Made to wear again', 'Press-ons are designed to be reusable when cared for and removed gently. Rewear depends on your adhesive, application, removal, and care.')}${accordion('How do I order?', 'Choose your preferences and tap “Contact to purchase.” Hailey will receive your design inquiry and arrange the details directly with you. No online payment is taken here.')}</div></div></section>${customBanner(state)}</div>${howItWorks()}`;
  }
  function accordion(question, answer) { return `<details><summary>${question}</summary><p>${answer}</p></details>`; }
  function measurements(hand) {
    return `<div class="n-field n-full" data-measurements><span>${hand === 'left' ? 'Left' : 'Right'} hand widths (mm)</span><div class="n-measure-row">${['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'].map(finger => label(finger, `<input type="number" name="${hand}_${finger.toLowerCase()}" min="1" max="30" step="0.1" inputmode="decimal" aria-label="${hand} ${finger} width in millimeters">`)).join('')}</div></div>`;
  }
  function inquiry(state) {
    const p = byId(state.product), custom = state.view === 'custom', contact = state.view === 'contact', selection = state.selection;
    const title = custom ? 'Let’s dream up <em>your next set.</em>' : contact ? 'Let’s talk <em>little details.</em>' : 'A little closer to <em>your next set.</em>';
    const size = selection.size === 'Custom' ? 'Custom measurements' : selection.size === 'Help me' || !selection.size ? 'Help me find my size' : selection.size;
    const designOptions = ['Help me choose', 'My own custom design', ...products.map(item => item.name)];
    return `${pageTitle(custom ? 'Your ideas. My little canvas.' : 'A real person. A little small business.', title, custom ? 'A favorite color, a saved photo, a little spark of an idea. Tell me what you’re dreaming of.' : 'Share a few details and Hailey will help with pricing, your fit, and the next steps.')}<div class="n-inquiry-layout n-wrap"><aside class="n-aside"><span class="n-kicker">With lots of love</span><h2>Your style.<br>Your little details.<br><em>My handmade touch.</em></h2><p>${custom ? 'A special occasion, a clean French tip, or something wonderfully extra. Let’s make a set that feels like you.' : 'You’re sharing an inquiry with Hailey, the hands behind your nails. We’ll work out the little details together.'}</p><ol><li>Tell me what you have in mind.</li><li>I’ll confirm your design, fit, and quote.</li><li>We’ll arrange the order directly.</li></ol><p>No payment is taken here. Requested dates and designs are subject to confirmation.</p><span class="n-signature">With love, Hailey ♡</span><div style="margin-top:20px"><a href="${instagram}" target="_blank" rel="noopener noreferrer" class="n-link">@pressonnailsbyhailey ↗</a></div></aside><form class="n-inquiry-form">${p && !custom && !contact ? `<div class="n-selected-design"><img src="${p.image}" alt="${escape(p.name)}"><div><strong>${escape(p.name)}</strong><p>Your little design inspiration</p></div></div>` : ''}<fieldset class="n-form-section"><legend>First, a little about you.</legend><div class="n-form-grid">${label('Your name *', input('name', 'required autocomplete="name" maxlength="100"'), 'n-full')}${label('Email address *', input('email', 'type="email" required autocomplete="email" maxlength="200"'), 'n-email')}${label('Phone number', input('phone', 'type="tel" autocomplete="tel" maxlength="35" placeholder="Optional, unless you prefer a text"'), 'n-phone')}${label('Instagram handle', input('instagram', 'maxlength="100" placeholder="@yourhandle"'))}${label('How should I reach you?', select('contact_method', ['Email', 'Text message', 'Instagram'], 'Email'))}</div></fieldset><fieldset class="n-form-section"><legend>${contact ? 'What’s on your mind?' : 'The little design details.'}</legend><div class="n-form-grid">${label('Design *', `<select name="design" required>${optionList(designOptions, custom ? 'My own custom design' : p?.name || 'Help me choose')}</select>`, 'n-full')}${label('Shape preference', select('shape', ['Help me choose', 'Almond', 'Square', 'Coffin'], selection.shape))}${label('Length preference', select('length', ['Help me choose', 'Short', 'Medium'], selection.length))}${label('Your size *', `<select name="size" required>${optionList(['Help me find my size', 'XS', 'S', 'M', 'L', 'Custom measurements'], size)}</select>`)}${label('Number of sets', '<input type="number" name="quantity" required min="1" max="20" step="1" value="1">')}${measurements('left')}${measurements('right')}${label('Colors you love', input('colors', 'maxlength="300" placeholder="Berry, blush, a little gold…"'), 'n-full')}${label('Your style', select('style', ['Inspired by this design', 'Solid color', 'French tips', 'Simple nail art', 'Detailed nail art', 'Luxury / 3D', 'Seasonal / themed', 'Help me decide'], custom ? 'Help me decide' : 'Inspired by this design'))}${label('Charms', select('charms', ['None', '1–2 charms', '3 or more charms', 'Help me decide'], 'Help me decide'))}${label('Have a date in mind?', input('requested_date', 'type="date"'), 'n-full')}<div class="n-field n-full"><span class="n-inline-note">1–2 charms are free. The additional charge for 3+ is confirmed in your quote. Dates are requests, subject to availability.</span></div></div></fieldset><fieldset class="n-form-section"><legend>A little inspiration?</legend><div class="n-upload"><label>Add reference photos (optional)<input name="reference_photos" type="file" accept="image/jpeg,image/png,image/webp" multiple></label><p class="n-inline-note">Up to 3 JPG, PNG, or WebP images, 3 MB total. Preview only; files stay on your device.</p><div class="n-upload-preview"></div></div><label class="n-field" style="margin-top:19px">${contact ? 'Your message *' : 'Any other little details?'}<textarea name="notes" ${contact ? 'required' : ''} maxlength="3000" placeholder="An occasion, a detail you love, or a question for Hailey…"></textarea></label></fieldset><label class="n-form-check"><input name="consent" type="checkbox" required><span>I understand this is an inquiry. Hailey would confirm pricing, sizing, and availability before arranging an order.</span></label><div class="n-form-error" role="alert" hidden></div><button class="n-btn n-form-submit" type="submit">${custom ? 'Send my dream set' : contact ? 'Send my little note' : 'Contact to purchase'} <span aria-hidden="true">→</span></button><div class="n-demo-note">DESIGN PREVIEW · This creates a demo Excel row inside this preview. Nothing is sent to Hailey or an external spreadsheet.</div></form></div>`;
  }
  function sizeGuide() {
    return `${pageTitle('A little measuring. A much better fit.', 'Made for <em>your fingertips.</em>', 'Every hand is a little different. Let’s find your fit before you choose your next set.')}<div class="n-guide-grid n-wrap"><section class="n-guide-card"><span class="n-kicker">Your at-home measuring guide</span><h2>Let’s find your fit.</h2>${[['01', 'A little tape.', 'Lay clear tape over the widest part of your natural nail, gently following the curve from side to side.'], ['02', 'Mark & measure.', 'Mark both nail sidewalls, lift the tape, and lay it flat. Measure between the marks in millimeters.'], ['03', 'Do all ten.', 'Measure each finger on both hands. Write the widths down from thumb to pinky, keeping each hand separate.']].map(([n, title, copy]) => `<div class="n-guide-step"><span>${n}</span><div><h3>${title}</h3><p>${copy}</p></div></div>`).join('')}</section><section><div class="n-guide-note"><h3>A note on XS, S, M & L.</h3><p>Hailey’s standard-size measurements are still to be confirmed. Share your individual widths or ask for sizing help before selecting a standard size.</p>${fieldButton('custom', 'Share my measurements ↗', 'n-link')}</div><div class="n-guide-note"><h3>Different hands? That’s normal.</h3><p>You can choose “Custom measurements” in the inquiry form and give all ten widths. If you’re between sizes, Hailey can help with the little details.</p></div><div class="n-guide-note"><h3>A comfortable little fit.</h3><p>A press-on should sit comfortably from side to side without touching your skin. Measure your natural nails without enhancements. Ask for help if you’re unsure.</p>${fieldButton('contact', 'Ask Hailey about sizing ↗', 'n-link')}</div></section></div>`;
  }
  function about() {
    return `${pageTitle('The hands behind the little details', 'Hi, I’m <em>Hailey.</em>', 'Houston maker. Nail-design lover. The person putting a little love into your next set.')}<div class="n-about-grid n-wrap"><img src="${byId('ribbon-romance').image}" alt="Hailey’s actual handmade ribbon and gold nail artwork"><div><h2>Little works of art.<br><em>Made to feel like you.</em></h2><p>I’m Hailey Lovelady, the maker behind Nails by Hailey. I create handmade, reusable press-on nail designs here in Houston, Texas.</p><p>This little business is about creative details and personal style, whether you love a clean, simple look or want to dream up something completely your own.</p><p>You choose the look and apply your press-ons yourself at home. Share an idea, ask about a design, or get a little help finding your fit. I’d love to hear from you.</p><span class="n-signature">With lots of love, Hailey ♡</span><div class="n-actions">${fieldButton('catalog', `Find your next set ${arrow}`)}</div></div></div><div class="n-wrap">${customBanner({ direction: { custom: 'Your ideas. <em>My little canvas.</em>' } })}</div>`;
  }
  function faq() {
    return `${pageTitle('A little help, with lots of love', 'The little things, <em>answered.</em>', 'From choosing a design to caring for your next set.')}<div class="n-faq n-wrap"><h2>Finding your set</h2>${accordion('How do I purchase?', 'Explore the catalog, choose a design, and select “Contact to purchase.” Share your name, contact details, and preferences. Hailey will confirm the price, availability, size, and ordering details directly. No payment is taken on the website.')}${accordion('Can I create a custom design?', 'Yes. Choose “Make it custom” to share colors, shape, length, measurements, and reference photos. Hailey will discuss the final details with you before arranging an order.')}${accordion('What size should I choose?', 'Measure the widest part of each natural nail in millimeters. The size guide explains how. If you’re unsure, choose “Help me find my size” or send all ten measurements in the inquiry form.')}<h2>A little nail love</h2>${accordion('Are press-ons reusable?', 'They’re designed to be reusable when cared for and removed gently. Rewear depends on the adhesive you choose, application, removal, and care. There is no guaranteed wear time or number of reuses.')}${accordion('How do I apply and remove them?', 'Begin with clean, dry, healthy nails. Check the fit, then follow the instructions for your chosen adhesive. Avoid skin contact. For removal, follow your adhesive’s directions and never pull or force a press-on off. Stop if you feel pain or irritation.')}${accordion('What’s included?', 'Hailey will confirm the exact contents with you before purchase. Application supplies are not assumed to be included.')}<h2>Getting the details right</h2>${accordion('Shipping, pickup, and processing times?', 'Confirm the available shipping or Houston pickup arrangements and timing directly with Hailey before ordering. Dates entered on the inquiry form are requests, subject to confirmation.')}${accordion('Returns and exchanges?', 'Please ask Hailey for the confirmed returns and exchanges terms before purchasing.')}${accordion('Do you offer nail appointments?', 'This site is for handmade press-on nail products that customers apply themselves. It does not offer manicure or nail-application appointments.')}<div class="n-actions">${fieldButton('contact', `Still wondering? Say hello ${arrow}`)}</div></div>`;
  }
  function success(state) {
    const row = state.lastRow;
    return `<div class="n-wrap"><div class="n-success"><span aria-hidden="true">♡</span><h1>Your little idea.<br><em>All the details together.</em></h1><p>This preview inquiry is now a row in the demo sheet. In the finished site, these details will go to your connected Excel workbook so Hailey can follow up.</p><div class="n-reference">${escape(row.Reference)}</div><div class="n-actions">${fieldButton('sheet', `View the Excel row ${arrow}`)}${fieldButton('catalog', 'Keep a little browsing going →', 'n-link')}</div><div class="n-demo-note">PREVIEW ONLY · No real inquiry was sent. Your details stay in this page’s memory and disappear when it is reloaded.</div></div></div>`;
  }
  function sheet() {
    const headers = ['Reference', 'Name', 'Email', 'Phone', 'Instagram', 'Contact via', 'Design', 'Shape', 'Length', 'Size', 'Left widths (mm)', 'Right widths (mm)', 'Quantity', 'Colors', 'Style', 'Charms', 'Requested date', 'Notes', 'Reference files', 'Status', 'Submitted', 'Design direction'];
    return `${pageTitle('Behind the scenes · preview only', 'Every little detail.<br><em>One simple sheet.</em>', 'Try a “Contact to purchase” form to see exactly how a customer inquiry becomes an Excel row.')}<div class="n-wrap"><div class="n-actions">${fieldButton('contact', `Try an inquiry ${arrow}`)}${previewRows.length && root.dataset.standalone === 'true' ? fieldButton('export', 'Download Excel-friendly CSV ↓', 'n-btn n-btn-light') : ''}${previewRows.length ? fieldButton('clear', 'Clear demo rows', 'n-link n-reset-demo') : ''}</div><div class="n-sheet-wrap"><table class="n-sheet"><caption style="padding:12px;text-align:left;font-size:11px">${previewRows.length} ${previewRows.length === 1 ? 'demo inquiry' : 'demo inquiries'} · No live workbook connected</caption><thead><tr>${headers.map(h => `<th scope="col">${escape(h)}</th>`).join('')}</tr></thead><tbody>${previewRows.length ? previewRows.map(row => `<tr>${headers.map(h => `<td>${escape(row[h] || '—')}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}" style="padding:35px">Your demo inquiries will appear here. No sample customers or orders have been invented.</td></tr>`}</tbody></table></div><p class="n-sheet-help">This is a working preview of the row layout. Connecting the actual workbook will require its location and a server-side integration, such as a protected Microsoft Power Automate flow.</p><p class="n-warning">Only use sample contact details while reviewing. Demo rows stay in this page’s memory; nothing is submitted or saved externally.</p></div>`;
  }
  function paint(state) {
    releasePhotos(state);
    const templates = { home: () => home(state), catalog: () => `<div class="n-collection-page">${pageTitle('A little collection of self-expression', 'Find your next <em>little obsession.</em>', 'Handmade designs, real photos, and a whole lot of personality. Choose a look and make it personal.')}${catalogSection(state)}</div><div class="n-wrap">${customBanner(state)}</div>${howItWorks()}`, product: () => details(state), inquiry: () => inquiry(state), custom: () => inquiry(state), contact: () => inquiry(state), size: sizeGuide, about, faq, success: () => success(state), sheet };
    state.main.innerHTML = (templates[state.view] || templates.home)();
    state.stage.querySelector('.n-saved-count').textContent = state.favorites.size;
    if (['inquiry', 'custom', 'contact'].includes(state.view)) toggleMeasurements(state);
  }
  function go(state, view) {
    state.view = view; paint(state);
    state.site.querySelector('.n-mobile-panel').hidden = true;
    state.site.querySelector('.n-mobile-menu').setAttribute('aria-expanded', 'false');
    state.site.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
  function releasePhotos(state) { (state.photoUrls || []).forEach(url => URL.revokeObjectURL(url)); state.photoUrls = []; }
  function toggleMeasurements(state) {
    const form = state.main.querySelector('.n-inquiry-form'); if (!form) return;
    const custom = form.elements.namedItem('size').value === 'Custom measurements';
    form.querySelectorAll('[data-measurements]').forEach(el => { el.hidden = !custom; el.querySelectorAll('input').forEach(field => { field.required = custom; field.disabled = !custom; }); });
  }
  function formError(form, text) { const error = form.querySelector('.n-form-error'); error.className = 'n-form-error n-error'; error.textContent = text; error.hidden = !text; }
  function freshSelection() { return { size: '', shape: 'Help me choose', length: 'Help me choose' }; }
  function updateReviewCounts() { root.querySelectorAll('.n-inbox-label').forEach(button => { button.textContent = `Excel preview · ${previewRows.length}`; }); }
  function exportRows() {
    if (!previewRows.length || root.dataset.standalone !== 'true') return;
    const headers = Object.keys(previewRows[0]);
    const cell = value => { let text = String(value ?? ''); if (/^[\s]*[=+@\-]/.test(text)) text = `'${text}`; return `"${text.replace(/"/g, '""')}"`; };
    const csv = '\uFEFF' + [headers, ...previewRows.map(row => headers.map(key => row[key]))].map(row => row.map(cell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = 'nails-by-hailey-demo-inquiries.csv'; root.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]'); if (!button || !root.contains(button)) return;
    const stage = button.closest('[data-variant]'), state = states.get(stage?.dataset.key); if (!state) return;
    const action = button.dataset.action;
    if (action === 'menu') { const menu = state.site.querySelector('.n-mobile-panel'); menu.hidden = !menu.hidden; button.setAttribute('aria-expanded', String(!menu.hidden)); return; }
    if (action === 'filter') { state.filter = button.dataset.filter; state.expanded = false; state.main.querySelector('.n-catalog-container').innerHTML = catalogContents(state); savePreferences(); return; }
    if (action === 'more') { state.expanded = !state.expanded; state.main.querySelector('.n-catalog-container').innerHTML = catalogContents(state); savePreferences(); return; }
    if (action === 'favorite') { const id = button.dataset.id; if (state.favorites.has(id)) state.favorites.delete(id); else state.favorites.add(id); state.main.querySelector('.n-catalog-container').innerHTML = catalogContents(state); state.site.querySelector('.n-saved-count').textContent = state.favorites.size; savePreferences(); return; }
    if (action === 'saved') { state.filter = 'Saved'; state.expanded = true; go(state, 'catalog'); savePreferences(); return; }
    if (action === 'product') { state.product = button.dataset.id; state.selection = freshSelection(); go(state, 'product'); return; }
    if (action === 'zoom') { const zoomed = button.classList.toggle('n-zoom'); button.setAttribute('aria-pressed', String(zoomed)); return; }
    if (action === 'size-choice') { state.selection.size = button.dataset.size; state.main.querySelectorAll('.n-size-buttons button').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.size === state.selection.size))); return; }
    if (action === 'inquire') { if (state.product !== button.dataset.id) state.selection = freshSelection(); state.product = button.dataset.id; go(state, 'inquiry'); return; }
    if (action === 'custom' || action === 'contact') { state.product = ''; state.selection = freshSelection(); go(state, action); return; }
    if (action === 'clear') { previewRows.length = 0; updateReviewCounts(); go(state, 'sheet'); return; }
    if (action === 'export') { exportRows(); return; }
    if (['home', 'catalog', 'size', 'about', 'faq', 'sheet'].includes(action)) go(state, action);
  });

  root.addEventListener('change', event => {
    const field = event.target, stage = field.closest('[data-variant]'), state = states.get(stage?.dataset.key); if (!state) return;
    if (field.name === 'detail-shape') state.selection.shape = field.value;
    if (field.name === 'detail-length') state.selection.length = field.value;
    if (field.name === 'size') toggleMeasurements(state);
    if (field.name === 'contact_method') {
      const form = field.form;
      form.elements.namedItem('phone').required = field.value === 'Text message';
      form.elements.namedItem('instagram').required = field.value === 'Instagram';
    }
    if (field.name === 'reference_photos') {
      const form = field.form, files = [...field.files]; formError(form, ''); releasePhotos(state);
      const preview = form.querySelector('.n-upload-preview'); preview.replaceChildren();
      if (files.length > 3 || files.reduce((sum, file) => sum + file.size, 0) > 3 * 1024 * 1024 || files.some(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) { field.value = ''; formError(form, 'Please choose up to three JPG, PNG, or WebP photos, under 3 MB in total.'); return; }
      files.forEach(file => { const url = URL.createObjectURL(file); state.photoUrls.push(url); const img = document.createElement('img'); img.src = url; img.alt = 'Your design reference: ' + file.name; preview.appendChild(img); });
    }
  });

  root.addEventListener('submit', event => {
    const form = event.target; if (!form.matches('.n-inquiry-form')) return; event.preventDefault();
    const stage = form.closest('[data-variant]'), state = states.get(stage.dataset.key);
    if (!form.reportValidity()) return;
    const data = new FormData(form), get = name => String(data.get(name) || '').trim();
    if (!get('name') || !get('email')) { formError(form, 'Please add your name and email so Hailey can reach you.'); return; }
    if (get('contact_method') === 'Text message' && !get('phone') || get('contact_method') === 'Instagram' && !get('instagram')) { formError(form, 'Please add details for your preferred contact method.'); return; }
    const row = {
      Reference: `PREVIEW-${String(previewRows.length + 1).padStart(3, '0')}`,
      Name: get('name'), Email: get('email'), Phone: get('phone'), Instagram: get('instagram'), 'Contact via': get('contact_method'),
      Design: get('design'), Shape: get('shape'), Length: get('length'), Size: get('size'),
      'Left widths (mm)': get('size') === 'Custom measurements' ? ['thumb', 'index', 'middle', 'ring', 'pinky'].map(finger => get('left_' + finger)).join(', ') : '',
      'Right widths (mm)': get('size') === 'Custom measurements' ? ['thumb', 'index', 'middle', 'ring', 'pinky'].map(finger => get('right_' + finger)).join(', ') : '',
      Quantity: get('quantity'), Colors: get('colors'), Style: get('style'), Charms: get('charms'), 'Requested date': get('requested_date'), Notes: get('notes'),
      'Reference files': [...form.elements.namedItem('reference_photos').files].map(file => file.name).join(', '),
      Status: 'New inquiry', Submitted: new Date().toISOString(), 'Design direction': state.direction.name
    };
    previewRows.push(row); state.lastRow = row; updateReviewCounts(); go(state, 'success');
  });

  directions.forEach(direction => {
    const stage = root.querySelector(`[data-key="${direction.key}"]`); if (!stage) return;
    const pref = savedPreferences[direction.key] || {};
    const state = { direction, stage, site: null, main: null, view: 'home', filter: ['All designs', 'Minimal', 'Statement', 'Seasonal', 'Saved'].includes(pref.filter) ? pref.filter : 'All designs', expanded: !!pref.expanded, favorites: new Set((Array.isArray(pref.favorites) ? pref.favorites : []).filter(id => !!byId(id))), product: '', selection: freshSelection(), photoUrls: [] };
    states.set(direction.key, state); shell(state);
  });
  root.addEventListener('hailey:hero-photo', event => {
    const product = byId(event.detail?.id);
    if (!product) return;
    states.forEach(state => {
      state.direction.hero = product.id;
      const image = state.main.querySelector('.n-hero-photo > img');
      if (image) { image.src = product.image; image.alt = `${product.name} — actual handmade nail designs by Hailey`; }
    });
  });
  window.addEventListener('openai:set_globals', event => {
    const savedState = event.detail?.globals?.widgetState, prefs = savedState?.privateContent?.preferences || savedState?.preferences;
    if (!prefs) return;
    states.forEach((state, key) => {
      const value = prefs[key]; if (!value) return;
      const next = new Set((Array.isArray(value.favorites) ? value.favorites : []).filter(id => !!byId(id)));
      const validFilter = ['All designs', 'Minimal', 'Statement', 'Seasonal', 'Saved'].includes(value.filter) ? value.filter : 'All designs';
      const changed = [...next].sort().join() !== [...state.favorites].sort().join() || state.filter !== validFilter || state.expanded !== !!value.expanded;
      state.favorites = next; state.filter = validFilter; state.expanded = !!value.expanded;
      if (changed && ['home', 'catalog'].includes(state.view)) paint(state);
    });
  });
})();
