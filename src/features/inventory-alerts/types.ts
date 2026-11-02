import type { PaginatedResponse } from '../../lib/pagination'

export type InventoryAlertStatus =
  | 'OPEN'
  | 'ANALYZING'
  | 'READY'
  | 'FAILED'
  | 'DISMISSED'
  | 'RESOLVED'

export type InventoryAlertKind = 'LOW_STOCK' | 'EXPIRY'

export type ExpiryAction = 'USE_FIRST' | 'DO_NOT_DISPENSE' | 'RETURN_TO_SUPPLIER'

export type RecommendationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type InventoryAlertAnalysis = {
  id: string
  explanation: string
  recommendedQuantity: number | null
  recommendedAction: ExpiryAction | null
  calculationExplanation: string
  missingInformation: string[]
  citedChunkIds: string[]
  recommendationStatus: RecommendationStatus
  decidedQuantity: number | null
  decidedAt: string | null
  model: string
  evidence: {
    observations?: {
      searchKnowledge?: {
        chunks?: Array<{
          id: string
          title: string
          kind: string
          content: string
        }>
      }
    }
  } | null
  createdAt: string
}

export type InventoryAlert = {
  id: string
  productId: string
  kind: InventoryAlertKind
  availableQuantity: number
  reorderLevel: number
  inventoryBatchId: string | null
  batchNumber: string | null
  expiryDate: string | null
  status: InventoryAlertStatus
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
  product: {
    id: string
    name: string
    code: string
    packSize: string
    reorderLevel: number
    category: {
      id: string
      name: string
      division: {
        id: string
        name: string
      }
    }
  }
  analysis: InventoryAlertAnalysis | null
  purchaseOrder: {
    id: string
    number: string
    status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED'
    supplierId: string | null
    supplier: {
      id: string
      name: string
      code: string
    } | null
  } | null
}

export type ListInventoryAlertsQuery = {
  page?: number
  limit?: number
  active?: boolean
  status?: InventoryAlertStatus
  kind?: InventoryAlertKind
}

export type InventoryAlertList = PaginatedResponse<InventoryAlert>

export type InventoryAlertEvent = {
  alertId: string
  productId: string
}
