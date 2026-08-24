'use client'

import { useEffect } from 'react'
import { polyfillCountryFlagEmojis } from 'country-flag-emoji-polyfill'

/**
 * Windows Chromium/Edge can render emoji generally but not flag emoji (shows
 * "US" as plain letters instead of 🇺🇸). This detects that specific gap and,
 * only when present, injects an @font-face scoped to flag codepoints via
 * unicode-range — see .flag-emoji in globals.css for where it's applied.
 * Self-hosted font (public/fonts/) instead of the package's default jsDelivr
 * URL, so there's no third-party request.
 */
export function CountryFlagPolyfill() {
  useEffect(() => {
    polyfillCountryFlagEmojis('Twemoji Country Flags', '/fonts/TwemojiCountryFlags.woff2')
  }, [])
  return null
}
