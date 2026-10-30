# Nails by Hailey

The selected Blush Atelier website has an arched hero photo, a 17-design catalog, individual design views, custom inquiry forms, pricing, sizing help, and an About page. Photos and branding come from `pics/`.

## Local website

Run `npm run dev`, then open **http://localhost:3000**. This generates and serves the selected website with separate image, CSS, and JavaScript assets. Stop the server with Ctrl+C. After editing sources, restart it to regenerate the site.

Edit `designs/site.js` for content and interactions, `designs/site.css` for styling, and `designs/catalog.json` for design names and descriptions. Catalog rotation values are applied when generating assets without modifying the original photos.

## Netlify

Use `npm run build` as the build command and `dist` as the publish directory, as configured in `netlify.toml`. This generates a static website; no payment or database service is needed. The earlier Next.js application in `app/`, `components/`, and `lib/` is superseded and is not served by these commands.

The generator also updates `nails-by-hailey.html` and `index.html` as self-contained copies you can open directly in Chrome. Earlier five-design prototypes remain in `designs/`.

## Price previews

Product pages and request forms estimate prices from the supplied flyer after a design type is selected: $10 solid, $13 French, $15 simple art, $20 detailed art, or luxury starting at $28. Extra-long length, custom shapes, and 3+ charms each add $2 per set; 1–2 charms are free. Size has no listed surcharge and Long has no listed surcharge. Quantity multiplies the per-set estimate. Hailey confirms the design tier and final quote; product-specific price tiers have not been assigned. The estimate is included in demo inquiry rows.

Sizing uses XS, S, M, L, or Help Me / Custom, with optional measurements on request forms.

## Inquiries

Forms currently create demo rows in the open browser tab and can export a spreadsheet-compatible CSV. They do not send messages or write to Google Sheets. No payments are collected.

For the later Google Sheets connection, provide the sheet URL and decide who should have access. A server-side Netlify function can validate an inquiry and append a row using a Google service account shared on that sheet. Credentials belong in Netlify environment variables, never browser code. Reference-photo storage and spam protection also need to be connected before launch. Both custom requests and catalog inquiries should use the same submission endpoint.
