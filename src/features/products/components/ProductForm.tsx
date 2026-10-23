import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { ImagePicker } from '../../../components/ui/ImagePicker'
import { SelectField } from '../../../components/ui/SelectField'
import { TextArea } from '../../../components/ui/TextArea'
import { TextField } from '../../../components/ui/TextField'
import { DEFAULT_PAGE } from '../../../lib/pagination'
import { zodResolver } from '../../../lib/zod-resolver'
import { useGetCategoriesQuery } from '../../categories/api'
import type { Category } from '../../categories/types'
import type { Division } from '../../divisions/types'
import {
  PRODUCT_IMAGE_TYPES,
  productFormSchema,
  type ProductFormValues,
} from '../product-schema'
import { CONTENT_UNIT_LABELS, CONTENT_UNITS, PACK_UNIT_LABELS, PACK_UNITS } from '../units'

const CATEGORY_OPTIONS_LIMIT = 100

type ProductFormProps = {
  defaultValues: ProductFormValues
  currentImageUrl?: string | null
  divisions: Division[]
  submitLabel: string
  isSubmitting: boolean
  error: string | null
  onSubmit: (values: ProductFormValues) => Promise<void>
  onCancel: () => void
}

const selectClassName =
  'h-12 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15'

export function ProductForm({
  defaultValues,
  currentImageUrl,
  divisions,
  submitLabel,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
    mode: 'onTouched',
  })

  const [divisionId, setDivisionId] = useState(defaultValues.divisionId)
  const divisionField = register('divisionId')

  const { data: categoriesData, isFetching: categoriesLoading } =
    useGetCategoriesQuery(
      {
        page: DEFAULT_PAGE,
        limit: CATEGORY_OPTIONS_LIMIT,
        divisionId,
      },
      { skip: !divisionId },
    )

  const categories = categoryOptionsForForm(
    categoriesData?.data ?? [],
    defaultValues.categoryId,
  )

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 text-left">
          <label htmlFor="divisionId" className="text-sm font-medium text-slate-700">
            Division
          </label>
          <select
            id="divisionId"
            className={`${selectClassName} ${errors.divisionId ? 'border-red-400' : 'border-slate-200'}`}
            disabled={divisions.length === 0}
            {...divisionField}
            onChange={(event) => {
              divisionField.onChange(event)
              setDivisionId(event.target.value)
              setValue('categoryId', '')
            }}
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
              Create a division first, then add products under it.
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5 text-left">
          <label htmlFor="categoryId" className="text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            id="categoryId"
            className={`${selectClassName} ${errors.categoryId ? 'border-red-400' : 'border-slate-200'}`}
            disabled={!divisionId || categoriesLoading}
            {...register('categoryId')}
          >
            <option value="">
              {divisionId ? 'Select a category' : 'Select a division first'}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.code})
              </option>
            ))}
          </select>
          {errors.categoryId?.message ? (
            <p className="text-xs text-red-600">{errors.categoryId.message}</p>
          ) : divisionId && !categoriesLoading && categories.length === 0 ? (
            <p className="text-xs text-slate-500">
              Create a category in this division first.
            </p>
          ) : null}
        </div>
      </div>
      <TextField
        label="Name"
        placeholder="Crocin"
        error={errors.name?.message}
        {...register('name')}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Code"
          placeholder="CRO100ML"
          error={errors.code?.message}
          {...register('code')}
        />
        <TextField
          label="Brand name"
          placeholder="GSK"
          error={errors.brandName?.message}
          {...register('brandName')}
        />
      </div>
      <TextArea
        label="Composition"
        placeholder="Paracetamol 125 mg/5 ml"
        error={errors.composition?.message}
        {...register('composition')}
      />
      <TextArea
        label="Description"
        placeholder="Optional description"
        error={errors.description?.message}
        {...register('description')}
      />
      <TextField
        label="Packaging size"
        placeholder="10*10 Blister or 4*5*2 ml Respules"
        error={errors.packSize?.message}
        {...register('packSize')}
      />
      <div className="grid gap-5 sm:grid-cols-3">
        <SelectField
          label="Counted as"
          error={errors.packUnit?.message}
          hint="The pack you receive and sell."
          {...register('packUnit')}
        >
          {PACK_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {PACK_UNIT_LABELS[unit]}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Content per pack"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          placeholder="10"
          error={errors.contentQuantity?.message}
          {...register('contentQuantity')}
        />
        <SelectField
          label="Content unit"
          error={errors.contentUnit?.message}
          {...register('contentUnit')}
        >
          {CONTENT_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {CONTENT_UNIT_LABELS[unit]}
            </option>
          ))}
        </SelectField>
      </div>
      <TextField
        label="Reorder level"
        type="number"
        inputMode="numeric"
        min="0"
        step="1"
        placeholder="0"
        error={errors.reorderLevel?.message}
        {...register('reorderLevel')}
      />
      <p className="-mt-3 text-xs text-slate-500">
        Alert when packs on hand fall to this number. Use 0 to turn the alert off.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="MRP"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          placeholder="80.00"
          error={errors.mrp?.message}
          {...register('mrp')}
        />
        <TextField
          label="Discount %"
          type="number"
          inputMode="decimal"
          min="0"
          max="100"
          step="0.01"
          placeholder="0"
          error={errors.discountPercent?.message}
          {...register('discountPercent')}
        />
      </div>
      <Controller
        name="image"
        control={control}
        render={({ field: { name, value, onChange, onBlur, ref } }) => (
          <ImagePicker
            name={name}
            value={value}
            currentImageUrl={currentImageUrl}
            accept={PRODUCT_IMAGE_TYPES}
            alt="Product preview"
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

function categoryOptionsForForm(
  categories: Category[],
  selectedCategoryId?: string,
): Category[] {
  return categories.filter(
    (category) =>
      category.status === 'ACTIVE' || category.id === selectedCategoryId,
  )
}
