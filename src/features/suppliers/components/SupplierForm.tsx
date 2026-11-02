import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { TextArea } from '../../../components/ui/TextArea'
import { TextField } from '../../../components/ui/TextField'
import { zodResolver } from '../../../lib/zod-resolver'
import { supplierFormSchema, type SupplierFormValues } from '../supplier-schema'

type SupplierFormProps = {
  defaultValues: SupplierFormValues
  submitLabel: string
  isSubmitting: boolean
  error: string | null
  onSubmit: (values: SupplierFormValues) => Promise<void>
  onCancel: () => void
}

export function SupplierForm({
  defaultValues,
  submitLabel,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
}: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues,
    mode: 'onTouched',
  })

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <TextField
        label="Name"
        placeholder="MedSupply Co."
        error={errors.name?.message}
        {...register('name')}
      />
      <TextField
        label="Code"
        placeholder="MEDCO"
        error={errors.code?.message}
        {...register('code')}
      />
      <TextField
        label="Contact name"
        placeholder="Optional"
        error={errors.contactName?.message}
        {...register('contactName')}
      />
      <TextField
        label="Email"
        placeholder="Optional"
        error={errors.email?.message}
        {...register('email')}
      />
      <TextField
        label="Phone"
        placeholder="Optional"
        error={errors.phone?.message}
        {...register('phone')}
      />
      <TextArea
        label="Notes"
        placeholder="Optional"
        error={errors.notes?.message}
        {...register('notes')}
      />
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" width="auto" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" width="auto" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
