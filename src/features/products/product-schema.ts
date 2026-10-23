import { z } from 'zod'
import { CONTENT_UNITS, PACK_UNITS } from './units'

export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024
export const PRODUCT_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

export const productFormSchema = z.object({
  divisionId: z.string().trim().min(1, 'Select a division'),
  categoryId: z.string().trim().min(1, 'Select a category'),
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(150, 'Name must be at most 150 characters'),
  code: z
    .string()
    .trim()
    .min(1, 'Code is required')
    .max(30, 'Code must be at most 30 characters'),
  brandName: z
    .string()
    .trim()
    .min(1, 'Brand name is required')
    .max(150, 'Brand name must be at most 150 characters'),
  composition: z
    .string()
    .trim()
    .min(1, 'Composition is required')
    .max(2000, 'Composition must be at most 2000 characters'),
  description: z.string().trim(),
  packSize: z
    .string()
    .trim()
    .min(1, 'Packaging size is required')
    .max(100, 'Packaging size must be at most 100 characters'),
  packUnit: z.enum(PACK_UNITS, {
    error: 'Select how this product is counted',
  }),
  contentQuantity: z.coerce
    .number({ error: 'Content quantity is required' })
    .positive('Content quantity must be greater than 0')
    .max(99999999.99, 'Content quantity is too large'),
  contentUnit: z.enum(CONTENT_UNITS, {
    error: 'Select the content unit',
  }),
  reorderLevel: z.coerce
    .number({ error: 'Reorder level is required' })
    .int('Reorder level must be a whole number')
    .min(0, 'Reorder level cannot be negative')
    .max(1000000, 'Reorder level is too large'),
  mrp: z.coerce
    .number({ error: 'Price is required' })
    .positive('Price must be greater than 0'),
  discountPercent: z.coerce
    .number({ error: 'Discount must be a number' })
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100'),
  image: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= PRODUCT_IMAGE_MAX_BYTES,
      'Image must be at most 5MB',
    )
    .refine(
      (file) =>
        !file || (PRODUCT_IMAGE_TYPES as readonly string[]).includes(file.type),
      'Use a JPEG, PNG, WebP, or GIF image',
    ),
  status: z.union([z.literal('ACTIVE'), z.literal('INACTIVE')]),
})

export type ProductFormValues = z.infer<typeof productFormSchema>
