import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { SelectField } from '../../../components/ui/SelectField'
import { TextArea } from '../../../components/ui/TextArea'
import { TextField } from '../../../components/ui/TextField'
import { DEFAULT_PAGE } from '../../../lib/pagination'
import { zodResolver } from '../../../lib/zod-resolver'
import { useGetCategoriesQuery } from '../../categories/api'
import type { Division } from '../../divisions/types'
import { useGetProductsQuery } from '../../products/api'
import type { Product } from '../../products/types'
import { formatPackContent, formatPackQuantity } from '../../products/units'
import { useGetInventoryQuery } from '../api'
import { formatIsoDate, MOVEMENT_TYPE_LABELS } from '../labels'
import {
  EXISTING_BATCH_MOVEMENT_TYPES,
  NEW_BATCH_MOVEMENT_TYPES,
  stockMovementSchema,
  type StockMovementFormValues,
} from '../stock-movement-schema'

const OPTIONS_LIMIT = 100

type StockMovementFormProps = {
  defaultValues: StockMovementFormValues
  divisions: Division[]
  isSubmitting: boolean
  error: string | null
  onSubmit: (values: StockMovementFormValues) => Promise<void>
  onCancel: () => void
}

export function StockMovementForm({
  defaultValues,
  divisions,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
}: StockMovementFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<StockMovementFormValues>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues,
    mode: 'onTouched',
  })

  const divisionId = watch('divisionId')
  const categoryId = watch('categoryId')
  const productId = watch('productId')
  const batchChoice = watch('batchChoice')
  const movementType = watch('type')
  const isNewBatch = batchChoice === 'new'
  const divisionField = register('divisionId')
  const categoryField = register('categoryId')
  const productField = register('productId')

  const { data: categoriesData, isFetching: categoriesLoading } = useGetCategoriesQuery(
    { page: DEFAULT_PAGE, limit: OPTIONS_LIMIT, divisionId },
    { skip: !divisionId },
  )
  const { data: productsData, isFetching: productsLoading } = useGetProductsQuery(
    { page: DEFAULT_PAGE, limit: OPTIONS_LIMIT, categoryId },
    { skip: !categoryId },
  )
  const { data: batchesData, isFetching: batchesLoading } = useGetInventoryQuery(
    { page: DEFAULT_PAGE, limit: OPTIONS_LIMIT, productId },
    { skip: !productId },
  )

  const categories = (categoriesData?.data ?? []).filter(
    (category) => category.status === 'ACTIVE' || category.id === defaultValues.categoryId,
  )
  const products = (productsData?.data ?? []).filter(
    (product) => product.status === 'ACTIVE' || product.id === defaultValues.productId,
  )
  const batches = batchesData?.data ?? []
  const selectedProduct = products.find((product) => product.id === productId)
  const selectedBatch = batches.find((batch) => batch.id === batchChoice)
  const movementTypes = isNewBatch
    ? NEW_BATCH_MOVEMENT_TYPES
    : EXISTING_BATCH_MOVEMENT_TYPES

  useEffect(() => {
    if (isNewBatch && movementType !== 'OPENING' && movementType !== 'PURCHASE') {
      setValue('type', 'OPENING')
    }

    if (!isNewBatch && movementType === 'OPENING') {
      setValue('type', 'PURCHASE')
    }
  }, [isNewBatch, movementType, setValue])

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={handleSubmit(async (values) => {
        if (values.batchChoice !== 'new') {
          const batch = batches.find((item) => item.id === values.batchChoice)
          if (!batch) {
            setError('batchChoice', { message: 'Select a batch' })
            return
          }

          await onSubmit({ ...values, batchNumber: batch.batchNumber })
          return
        }

        await onSubmit(values)
      })}
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Division"
          error={errors.divisionId?.message}
          disabled={divisions.length === 0}
          {...divisionField}
          onChange={(event) => {
            divisionField.onChange(event)
            setValue('categoryId', '')
            setValue('productId', '')
            setValue('batchChoice', 'new')
          }}
        >
          <option value="">Select a division</option>
          {divisions.map((division) => (
            <option key={division.id} value={division.id}>
              {division.name} ({division.code})
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Category"
          error={errors.categoryId?.message}
          disabled={!divisionId || categoriesLoading}
          {...categoryField}
          onChange={(event) => {
            categoryField.onChange(event)
            setValue('productId', '')
            setValue('batchChoice', 'new')
          }}
        >
          <option value="">
            {divisionId ? 'Select a category' : 'Select a division first'}
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} ({category.code})
            </option>
          ))}
        </SelectField>
      </div>
      <SelectField
        label="Product"
        error={errors.productId?.message}
        disabled={!categoryId || productsLoading}
        hint={productHint(selectedProduct, categoryId, productsLoading, products.length)}
        {...productField}
        onChange={(event) => {
          productField.onChange(event)
          setValue('batchChoice', 'new')
        }}
      >
        <option value="">
          {categoryId ? 'Select a product' : 'Select a category first'}
        </option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} ({product.code})
          </option>
        ))}
      </SelectField>
      <SelectField
        label="Batch"
        error={errors.batchChoice?.message}
        disabled={!productId || batchesLoading}
        {...register('batchChoice')}
      >
        <option value="new">New batch</option>
        {batches.map((batch) => (
          <option key={batch.id} value={batch.id}>
            {batch.batchNumber} · {formatPackQuantity(batch.quantityOnHand, batch.product.packUnit)} · exp {formatIsoDate(batch.expiryDate)}
          </option>
        ))}
      </SelectField>
      {isNewBatch ? (
        <>
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
        </>
      ) : selectedBatch ? (
        <p className="rounded-xl bg-slate-50 px-3.5 py-3 text-sm text-slate-600">
          {selectedBatch.batchNumber} · manufactured {formatIsoDate(selectedBatch.manufacturingDate)} · expires {formatIsoDate(selectedBatch.expiryDate)} · {formatPackQuantity(selectedBatch.quantityOnHand, selectedBatch.product.packUnit)} on hand
        </p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField label="Movement" error={errors.type?.message} {...register('type')}>
          {movementTypes.map((type) => (
            <option key={type} value={type}>
              {MOVEMENT_TYPE_LABELS[type]}
            </option>
          ))}
        </SelectField>
        <TextField
          label={movementType === 'ADJUSTMENT' ? 'Quantity change' : 'Quantity'}
          type="number"
          inputMode="numeric"
          step="1"
          placeholder={movementType === 'ADJUSTMENT' ? '-2' : '10'}
          error={errors.quantity?.message}
          {...register('quantity')}
        />
      </div>
      {movementType === 'ADJUSTMENT' ? (
        <p className="text-xs text-slate-500">
          Use a negative number to remove packs. For example, -2 takes two packs off this batch.
        </p>
      ) : (
        <p className="text-xs text-slate-500">Enter the number of packs, not tablets or millilitres.</p>
      )}
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
        <Button width="auto" type="submit" disabled={isSubmitting || divisions.length === 0}>
          {isSubmitting ? 'Saving…' : 'Save movement'}
        </Button>
      </div>
    </form>
  )
}

function productHint(
  product: Product | undefined,
  categoryId: string,
  loading: boolean,
  productCount: number,
): string | undefined {
  if (product) {
    const reorder =
      product.reorderLevel > 0
        ? `Reorder at ${product.reorderLevel}.`
        : 'Reorder alert is off.'
    return `${product.packSize}. ${formatPackContent(product.contentQuantity, product.contentUnit, product.packUnit)}. ${reorder}`
  }

  if (categoryId && !loading && productCount === 0) {
    return 'Create a product in this category first.'
  }

  return undefined
}
