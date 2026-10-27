import type { ProductCatalogUnit } from '../products/types'

export type StockStatus = 'IN_STOCK' | 'LOW' | 'OUT' | 'EXPIRED' | 'EXPIRING'

export type StockMovementType =
  | 'OPENING'
  | 'PURCHASE'
  | 'SALE'
  | 'RETURN'
  | 'ADJUSTMENT'
  | 'DAMAGE'
  | 'EXPIRY'

export type InventoryProduct = {
  id: string
  name: string
  code: string
  packSize: string
  packType: ProductCatalogUnit
  contentQuantity: number
  contentUnit: ProductCatalogUnit
  reorderLevel: number
  mrp: number
  availableQuantity: number
  category: {
    id: string
    name: string
    divisionId: string
    division: {
      id: string
      name: string
    }
  }
}

export type StockMovement = {
  id: string
  type: StockMovementType
  quantity: number
  note: string | null
  createdAt: string
}

export type InventoryBatch = {
  id: string
  productId: string
  batchNumber: string
  manufacturingDate: string
  expiryDate: string
  quantityOnHand: number
  purchaseRate: number
  status: StockStatus
  createdAt: string
  updatedAt: string
  product: InventoryProduct
  movements?: StockMovement[]
}

export type ListInventoryQuery = {
  page: number
  limit: number
  divisionId?: string
  categoryId?: string
  productId?: string
  search?: string
  status?: StockStatus
}

export type CreateStockMovementPayload = {
  productId: string
  batchNumber: string
  manufacturingDate?: string
  expiryDate?: string
  purchaseRate?: number
  type: StockMovementType
  quantity: number
  note?: string
}

export type UpdateInventoryPayload = {
  batchNumber?: string
  manufacturingDate?: string
  expiryDate?: string
  purchaseRate?: number
  note?: string
}
