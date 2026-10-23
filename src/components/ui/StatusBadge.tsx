type StatusBadgeProps = {
  status: 'ACTIVE' | 'INACTIVE'
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const active = status === 'ACTIVE'

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        active ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}
