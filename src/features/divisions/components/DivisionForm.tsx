import { Controller, useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { ImagePicker } from '../../../components/ui/ImagePicker'
import { TextArea } from '../../../components/ui/TextArea'
import { TextField } from '../../../components/ui/TextField'
import { zodResolver } from '../../../lib/zod-resolver'
import {
  DIVISION_IMAGE_TYPES,
  divisionFormSchema,
  type DivisionFormValues,
} from '../division-schema'

type DivisionFormProps = {
  defaultValues: DivisionFormValues
  currentImageUrl?: string | null
  submitLabel: string
  isSubmitting: boolean
  error: string | null
  onSubmit: (values: DivisionFormValues) => Promise<void>
  onCancel: () => void
}

export function DivisionForm({
  defaultValues,
  currentImageUrl,
  submitLabel,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
}: DivisionFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DivisionFormValues>({
    resolver: zodResolver(divisionFormSchema),
    defaultValues,
    mode: 'onTouched',
  })

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <TextField
        label="Name"
        placeholder="Cardiology Division"
        error={errors.name?.message}
        {...register('name')}
      />
      <TextField
        label="Code"
        placeholder="CARD"
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
            accept={DIVISION_IMAGE_TYPES}
            alt="Division preview"
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
        <Button width="auto" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
