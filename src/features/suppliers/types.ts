export type SupplierStatus = 'ACTIVE' | 'INACTIVE'

export type Supplier = {
  id: string
  name: string
  code: string
  contactName: string | null
  email: string | null
  phone: string | null
  notes: string | null
  status: SupplierStatus
  createdAt: string
  updatedAt: string
}

export type ListSuppliersQuery = {
  page: number
  limit: number
}

export type CreateSupplierPayload = {
  name: string
  code: string
  contactName?: string
  email?: string
  phone?: string
  notes?: string
}

export type UpdateSupplierPayload = {
  name?: string
  code?: string
  contactName?: string
  email?: string
  phone?: string
  notes?: string
  status?: SupplierStatus
}
