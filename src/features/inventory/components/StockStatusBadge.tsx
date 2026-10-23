import { STOCK_STATUS_LABELS } from '../labels'
import type { StockStatus } from '../types'

const STATUS_CLASS: Record<StockStatus, string> = {
  IN_STOCK: 'bg-teal-50 text-teal-800',
  LOW: 'bg-amber-50 text-amber-800',
  OUT: 'bg-slate-100 text-slate-600',
  EXPIRING: 'bg-orange-50 text-orange-800',
  EXPIRED: 'bg-red-50 text-red-700',
}

export function StockStatusBadge({ status }: { status: StockStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[status]}`}
    >
      {STOCK_STATUS_LABELS[status]}
    </span>
  )
}
