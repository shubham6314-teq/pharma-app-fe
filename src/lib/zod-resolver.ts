import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form'
import { z } from 'zod'

export function zodResolver<TFieldValues extends FieldValues>(
  schema: z.ZodType<TFieldValues>,
): Resolver<TFieldValues> {
  return (values) => {
    const result = schema.safeParse(values)

    if (result.success) {
      return { values: result.data, errors: {} }
    }

    const { fieldErrors } = z.flattenError(result.error)
    const errors = {} as FieldErrors<TFieldValues>

    for (const [field, messages] of Object.entries(fieldErrors)) {
      const message = messages?.[0]
      if (!message) continue

      Object.assign(errors, {
        [field]: { type: 'validation', message },
      })
    }

    return { values: {}, errors }
  }
}
