const LINKS = [
  { label: 'PAI Lab', href: 'https://pailab.io' },
  { label: 'Courses', href: 'https://courses.aaron.kr' },
  { label: 'CV / Contact', href: 'https://aaronsnowberger.com' },
  { label: 'Blog', href: 'https://notes.aaron.kr' },
  { label: 'Scientia', href: 'https://sci.aaron.kr/' },
  { label: 'KSPAI', href: 'https://kspai.org' },
]

export function SiteNav() {
  return (
    <div className="sitenav">
      <span className="snlabel">Sites</span>
      {LINKS.map((l) => (
        <a href={l.href} key={l.label} target="_blank" rel="noopener noreferrer">
          {l.label}
        </a>
      ))}
    </div>
  )
}
