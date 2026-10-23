import type { CreateProductPayload, UpdateProductPayload } from './types'

export function toProductFormData(
  payload: CreateProductPayload | UpdateProductPayload,
): FormData {
  const form = new FormData()

  if (payload.name !== undefined) {
    form.append('name', payload.name)
  }

  if (payload.code !== undefined) {
    form.append('code', payload.code)
  }

  if (typeof payload.description === 'string') {
    form.append('description', payload.description)
  }

  if (payload.brandName !== undefined) {
    form.append('brandName', payload.brandName)
  }

  if (payload.composition !== undefined) {
    form.append('composition', payload.composition)
  }

  if (payload.packSize !== undefined) {
    form.append('packSize', payload.packSize)
  }

  if (payload.packUnit !== undefined) {
    form.append('packUnit', payload.packUnit)
  }

  if (payload.contentQuantity !== undefined) {
    form.append('contentQuantity', String(payload.contentQuantity))
  }

  if (payload.contentUnit !== undefined) {
    form.append('contentUnit', payload.contentUnit)
  }

  if (payload.reorderLevel !== undefined) {
    form.append('reorderLevel', String(payload.reorderLevel))
  }

  if (payload.mrp !== undefined) {
    form.append('mrp', String(payload.mrp))
  }

  if (payload.discountPercent !== undefined) {
    form.append('discountPercent', String(payload.discountPercent))
  }

  if (payload.categoryId !== undefined) {
    form.append('categoryId', payload.categoryId)
  }

  if ('status' in payload && payload.status !== undefined) {
    form.append('status', payload.status)
  }

  if (payload.image) {
    form.append('image', payload.image)
  }

  return form
}
