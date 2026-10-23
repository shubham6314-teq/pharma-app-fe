import type { CategoryFormValues } from './category-schema'

export type { CategoryFormValues }

export type CategoryStatus = 'ACTIVE' | 'INACTIVE'

export type CategoryDivision = {
  id: string
  name: string
  code: string
}

export type Category = {
  id: string
  name: string
  code: string
  description: string | null
  imageUrl: string | null
  status: CategoryStatus
  divisionId: string
  division: CategoryDivision
  createdAt: string
  updatedAt: string
}

export type ListCategoriesQuery = {
  page: number
  limit: number
  divisionId?: string
}

export type CreateCategoryPayload = {
  name: string
  code: string
  description?: string
  divisionId: string
  image?: File
}

export type UpdateCategoryPayload = {
  name?: string
  code?: string
  description?: string | null
  status?: CategoryStatus
  divisionId?: string
  image?: File
}
