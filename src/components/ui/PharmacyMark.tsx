type PharmacyMarkProps = {
  tone?: 'onDark' | 'onLight'
}

export function PharmacyMark({ tone = 'onDark' }: PharmacyMarkProps) {
  if (tone === 'onLight') {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0b3d3a] text-teal-100">
        <PharmacyCross className="h-6 w-6" />
      </div>
    )
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/20">
      <PharmacyCross className="h-7 w-7 text-teal-100" />
    </div>
  )
}

function PharmacyCross({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="13" y="4" width="6" height="24" rx="1.5" fill="currentColor" />
      <rect x="4" y="13" width="24" height="6" rx="1.5" fill="currentColor" />
    </svg>
  )
}
