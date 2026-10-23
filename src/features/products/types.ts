import type { CatalogUnit } from '../catalog-units/types'
import type { ProductFormValues } from './product-schema'

export type { ProductFormValues }
export type { CatalogUnit }

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

export type ProductCatalogUnit = Pick<
  CatalogUnit,
  'id' | 'name' | 'code' | 'singularLabel' | 'pluralLabel'
>

export type Product = {
  id: string
  name: string
  code: string
  description: string | null
  imageUrl: string | null
  brandName: string
  composition: string
  packSize: string
  packTypeId: string
  packType: ProductCatalogUnit
  contentQuantity: number
  contentUnitId: string
  contentUnit: ProductCatalogUnit
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
  packTypeId: string
  contentQuantity: number
  contentUnitId: string
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
  packTypeId?: string
  contentQuantity?: number
  contentUnitId?: string
  reorderLevel?: number
  mrp?: number
  discountPercent?: number
  status?: ProductStatus
  categoryId?: string
  image?: File
}
