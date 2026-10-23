import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { zodResolver } from '../../../lib/zod-resolver'
import {
  catalogUnitFormSchema,
  type CatalogUnitFormValues,
} from '../catalog-unit-schema'

type CatalogUnitFormProps = {
  defaultValues: CatalogUnitFormValues
  submitLabel: string
  isSubmitting: boolean
  error: string | null
  singularHint: string
  pluralHint: string
  onSubmit: (values: CatalogUnitFormValues) => Promise<void>
  onCancel: () => void
}

export function CatalogUnitForm({
  defaultValues,
  submitLabel,
  isSubmitting,
  error,
  singularHint,
  pluralHint,
  onSubmit,
  onCancel,
}: CatalogUnitFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CatalogUnitFormValues>({
    resolver: zodResolver(catalogUnitFormSchema),
    defaultValues,
    mode: 'onTouched',
  })

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <TextField
        label="Name"
        placeholder="Bottle"
        error={errors.name?.message}
        {...register('name')}
      />
      <TextField
        label="Code"
        placeholder="BOTTLE"
        error={errors.code?.message}
        {...register('code')}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Singular label"
          placeholder="bottle"
          error={errors.singularLabel?.message}
          {...register('singularLabel')}
        />
        <TextField
          label="Plural label"
          placeholder="bottles"
          error={errors.pluralLabel?.message}
          {...register('pluralLabel')}
        />
      </div>
      <p className="-mt-3 text-xs text-slate-500">
        {singularHint} {pluralHint}
      </p>
      <TextField
        label="Sort order"
        type="number"
        inputMode="numeric"
        min="0"
        step="1"
        error={errors.sortOrder?.message}
        {...register('sortOrder')}
      />
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" width="auto" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button width="auto" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
