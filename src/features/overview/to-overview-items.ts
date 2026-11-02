import type { OverviewItem, OverviewSummary } from './types'

function countLabel(count: number, singular: string, plural: string): string {
  if (count === 1) {
    return `1 ${singular}`
  }

  return `${count} ${plural}`
}

export function toOverviewItems(summary: OverviewSummary): OverviewItem[] {
  return [
    {
      id: 'low-stock',
      title: 'Low stock',
      detail:
        summary.openLowStockAlerts === 0
          ? 'No open low-stock alerts'
          : `${countLabel(summary.openLowStockAlerts, 'product is', 'products are')} below reorder level`,
      area: 'Alerts',
      to: '/inventory-alerts',
    },
    {
      id: 'expiry',
      title: 'Near expiry',
      detail:
        summary.openExpiryAlerts === 0
          ? 'No open near-expiry alerts'
          : `${countLabel(summary.openExpiryAlerts, 'batch needs', 'batches need')} review`,
      area: 'Alerts',
      to: '/inventory-alerts',
    },
    {
      id: 'failed',
      title: 'Failed analyses',
      detail:
        summary.failedAnalyses === 0
          ? 'No failed investigations'
          : `${countLabel(summary.failedAnalyses, 'alert needs', 'alerts need')} another look`,
      area: 'Alerts',
      to: '/inventory-alerts',
    },
    {
      id: 'draft-pos',
      title: 'Draft purchase orders',
      detail:
        summary.draftPurchaseOrders === 0
          ? 'No drafts waiting'
          : `${countLabel(summary.draftPurchaseOrders, 'draft needs', 'drafts need')} a supplier or confirm`,
      area: 'Orders',
      to: '/orders',
    },
    {
      id: 'confirmed-pos',
      title: 'Confirmed orders',
      detail:
        summary.confirmedPurchaseOrders === 0
          ? 'No orders waiting on goods-in'
          : `${countLabel(summary.confirmedPurchaseOrders, 'order is', 'orders are')} confirmed — record a purchase when goods arrive`,
      area: 'Orders',
      to: '/orders',
    },
    {
      id: 'expiring-soon',
      title: `Expiring in ${summary.expiringSoonDays} days`,
      detail:
        summary.batchesExpiringSoon === 0
          ? `No batches expire within ${summary.expiringSoonDays} days`
          : `${countLabel(summary.batchesExpiringSoon, 'batch expires', 'batches expire')} within ${summary.expiringSoonDays} days`,
      area: 'Inventory',
      to: '/inventory',
    },
  ]
}
