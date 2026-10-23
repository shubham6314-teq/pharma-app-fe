import type { ProductFormValues } from './product-schema'
import type { ContentUnit, PackUnit } from './units'

export type { ProductFormValues }
export type { ContentUnit, PackUnit }

export type ProductStatus = 'ACTIVE' | 'INACTIVE'

export type ProductDivision = {
  id: string
  name: string
  code: string
}

export type ProductCategory = {
  id: string
  name: string
  code: string
  divisionId: string
  division: ProductDivision
}

export type Product = {
  id: string
  name: string
  code: string
  description: string | null
  imageUrl: string | null
  brandName: string
  composition: string
  packSize: string
  packUnit: PackUnit
  contentQuantity: number
  contentUnit: ContentUnit
  reorderLevel: number
  mrp: number
  discountPercent: number
  sellingPrice: number
  status: ProductStatus
  categoryId: string
  category: ProductCategory
  createdAt: string
  updatedAt: string
}

export type ListProductsQuery = {
  page: number
  limit: number
  categoryId?: string
  divisionId?: string
}

export type CreateProductPayload = {
  name: string
  code: string
  description?: string
  brandName: string
  composition: string
  packSize: string
  packUnit: PackUnit
  contentQuantity: number
  contentUnit: ContentUnit
  reorderLevel?: number
  mrp: number
  discountPercent?: number
  categoryId: string
  image?: File
}

export type UpdateProductPayload = {
  name?: string
  code?: string
  description?: string | null
  brandName?: string
  composition?: string
  packSize?: string
  packUnit?: PackUnit
  contentQuantity?: number
  contentUnit?: ContentUnit
  reorderLevel?: number
  mrp?: number
  discountPercent?: number
  status?: ProductStatus
  categoryId?: string
  image?: File
}
