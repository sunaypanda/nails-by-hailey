# Nails by Hailey — five interactive design directions

Open `index.html` in a browser to compare all five. The folder is also a standalone static website, so it can be previewed without Node or a build. Each design has its own HTML file.

| Direction | Feel | File |
| --- | --- | --- |
| Blush Atelier | Romantic, refined boutique | `blush-atelier.html` |
| Cherry Club | Bold, playful, graphic | `cherry-club.html` |
| Blue Hour | Airy, calm, powder blue | `blue-hour.html` |
| The Nail Edit | Minimal fashion editorial | `the-nail-edit.html` |
| Hailey’s Scrapbook | Handwritten, tactile, lilac and sage | `haileys-scrapbook.html` |

## What you can try

- Switch between five substantially different layouts.
- Browse all 17 actual photos from `../pics`, filter designs, and save favorites.
- Open a design, zoom its photo, and choose size, shape, and length preferences.
- Open “Contact to purchase” or the custom-design form. Preferences carry over.
- Enter individual measurements for both hands and preview reference photos.
- Submit **sample details** and inspect the resulting demo Excel row.
- In the standalone versions, download demo rows as an Excel-compatible CSV.
- Use sizing help, FAQ, about, contact, mobile navigation, and Instagram links.

These are design previews. Inquiry rows live only in browser memory, are not sent anywhere, and disappear when the page reloads. Favorites persist only when supported by the in-conversation preview host. No payment, database, spreadsheet, or email account is connected. There are no fabricated customers, testimonials, prices, stock levels, or sizing measurements. Catalog names are descriptive preview labels for Hailey to approve.

## After a design is chosen

The intended final site is a simple static catalog on Netlify. A customer sends an inquiry, a Netlify Function validates it, and a protected server-side integration appends a row to Hailey’s Excel table. A Microsoft Power Automate flow with an Excel Online “Add a row into a table” action is one possible integration; it depends on the workbook being in OneDrive for Business or SharePoint and the available Microsoft plan. The flow URL/credentials must stay in Netlify environment variables, never browser code. Confirm workbook location and supported integration before implementation.

Suggested columns: reference, submitted time, name, email, phone, Instagram, preferred contact method, design, shape, length, size, left/right measurements, quantity, colors, style, charms, requested date, notes, reference-photo links, and inquiry status. Images need approved private file storage; the sheet should hold links, not embedded upload data. Add spam protection, server-side validation, duplicate protection, and error handling when connecting the live form. A customer must receive success only after the real row is saved.

The earlier Next.js storefront in the parent folder is superseded by this design-review stage. Do **not** deploy it: it contains the earlier, unwanted payment/database approach. Once a design is selected, replace it with the simplified catalog implementation.

## Deployment note

Do not use the parent folder’s existing Next.js Netlify configuration for these previews. To share only these static previews, deploy **this `designs` folder**, with no build command, as the publish directory. These previews are marked `noindex` and visibly label submissions as demonstrations. Do not collect real customer inquiries until the actual Excel connection is implemented.

Authoring only: `node designs/build-previews.mjs` regenerates local pages and the in-conversation preview using the original images. This is not a deployment command or a test suite. It requires the existing local `sharp` dependency.
