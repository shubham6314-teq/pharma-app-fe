export type CatalogUnitStatus = 'ACTIVE' | 'INACTIVE'

export type CatalogUnit = {
  id: string
  name: string
  code: string
  singularLabel: string
  pluralLabel: string
  sortOrder: number
  status: CatalogUnitStatus
  createdAt: string
  updatedAt: string
}

export type ListCatalogUnitsQuery = {
  page: number
  limit: number
}

export type CreateCatalogUnitPayload = {
  name: string
  code: string
  singularLabel: string
  pluralLabel: string
  sortOrder?: number
}

export type UpdateCatalogUnitPayload = {
  name?: string
  code?: string
  singularLabel?: string
  pluralLabel?: string
  sortOrder?: number
  status?: CatalogUnitStatus
}
