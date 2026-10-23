import { z } from 'zod'

export const catalogUnitFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(80, 'Name must be at most 80 characters'),
  code: z
    .string()
    .trim()
    .min(1, 'Code is required')
    .max(30, 'Code must be at most 30 characters'),
  singularLabel: z
    .string()
    .trim()
    .min(1, 'Singular label is required')
    .max(40, 'Singular label must be at most 40 characters'),
  pluralLabel: z
    .string()
    .trim()
    .min(1, 'Plural label is required')
    .max(40, 'Plural label must be at most 40 characters'),
  sortOrder: z.coerce
    .number({ error: 'Sort order must be a number' })
    .int('Sort order must be a whole number')
    .min(0, 'Sort order cannot be negative')
    .max(100000, 'Sort order is too large'),
  status: z.union([z.literal('ACTIVE'), z.literal('INACTIVE')]),
})

export type CatalogUnitFormValues = z.infer<typeof catalogUnitFormSchema>
