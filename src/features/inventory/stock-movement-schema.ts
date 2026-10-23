import { z } from 'zod'

export const NEW_BATCH_MOVEMENT_TYPES = ['OPENING', 'PURCHASE'] as const

export const EXISTING_BATCH_MOVEMENT_TYPES = [
  'PURCHASE',
  'SALE',
  'RETURN',
  'ADJUSTMENT',
  'DAMAGE',
  'EXPIRY',
] as const

const movementTypes = [
  'OPENING',
  'PURCHASE',
  'SALE',
  'RETURN',
  'ADJUSTMENT',
  'DAMAGE',
  'EXPIRY',
] as const

const dateOnly = /^\d{4}-\d{2}-\d{2}$/
const money = /^\d+(\.\d{1,2})?$/

export const stockMovementSchema = z
  .object({
    divisionId: z.string().trim().min(1, 'Select a division'),
    categoryId: z.string().trim().min(1, 'Select a category'),
    productId: z.string().trim().min(1, 'Select a product'),
    batchChoice: z.string(),
    batchNumber: z
      .string()
      .trim()
      .max(50, 'Batch number must be at most 50 characters'),
    manufacturingDate: z.string(),
    expiryDate: z.string(),
    purchaseRate: z.string().trim(),
    type: z.enum(movementTypes, { error: 'Select a movement type' }),
    quantity: z.coerce
      .number({ error: 'Quantity is required' })
      .int('Quantity must be a whole number')
      .min(-1000000, 'Quantity is too small')
      .max(1000000, 'Quantity is too large'),
    note: z.string().trim().max(500, 'Note must be at most 500 characters'),
  })
  .superRefine((value, ctx) => {
    const isNewBatch = value.batchChoice === 'new'

    if (!isNewBatch && value.batchChoice.trim().length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['batchChoice'],
        message: 'Select a batch',
      })
    }

    if (value.quantity === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['quantity'],
        message: 'Quantity cannot be zero',
      })
    }

    if (isNewBatch) {
      if (value.batchNumber.length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['batchNumber'],
          message: 'Batch number is required',
        })
      }

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

      if (value.type !== 'OPENING' && value.type !== 'PURCHASE') {
        ctx.addIssue({
          code: 'custom',
          path: ['type'],
          message: 'A new batch can only be opening stock or a purchase',
        })
      }

      if (value.quantity < 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['quantity'],
          message: 'Quantity must be at least 1',
        })
      }

      return
    }

    if (value.type === 'OPENING') {
      ctx.addIssue({
        code: 'custom',
        path: ['type'],
        message: 'Opening stock is only for a new batch',
      })
    }

    if (value.type !== 'ADJUSTMENT' && value.quantity < 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['quantity'],
        message: 'Quantity must be at least 1',
      })
    }
  })

export type StockMovementFormValues = z.infer<typeof stockMovementSchema>

export function emptyStockMovementValues(
  preset?: Partial<StockMovementFormValues>,
): StockMovementFormValues {
  return {
    divisionId: preset?.divisionId ?? '',
    categoryId: preset?.categoryId ?? '',
    productId: preset?.productId ?? '',
    batchChoice: preset?.batchChoice ?? 'new',
    batchNumber: '',
    manufacturingDate: '',
    expiryDate: '',
    purchaseRate: '',
    type: preset?.batchChoice && preset.batchChoice !== 'new' ? 'PURCHASE' : 'OPENING',
    quantity: 1,
    note: '',
  }
}
