# Load Planner V2.4

Replace the current live planner files with:
- index.html
- styles-v2-4.css
- app-v2-4.js

Changes:
- Default planning length is now 13,200 mm.
- Default usable width is now 2,400 mm for every supplied trailer profile.
- Users may manually increase either dimension when confirmed.
- Two-dimensional side-by-side packing and item-level rotation remain included.
- Form data now autosaves to browser localStorage on the current device.
- No database or server storage is used.
- Generated plans are recalculated in memory and are not permanently saved.

Privacy/storage note: localStorage remains in that browser profile until Reset is selected, site data is cleared, private browsing ends, or browser settings remove it. It does not sync to the CRM database.
