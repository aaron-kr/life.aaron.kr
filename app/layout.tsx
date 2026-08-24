import type { Metadata } from 'next'
import Script from 'next/script'
import { AuthProvider } from '@/lib/auth-context'
import { CountryFlagPolyfill } from '@/components/CountryFlagPolyfill'
import './globals.css'

export const metadata: Metadata = {
  title: 'Compass — Personal Dashboard',
  description: "Aaron's personal dashboard: schedule, weather, checklists, habits, and body stats.",
}

// Runs before first paint so the waves canvas doesn't flash on if the user
// previously turned it off (mirrors courses.aaron.kr's default.html).
const WAVES_INIT_SCRIPT = `
(function () {
  try {
    if (localStorage.getItem('waves') === 'off') {
      document.documentElement.classList.add('waves-off');
    }
  } catch (e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Sans+KR:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: WAVES_INIT_SCRIPT }} />
      </head>
      <body>
        <CountryFlagPolyfill />
        <AuthProvider>
          <div data-waves className="waves-root">
            {children}
          </div>
        </AuthProvider>
        <Script src="/js/waves.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
