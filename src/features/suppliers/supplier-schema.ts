import { z } from 'zod'

export const supplierFormSchema = z.object({
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
  contactName: z.string().trim().max(150, 'Contact name must be at most 150 characters'),
  email: z
    .string()
    .trim()
    .max(255, 'Email must be at most 255 characters')
    .refine((value) => value === '' || z.string().email().safeParse(value).success, {
      message: 'Enter a valid email',
    }),
  phone: z.string().trim().max(30, 'Phone must be at most 30 characters'),
  notes: z.string().trim(),
  status: z.union([z.literal('ACTIVE'), z.literal('INACTIVE')]),
})

export type SupplierFormValues = z.infer<typeof supplierFormSchema>
