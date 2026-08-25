import Image from 'next/image'

/** Renders inside a `.mark` box (sized by its context — `.brand .mark` in the
 * header, `.auth-card .mark` on the sign-in screens). Swaps the 🧭 emoji for
 * an image once _data/branding.yml's logo_url is set — see that file. */
export function BrandMark({ logoUrl }: { logoUrl?: string }) {
  if (logoUrl) {
    return (
      <div className="mark">
        <Image src={logoUrl} alt="Logo" fill unoptimized style={{ objectFit: 'contain' }} />
      </div>
    )
  }
  return <div className="mark">🧭</div>
}
