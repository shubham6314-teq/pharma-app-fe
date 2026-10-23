import { z } from 'zod'

export const DIVISION_IMAGE_MAX_BYTES = 5 * 1024 * 1024
export const DIVISION_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const

export const divisionFormSchema = z.object({
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
  description: z.string().trim(),
  image: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= DIVISION_IMAGE_MAX_BYTES,
      'Image must be at most 5MB',
    )
    .refine(
      (file) =>
        !file ||
        (DIVISION_IMAGE_TYPES as readonly string[]).includes(file.type),
      'Use a JPEG, PNG, WebP, or GIF image',
    ),
  status: z.union([z.literal('ACTIVE'), z.literal('INACTIVE')]),
})

export type DivisionFormValues = z.infer<typeof divisionFormSchema>
