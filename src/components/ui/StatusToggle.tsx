export type ResourceStatus = 'ACTIVE' | 'INACTIVE'

type StatusToggleProps = {
  status: ResourceStatus
  disabled?: boolean
  ariaLabel: string
  onToggle: () => void
}

export function nextResourceStatus(status: ResourceStatus): ResourceStatus {
  return status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
}

export function StatusToggle({
  status,
  disabled = false,
  ariaLabel,
  onToggle,
}: StatusToggleProps) {
  const active = status === 'ACTIVE'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={ariaLabel}
      title={active ? 'Active' : 'Inactive'}
      disabled={disabled}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-60 ${
        active ? 'bg-teal-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition ${
          active ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
