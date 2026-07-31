const VARIANTS = {
  gold: 'bg-gold-accent text-ink hover:bg-gold-deep',
  ghost: 'border border-concrete text-ink hover:border-ink',
  dark: 'bg-ink text-plaster hover:bg-black',
}

export default function Button({ as: Tag = 'button', variant = 'gold', className = '', children, ...rest }) {
  return (
    <Tag
      className={`inline-flex min-h-[44px] items-center justify-center px-7 py-3 text-sm font-semibold transition-colors duration-300 ease-luxe ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
