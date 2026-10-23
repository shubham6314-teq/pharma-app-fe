import type { StockMovementType, StockStatus } from './types'

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  IN_STOCK: 'In stock',
  LOW: 'Low stock',
  OUT: 'Out of stock',
  EXPIRING: 'Expiring',
  EXPIRED: 'Expired',
}

export const MOVEMENT_TYPE_LABELS: Record<StockMovementType, string> = {
  OPENING: 'Opening stock',
  PURCHASE: 'Purchase',
  SALE: 'Sale',
  RETURN: 'Return',
  ADJUSTMENT: 'Adjustment',
  DAMAGE: 'Damage',
  EXPIRY: 'Expiry write-off',
}

export function formatIsoDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) {
    return value
  }

  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(
    new Date(year, month - 1, day),
  )
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}
