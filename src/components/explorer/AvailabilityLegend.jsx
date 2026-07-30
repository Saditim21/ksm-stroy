const ITEMS = [
  ['bg-emerald-500', 'Свободен'],
  ['bg-amber-500', 'Резервиран'],
  ['bg-red-500', 'Продаден'],
]

export default function AvailabilityLegend() {
  return (
    <div className="flex items-center gap-4 text-sm text-neutral-600">
      {ITEMS.map(([dot, label]) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
          {label}
        </span>
      ))}
    </div>
  )
}
