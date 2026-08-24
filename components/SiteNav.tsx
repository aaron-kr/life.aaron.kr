const LINKS = [
  { label: 'PAI Lab', href: 'https://pailab.io' },
  { label: 'Courses', href: 'https://courses.aaron.kr' },
  { label: 'CV / Contact', href: 'https://aaron.kr' },
  { label: 'Blog', href: 'https://aaronsnowberger.com' },
  { label: 'KSPAI', href: 'https://kspai.org' },
  { label: 'SERVO', href: 'https://servo.aaron.kr' },
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
