export type OverviewSummary = {
  openLowStockAlerts: number
  openExpiryAlerts: number
  failedAnalyses: number
  draftPurchaseOrders: number
  confirmedPurchaseOrders: number
  batchesExpiringSoon: number
  expiringSoonDays: number
}

export type OverviewItem = {
  id: string
  title: string
  detail: string
  area: string
  to: string
}
