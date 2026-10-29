import type { PaginatedResponse } from '../../lib/pagination'

export type InventoryAlertStatus =
  | 'OPEN'
  | 'ANALYZING'
  | 'READY'
  | 'FAILED'
  | 'DISMISSED'
  | 'RESOLVED'

export type RecommendationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type InventoryAlertAnalysis = {
  id: string
  explanation: string
  recommendedQuantity: number | null
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
  kind: 'LOW_STOCK'
  availableQuantity: number
  reorderLevel: number
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
}

export type ListInventoryAlertsQuery = {
  page?: number
  limit?: number
  active?: boolean
  status?: InventoryAlertStatus
}

export type InventoryAlertList = PaginatedResponse<InventoryAlert>

export type InventoryAlertEvent = {
  alertId: string
  productId: string
}
