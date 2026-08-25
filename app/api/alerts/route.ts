import { NextRequest, NextResponse } from 'next/server'

// Google Alerts delivers its "RSS feed" option as an Atom feed
// (<entry>/<link href="…"/>), not classic RSS <item>/<link>text</link> — this
// parser handles both shapes with plain regexes rather than pulling in an XML
// dependency for something this small.

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

function extractTag(block: string, tag: string): string | null {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  if (!m) return null
  return decodeEntities(
    m[1]
      .replace(/^\s*<!\[CDATA\[/, '')
      .replace(/\]\]>\s*$/, '')
      .replace(/<[^>]+>/g, '')
  ).trim()
}

export async function GET(req: NextRequest) {
  const feed = req.nextUrl.searchParams.get('feed')
  if (!feed) return NextResponse.json({ items: [], error: 'feed is required' }, { status: 400 })

  let url: URL
  try {
    url = new URL(feed)
  } catch {
    return NextResponse.json({ items: [], error: 'invalid feed URL' }, { status: 400 })
  }
  // Only proxy Google's own alert-feed host — this endpoint takes a URL from
  // a query string, so keep it from being used as an open fetch relay.
  if (!/(^|\.)google\.com$/.test(url.hostname)) {
    return NextResponse.json({ items: [], error: 'only google.com alert feeds are supported' }, { status: 400 })
  }

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 1800 },
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; life.aaron.kr dashboard)' },
    })
    if (!res.ok) throw new Error(`feed ${res.status}`)
    const xml = await res.text()

    const blocks = xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? xml.match(/<item[\s\S]*?<\/item>/gi) ?? []
    const items = blocks.slice(0, 10).map((block) => {
      const title = extractTag(block, 'title')
      let link = extractTag(block, 'link')
      if (!link) {
        const hrefMatch = block.match(/<link[^>]*href="([^"]+)"/i)
        link = hrefMatch ? decodeEntities(hrefMatch[1]) : null
      }
      const pubDate = extractTag(block, 'published') ?? extractTag(block, 'pubDate')
      return { title, link, pubDate }
    })
    const valid = items.filter((it): it is { title: string; link: string; pubDate: string | null } =>
      Boolean(it.title && it.link)
    )

    return NextResponse.json({ items: valid })
  } catch {
    return NextResponse.json({ items: [], error: true })
  }
}
