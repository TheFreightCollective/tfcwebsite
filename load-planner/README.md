# The Freight Collective Multi-Trailer Load Planner

## Install
Replace the current load-planner folder contents with:
- index.html
- styles.css
- app.js

Keep all three files together. The page loads Konva 10.7.1 from jsDelivr.

## Essential release features
- Select multiple permitted trailer types with tick boxes
- Edit length, width, height, payload and maximum available quantity per type
- Allow or prevent mixed equipment
- Multi-trailer automatic planning, favouring complete placement, then fewer trailers, then better utilisation
- 90-degree floor rotation and side-by-side shelf packing
- Basic identical-item stacking with height checks
- Separate diagram for each trailer
- Unplaced freight reasons
- Print / Save PDF export for the complete plan
- CSV import/export

## Important model limits
- Mezzanine and drop-deck types are rectangular approximations in this release.
- The optimiser is a practical heuristic, not a mathematical proof of the global optimum.
- No axle-group, centre-of-gravity, load restraint, legal dimension, deck obstruction or loading-sequence calculation is included.
- Confirm every plan with the carrier and actual equipment.

## Quick test
1. Open the page while online.
2. Click Load sample.
3. Confirm multiple trailer diagrams appear if required.
4. Untick a trailer and regenerate to verify it is excluded.
5. Change Maximum available and regenerate.
6. Test Allow mixed trailer types on and off.
7. Print and select Save as PDF.
