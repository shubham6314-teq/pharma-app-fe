import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { TextArea } from '../../../components/ui/TextArea'
import { TextField } from '../../../components/ui/TextField'
import { zodResolver } from '../../../lib/zod-resolver'
import {
  inventoryBatchSchema,
  type InventoryBatchFormValues,
} from '../inventory-batch-schema'
import type { InventoryBatch } from '../types'

type InventoryBatchFormProps = {
  batch: InventoryBatch
  defaultValues: InventoryBatchFormValues
  submitLabel: string
  isSubmitting: boolean
  error: string | null
  onSubmit: (values: InventoryBatchFormValues) => Promise<void>
  onCancel: () => void
}

export function InventoryBatchForm({
  batch,
  defaultValues,
  submitLabel,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
}: InventoryBatchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InventoryBatchFormValues>({
    resolver: zodResolver(inventoryBatchSchema),
    defaultValues,
    mode: 'onTouched',
  })

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="rounded-xl bg-slate-50 px-3.5 py-3 text-sm text-slate-600">
        <p className="font-medium text-slate-800">{batch.product.name}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {batch.product.category.division.name} · {batch.product.category.name} ·{' '}
          {batch.product.code}
        </p>
      </div>
      <TextField
        label="Batch number"
        placeholder="B-1042"
        error={errors.batchNumber?.message}
        {...register('batchNumber')}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Manufacturing date"
          type="date"
          error={errors.manufacturingDate?.message}
          {...register('manufacturingDate')}
        />
        <TextField
          label="Expiry date"
          type="date"
          error={errors.expiryDate?.message}
          {...register('expiryDate')}
        />
      </div>
      <TextField
        label="Purchase rate"
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        placeholder="40.00"
        error={errors.purchaseRate?.message}
        {...register('purchaseRate')}
      />
      <p className="-mt-3 text-xs text-slate-500">
        On-hand quantity is not changed here. Use Move to record a stock adjustment.
      </p>
      <TextArea
        label="Note"
        placeholder="Optional"
        error={errors.note?.message}
        {...register('note')}
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
