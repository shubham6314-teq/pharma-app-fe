import { Link } from 'react-router-dom'
import { useGetInventoryAlertsQuery } from '../api'

export function AlertBell({ tone = 'onLight' }: { tone?: 'onLight' | 'onDark' }) {
  const { data } = useGetInventoryAlertsQuery({ page: 1, limit: 1, active: true })
  const count = data?.meta.total ?? 0
  const label = count === 1 ? '1 open inventory alert' : `${count} open inventory alerts`
  const color =
    tone === 'onDark'
      ? 'text-white hover:bg-white/10'
      : 'text-slate-800 hover:bg-slate-200/70'

  return (
    <Link
      to="/inventory-alerts"
      aria-label={label}
      title={label}
      className={`relative flex h-10 w-10 items-center justify-center rounded-xl ${color}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M10 19a2 2 0 0 0 4 0"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      {count > 0 ? (
        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white">
          {count > 9 ? '9+' : count}
        </span>
      ) : null}
    </Link>
  )
}
