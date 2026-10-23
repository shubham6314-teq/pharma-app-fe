import { Controller, useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { ImagePicker } from '../../../components/ui/ImagePicker'
import { TextArea } from '../../../components/ui/TextArea'
import { TextField } from '../../../components/ui/TextField'
import { zodResolver } from '../../../lib/zod-resolver'
import type { Division } from '../../divisions/types'
import {
  CATEGORY_IMAGE_TYPES,
  categoryFormSchema,
  type CategoryFormValues,
} from '../category-schema'

type CategoryFormProps = {
  defaultValues: CategoryFormValues
  currentImageUrl?: string | null
  divisions: Division[]
  submitLabel: string
  isSubmitting: boolean
  error: string | null
  onSubmit: (values: CategoryFormValues) => Promise<void>
  onCancel: () => void
}

export function CategoryForm({
  defaultValues,
  currentImageUrl,
  divisions,
  submitLabel,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
    mode: 'onTouched',
  })

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-1.5 text-left">
        <label htmlFor="divisionId" className="text-sm font-medium text-slate-700">
          Division
        </label>
        <select
          id="divisionId"
          className={`h-12 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15 ${
            errors.divisionId ? 'border-red-400' : 'border-slate-200'
          }`}
          disabled={divisions.length === 0}
          {...register('divisionId')}
        >
          <option value="">Select a division</option>
          {divisions.map((division) => (
            <option key={division.id} value={division.id}>
              {division.name} ({division.code})
            </option>
          ))}
        </select>
        {errors.divisionId?.message ? (
          <p className="text-xs text-red-600">{errors.divisionId.message}</p>
        ) : divisions.length === 0 ? (
          <p className="text-xs text-slate-500">
            Create a division first, then add categories under it.
          </p>
        ) : null}
      </div>
      <TextField
        label="Name"
        placeholder="Antihypertensives"
        error={errors.name?.message}
        {...register('name')}
      />
      <TextField
        label="Code"
        placeholder="ANTIHTN"
        error={errors.code?.message}
        {...register('code')}
      />
      <TextArea
        label="Description"
        placeholder="Optional description"
        error={errors.description?.message}
        {...register('description')}
      />
      <Controller
        name="image"
        control={control}
        render={({ field: { name, value, onChange, onBlur, ref } }) => (
          <ImagePicker
            name={name}
            value={value}
            currentImageUrl={currentImageUrl}
            accept={CATEGORY_IMAGE_TYPES}
            alt="Category preview"
            error={errors.image?.message}
            inputRef={ref}
            onBlur={onBlur}
            onChange={onChange}
          />
        )}
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
        <Button
          width="auto"
          type="submit"
          disabled={isSubmitting || divisions.length === 0}
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
