// Playfair display heading; <em> children become the gold italic accent word.
const SIZES = {
  hero: 'text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05]',
  section: 'text-3xl sm:text-4xl lg:text-5xl leading-[1.12]',
  sub: 'text-2xl sm:text-3xl leading-[1.15]',
}

export default function DisplayHeading({ as: Tag = 'h2', size = 'section', className = '', children }) {
  return (
    <Tag className={`font-display font-medium [&_em]:font-normal [&_em]:italic [&_em]:text-gold-accent ${SIZES[size]} ${className}`}>
      {children}
    </Tag>
  )
}
