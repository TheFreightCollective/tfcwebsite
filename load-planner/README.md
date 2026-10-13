# The Freight Collective Load Planner

A static public load-planning tool built with HTML, CSS, JavaScript and Konva.js.

## Files
- `index.html` - public page
- `styles.css` - responsive styling
- `app.js` - trailer, freight, auto-placement, stacking, drag/drop and export logic

## Publish as a subpage
Upload all three files to the same public folder, for example:

`/load-planner/index.html`
`/load-planner/styles.css`
`/load-planner/app.js`

The public address will normally become `https://your-domain.com/load-planner/`.

## What is included
- Editable semi, mezzanine, flat top, 40 ft container and custom profiles
- Freight line entry and CSV import/export
- Automatic top-view placement with rotation
- Basic identical-item stacking allowance
- Drag-and-drop manual adjustment and double-click rotation
- Floor, payload and cube indicators
- PNG export and browser Print / Save PDF
- Responsive public layout

## Important limitations
This version is a planning aid. It does not calculate axle-group mass, centre of gravity, legal dimensions, load restraint, deck obstructions, wheel arches, mezzanine geometry, loading order or carrier-specific requirements. Trailer dimensions are editable because actual equipment varies.

## Konva dependency
The page currently loads Konva 10.7.1 from jsDelivr. If your site has a Content Security Policy, allow `https://cdn.jsdelivr.net` for scripts or download `konva.min.js` into this folder and change the script path in `index.html`.

## Quick check before publishing
1. Open `index.html` in a browser while online.
2. Click **Load sample**, then **Generate plan**.
3. Drag a crate and double-click it to rotate.
4. Test **Export PNG** and **Print / Save PDF**.
5. Replace wording or colours if required, then upload the folder.
