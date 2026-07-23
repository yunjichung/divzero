# Archive: the horizon era

The complete pre-2026-07-23 site, preserved so the wave and line
animations can come back whenever they're wanted. These three files
(`index.html`, `styles.css`, `script.js`) are a working snapshot —
open `index.html` over a local server and the whole horizon world
runs.

## What lives here

- **The still-water line** (`script.js` → `stillWater()`): the 1px
  horizon at 50svh drawn as water. Touching it sends one damped
  ripple outward from the point of contact; the warm-above /
  cool-below glow bends and travels with the pulse; the ink drifts
  through mother-of-pearl color shifts too slow to watch. Pairs with
  the `.sky` / `.ground` gradients, `#water` canvas, and `.reach`
  hover strip in `styles.css`.

- **The genesis arrival** (`script.js`, top IIFE): the line is born
  from a single point (zero), extends past both frame edges
  (toward infinity), light blooms from it, the line breathes once,
  then THE SPRINGBOARD — the line bows and snaps, flinging the
  thesis up to stand on it and the answer down to hang from it.

- **The dawn variant** (`dawn-genesis.js`): a later, quieter
  arrival that was never committed — no drawing, no spring; light
  gathers and the line simply becomes visible where the worlds
  meet, the words revealed by luminance alone. Drop-in replacement
  for the genesis IIFE.

## Bringing it back

The pieces are interdependent: the canvases and wells in
`index.html`, their positioning/gradients in `styles.css` (search
"the landing"), and the two animation systems in `script.js`. The
cleanest restoration is to lift the whole `.land` section markup +
its CSS block + both IIFEs together, then re-point the current
site's landing at them. The horizon line's single source of truth
is the `.sky` element's height (50svh) — everything meets there.
