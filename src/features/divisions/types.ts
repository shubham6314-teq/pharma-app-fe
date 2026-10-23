import type { DivisionFormValues } from './division-schema'

export type { DivisionFormValues }

export type DivisionStatus = 'ACTIVE' | 'INACTIVE'

export type Division = {
  id: string
  name: string
  code: string
  description: string | null
  imageUrl: string | null
  status: DivisionStatus
  createdAt: string
  updatedAt: string
}

export type ListDivisionsQuery = {
  page: number
  limit: number
}

export type CreateDivisionPayload = {
  name: string
  code: string
  description?: string
  image?: File
}

export type UpdateDivisionPayload = {
  name?: string
  code?: string
  description?: string | null
  status?: DivisionStatus
  image?: File
}
