# Top-band background image

Drop a single image here named exactly `banner.jpg` and it becomes the faint
background behind the Sites nav / header / quote banner band at the top of
the page (a Grand Tetons shot, Yellowstone, a flag — whatever keeps the North
Star goals in view). No code change needed — it's referenced directly by
`.hero-band-bg` in `app/globals.css`.

- Rendered at low opacity (`.32`) with a dark gradient fade into the page
  background underneath, so text stays readable regardless of image content.
- A wide landscape image works best — the band is full-width but not very
  tall (roughly header + nav + quote banner's combined height).
- Nothing shows (just the plain dark background) until you add this file —
  no broken-image icon, safe to leave empty.

If you want more than one image (e.g. rotate through a few), say so and this
can be upgraded to pick randomly or by day — for now it's a single static
file, kept simple.
