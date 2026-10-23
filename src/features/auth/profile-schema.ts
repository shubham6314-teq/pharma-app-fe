import { z } from 'zod'

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(150, 'Name must be at most 150 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .pipe(z.email('Enter a valid email address')),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
