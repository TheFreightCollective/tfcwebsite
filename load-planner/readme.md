# The Freight Collective Load Planner V2.8

Replace the live `index.html` only.

## Included
- The page title and header use only **The Freight Collective Load Planner**. The word "free" does not appear.
- User-managed Trailer Library: add, edit, select and remove trailer types.
- Trailer Library import/export CSV.
- Freight import/export CSV (header-aware, BOM-safe).
- Automatic stacking, Top Load Only, rotation, unplaced freight reporting and multi-trailer planning.
- Trailer library, freight inputs and the current load plan autosave in browser localStorage.

## New in V2.8
- Overlap detection: live red outline while dragging, overlapping drops are cancelled, per-trailer "No overlaps" / issue badge.
- Manual layout positions saved automatically (survive reload). Generate Best Load Plan asks before replacing them.
- Drag a stack onto another trailer to move it (checks floor size, height and payload, finds nearest free spot).
- Double-click rotation now rotates in place and checks fit/overlap (previously it re-ran the whole plan).
- Better stacking: top-only items cap stacks and never carry load, every item's Max limits the whole stack, lighter-on-heavier preference, headroom reserved for top-only caps, smaller trailer chosen when everything fits.
- Fixes: duplicate Ref lines no longer collide, trailer drawn at true scale, input validation, XSS-safe trailer names, re-importing the same CSV works.
- Snap to edges option when dragging.

## Freight CSV columns
ref, qty, length_mm, width_mm, height_mm, weight_kg, rotatable, stackable, top_load_only, max_stack

## Trailer CSV columns
name, length_mm, width_mm, height_mm, payload_kg, maximum_available, selected
