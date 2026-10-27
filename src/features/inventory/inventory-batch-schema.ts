import { z } from 'zod'
import type { InventoryBatch, UpdateInventoryPayload } from './types'

const dateOnly = /^\d{4}-\d{2}-\d{2}$/
const money = /^\d+(\.\d{1,2})?$/

export const inventoryBatchSchema = z
  .object({
    batchNumber: z
      .string()
      .trim()
      .min(1, 'Batch number is required')
      .max(50, 'Batch number must be at most 50 characters'),
    manufacturingDate: z.string(),
    expiryDate: z.string(),
    purchaseRate: z.string().trim(),
    note: z.string().trim().max(500, 'Note must be at most 500 characters'),
  })
  .superRefine((value, ctx) => {
    if (!dateOnly.test(value.manufacturingDate)) {
      ctx.addIssue({
        code: 'custom',
        path: ['manufacturingDate'],
        message: 'Manufacturing date is required',
      })
    }

    if (!dateOnly.test(value.expiryDate)) {
      ctx.addIssue({
        code: 'custom',
        path: ['expiryDate'],
        message: 'Expiry date is required',
      })
    }

    if (
      dateOnly.test(value.manufacturingDate) &&
      dateOnly.test(value.expiryDate) &&
      value.expiryDate < value.manufacturingDate
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['expiryDate'],
        message: 'Expiry date must be on or after the manufacturing date',
      })
    }

    if (!money.test(value.purchaseRate) || Number(value.purchaseRate) > 99999999.99) {
      ctx.addIssue({
        code: 'custom',
        path: ['purchaseRate'],
        message: 'Enter a purchase rate with up to 2 decimal places',
      })
    }
  })

export type InventoryBatchFormValues = z.infer<typeof inventoryBatchSchema>

export function toDateInputValue(value: string): string {
  return value.slice(0, 10)
}

export function valuesFromInventoryBatch(
  batch: InventoryBatch,
): InventoryBatchFormValues {
  return {
    batchNumber: batch.batchNumber,
    manufacturingDate: toDateInputValue(batch.manufacturingDate),
    expiryDate: toDateInputValue(batch.expiryDate),
    purchaseRate: String(batch.purchaseRate),
    note: '',
  }
}

export function toUpdateInventoryPayload(
  values: InventoryBatchFormValues,
  original: InventoryBatch,
): UpdateInventoryPayload {
  const payload: UpdateInventoryPayload = {}
  const batchNumber = values.batchNumber.trim()
  const purchaseRate = Number(values.purchaseRate)
  const note = values.note.trim()

  if (batchNumber !== original.batchNumber.trim()) {
    payload.batchNumber = batchNumber
  }

  if (values.manufacturingDate !== toDateInputValue(original.manufacturingDate)) {
    payload.manufacturingDate = values.manufacturingDate
  }

  if (values.expiryDate !== toDateInputValue(original.expiryDate)) {
    payload.expiryDate = values.expiryDate
  }

  if (
    Number.isFinite(purchaseRate) &&
    Math.round(purchaseRate * 100) !== Math.round(original.purchaseRate * 100)
  ) {
    payload.purchaseRate = purchaseRate
  }

  if (note) {
    payload.note = note
  }

  return payload
}

export function hasInventoryBatchFieldChange(payload: UpdateInventoryPayload): boolean {
  return (
    payload.batchNumber !== undefined ||
    payload.manufacturingDate !== undefined ||
    payload.expiryDate !== undefined ||
    payload.purchaseRate !== undefined
  )
}
