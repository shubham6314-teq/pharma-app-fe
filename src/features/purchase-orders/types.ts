import type { PaginatedResponse } from '../../lib/pagination'

export type PurchaseOrderStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED'

export type PurchaseOrder = {
  id: string
  number: string
  supplierId: string | null
  alertId: string | null
  status: PurchaseOrderStatus
  confirmedAt: string | null
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
  supplier: {
    id: string
    name: string
    code: string
    email: string | null
  } | null
  alert: {
    id: string
    kind: string
    productId: string
  } | null
  lines: Array<{
    id: string
    productId: string
    quantity: number
    product: {
      id: string
      name: string
      code: string
      packSize: string
    }
  }>
  createdBy: {
    id: string
    name: string
    email: string
  }
}

export type ListPurchaseOrdersQuery = {
  page?: number
  limit?: number
  status?: PurchaseOrderStatus
}

export type PurchaseOrderList = PaginatedResponse<PurchaseOrder>
