# Weather hero background images

Drop images here with these exact filenames — the sidebar's weather hero
picks one based on the forecast's condition + day/night, and falls back to a
plain gradient (no broken-image icon) for anything you haven't uploaded yet:

- `clear-day.jpg`
- `clear-night.jpg`
- `cloudy-day.jpg`
- `cloudy-night.jpg`
- `rain.jpg`
- `storm.jpg`
- `snow.jpg`
- `mist.jpg`
- `default.jpg` — used when the forecast is unavailable (no API key, no data
  for that day yet, etc.)

Any reasonably wide image works — the hero panel is short (~120px) and full
width, and crops with `object-fit: cover`, so a 1600×500-ish landscape shot is
a good target. Keep files reasonably small (a few hundred KB) since they load
client-side on every sidebar view.

This README is just documentation — it's fine to leave it here alongside your
images; nothing in the app reads it.
