import { useMemo, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { EntityCell } from '../../../components/ui/EntityCell'
import { Modal } from '../../../components/ui/Modal'
import { ResourceTable, type TableColumn } from '../../../components/ui/ResourceTable'
import { RowActions } from '../../../components/ui/RowActions'
import { SelectField } from '../../../components/ui/SelectField'
import {
  nextResourceStatus,
  StatusToggle,
} from '../../../components/ui/StatusToggle'
import { useToast } from '../../../hooks/use-toast'
import { getApiErrorMessage } from '../../../lib/get-api-error-message'
import { matchesQuery } from '../../../lib/matches-query'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../../lib/pagination'
import { useGetCategoriesQuery } from '../../categories/api'
import type { Category } from '../../categories/types'
import { useGetDivisionsQuery } from '../../divisions/api'
import type { Division } from '../../divisions/types'
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from '../api'
import type { ProductFormValues } from '../product-schema'
import type { Product } from '../types'
import { ProductDetails } from './ProductDetails'
import { ProductForm } from './ProductForm'

const OPTIONS_LIMIT = 100

type DialogState =
  | { type: 'create' }
  | { type: 'view'; product: Product }
  | { type: 'edit'; product: Product; fromView?: boolean }
  | { type: 'delete'; product: Product }

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

function emptyFormValues(
  divisionId = '',
  categoryId = '',
): ProductFormValues {
  return {
    divisionId,
    categoryId,
    name: '',
    code: '',
    brandName: '',
    composition: '',
    description: '',
    packSize: '',
    packUnit: 'STRIP',
    contentQuantity: 1,
    contentUnit: 'TABLET',
    reorderLevel: 0,
    mrp: 0,
    discountPercent: 0,
    status: 'ACTIVE',
  }
}

function valuesFromProduct(product: Product): ProductFormValues {
  return {
    divisionId: product.category.divisionId,
    categoryId: product.categoryId,
    name: product.name,
    code: product.code,
    brandName: product.brandName,
    composition: product.composition,
    description: product.description ?? '',
    packSize: product.packSize,
    packUnit: product.packUnit,
    contentQuantity: product.contentQuantity,
    contentUnit: product.contentUnit,
    reorderLevel: product.reorderLevel,
    mrp: product.mrp,
    discountPercent: product.discountPercent,
    status: product.status,
  }
}

function optionalText(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function divisionOptionsForForm(
  divisions: Division[],
  selectedDivisionId?: string,
): Division[] {
  return divisions.filter(
    (division) =>
      division.status === 'ACTIVE' || division.id === selectedDivisionId,
  )
}

function categoryOptionsForFilter(categories: Category[]): Category[] {
  return categories.filter((category) => category.status === 'ACTIVE')
}

export function ProductsWorkspace() {
  const [page, setPage] = useState(DEFAULT_PAGE)
  const [search, setSearch] = useState('')
  const [divisionId, setDivisionId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)
  const toast = useToast()

  const { data: divisionsData } = useGetDivisionsQuery({
    page: DEFAULT_PAGE,
    limit: OPTIONS_LIMIT,
  })
  const { data: categoriesData, isFetching: categoriesLoading } =
    useGetCategoriesQuery(
      {
        page: DEFAULT_PAGE,
        limit: OPTIONS_LIMIT,
        divisionId,
      },
      { skip: !divisionId },
    )
  const { data, isLoading, isError } = useGetProductsQuery({
    page,
    limit: DEFAULT_PAGE_SIZE,
    ...(categoryId
      ? { categoryId }
      : divisionId
        ? { divisionId }
        : {}),
  })
  const [createProduct, createState] = useCreateProductMutation()
  const [updateProduct, updateState] = useUpdateProductMutation()
  const [deleteProduct, deleteState] = useDeleteProductMutation()

  const divisions = divisionsData?.data ?? []
  const categories = divisionId
    ? categoryOptionsForFilter(categoriesData?.data ?? [])
    : []

  const rows = useMemo(() => {
    const items = data?.data ?? []

    return items.filter((item) => {
      if (status && item.status !== status) {
        return false
      }

      return matchesQuery(search, [
        item.name,
        item.code,
        item.brandName,
        item.composition,
        item.description,
        item.packSize,
        item.status,
        item.category.name,
        item.category.division?.name,
      ])
    })
  }, [data?.data, search, status])

  const meta = data?.meta ?? {
    page,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  }

  const columns: TableColumn<Product>[] = [
    {
      id: 'name',
      header: 'Product',
      mobilePrimary: true,
      render: (row) => (
        <EntityCell
          title={row.name}
          imageUrl={row.imageUrl}
          subtitle={row.composition}
          meta={`${row.brandName} · ${row.packSize}`}
        />
      ),
    },
    {
      id: 'code',
      header: 'Code',
      render: (row) => row.code,
    },
    {
      id: 'category',
      header: 'Category',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.category.name}</p>
          {row.category.division?.name ? (
            <p className="text-xs text-slate-500">{row.category.division.name}</p>
          ) : null}
        </div>
      ),
    },
    {
      id: 'price',
      header: 'Price',
      className: 'whitespace-nowrap',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{formatMoney(row.sellingPrice)}</p>
          {row.discountPercent > 0 ? (
            <p className="text-xs text-slate-500">
              MRP {formatMoney(row.mrp)} · {row.discountPercent}% off
            </p>
          ) : (
            <p className="text-xs text-slate-500">MRP {formatMoney(row.mrp)}</p>
          )}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      render: (row) => (
        <StatusToggle
          status={row.status}
          disabled={Boolean(statusUpdatingId) || updateState.isLoading}
          ariaLabel={`${row.name} is ${row.status === 'ACTIVE' ? 'active' : 'inactive'}`}
          onToggle={() => {
            void handleStatusToggle(row)
          }}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'whitespace-nowrap text-right',
      render: (row) => (
        <RowActions
          onView={() => setDialog({ type: 'view', product: row })}
          onEdit={() => {
            setFormError(null)
            setDialog({ type: 'edit', product: row })
          }}
          onDelete={() => setDialog({ type: 'delete', product: row })}
        />
      ),
    },
  ]

  async function handleCreate(values: ProductFormValues) {
    setFormError(null)
    const description = optionalText(values.description)

    try {
      await createProduct({
        name: values.name,
        code: values.code,
        brandName: values.brandName,
        composition: values.composition,
        packSize: values.packSize,
        packUnit: values.packUnit,
        contentQuantity: values.contentQuantity,
        contentUnit: values.contentUnit,
        reorderLevel: values.reorderLevel,
        mrp: values.mrp,
        discountPercent: values.discountPercent,
        categoryId: values.categoryId,
        ...(description ? { description } : {}),
        ...(values.image ? { image: values.image } : {}),
      }).unwrap()
      setPage(DEFAULT_PAGE)
      setDialog(null)
      toast.success('Product created.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to create product.')
      setFormError(message)
      toast.error(message)
    }
  }

  async function handleEdit(product: Product, values: ProductFormValues) {
    setFormError(null)
    try {
      await updateProduct({
        id: product.id,
        body: {
          name: values.name,
          code: values.code,
          brandName: values.brandName,
          composition: values.composition,
          packSize: values.packSize,
          packUnit: values.packUnit,
          contentQuantity: values.contentQuantity,
          contentUnit: values.contentUnit,
          reorderLevel: values.reorderLevel,
          mrp: values.mrp,
          discountPercent: values.discountPercent,
          categoryId: values.categoryId,
          description: optionalText(values.description) ?? '',
          ...(values.image ? { image: values.image } : {}),
        },
      }).unwrap()
      setDialog(null)
      toast.success('Product updated.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to update product.')
      setFormError(message)
      toast.error(message)
    }
  }

  async function handleStatusToggle(product: Product) {
    const nextStatus = nextResourceStatus(product.status)
    setStatusUpdatingId(product.id)

    try {
      await updateProduct({
        id: product.id,
        body: { status: nextStatus },
      }).unwrap()
      toast.success(
        nextStatus === 'ACTIVE'
          ? 'Product activated.'
          : 'Product deactivated.',
      )
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Unable to update product status.'),
      )
    } finally {
      setStatusUpdatingId(null)
    }
  }

  async function handleDelete(product: Product) {
    setFormError(null)
    try {
      await deleteProduct(product.id).unwrap()
      if (meta.page > 1 && rows.length <= 1) {
        setPage(meta.page - 1)
      }
      setDialog(null)
      toast.success('Product deleted.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to delete product.')
      setFormError(message)
      toast.error(message)
    }
  }

  const emptyMessage =
    divisionId || categoryId
      ? 'No products match these filters'
      : 'No products yet'

  const editDivisions =
    dialog?.type === 'edit'
      ? divisionOptionsForForm(divisions, dialog.product.category.divisionId)
      : divisionOptionsForForm(divisions)

  function closeEditDialog() {
    if (dialog?.type === 'edit' && dialog.fromView) {
      setFormError(null)
      setDialog({ type: 'view', product: dialog.product })
      return
    }

    setDialog(null)
  }

  function openEditFromView(product: Product) {
    setFormError(null)
    setDialog({ type: 'edit', product, fromView: true })
  }

  return (
    <>
      <ResourceTable
        title="Products"
        description="All products are listed here. Filter by division or category to narrow the table."
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter this page by name, code, brand, or composition"
        toolbarExtra={
          <div className="grid w-full gap-3 sm:grid-cols-2 xl:max-w-3xl xl:grid-cols-3">
            <SelectField
              label="Division"
              name="product-division"
              value={divisionId}
              onChange={(event) => {
                setDivisionId(event.target.value)
                setCategoryId('')
                setPage(DEFAULT_PAGE)
              }}
            >
              <option value="">All divisions</option>
              {divisionOptionsForForm(divisions).map((division) => (
                <option key={division.id} value={division.id}>
                  {division.name}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Category"
              name="product-category"
              value={categoryId}
              disabled={!divisionId || categoriesLoading}
              onChange={(event) => {
                setCategoryId(event.target.value)
                setPage(DEFAULT_PAGE)
              }}
            >
              <option value="">
                {divisionId ? 'All categories' : 'Select a division first'}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Status"
              name="product-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </SelectField>
          </div>
        }
        createLabel="Create product"
        onCreate={() => {
          setFormError(null)
          setDialog({ type: 'create' })
        }}
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        meta={meta}
        onPageChange={setPage}
        isLoading={isLoading && !data}
        isError={isError}
        isFiltered={Boolean(status)}
        errorMessage="Unable to load products."
        emptyMessage={emptyMessage}
        emptyHint="Add a product to the catalog."
      />

      <Modal
        open={dialog?.type === 'view'}
        title="Product details"
        size="lg"
        onClose={() => setDialog(null)}
      >
        {dialog?.type === 'view' ? (
          <ProductDetails
            product={dialog.product}
            onEdit={() => openEditFromView(dialog.product)}
            onClose={() => setDialog(null)}
          />
        ) : null}
      </Modal>

      <Modal
        open={dialog?.type === 'create'}
        title="Create product"
        size="lg"
        onClose={() => setDialog(null)}
      >
        <ProductForm
          key="create"
          defaultValues={emptyFormValues(divisionId, categoryId)}
          divisions={divisionOptionsForForm(divisions)}
          submitLabel="Create"
          isSubmitting={createState.isLoading}
          error={formError}
          onSubmit={handleCreate}
          onCancel={() => setDialog(null)}
        />
      </Modal>

      <Modal
        open={dialog?.type === 'edit'}
        title="Edit product"
        size="lg"
        onClose={closeEditDialog}
      >
        {dialog?.type === 'edit' ? (
          <ProductForm
            key={dialog.product.id}
            defaultValues={valuesFromProduct(dialog.product)}
            currentImageUrl={dialog.product.imageUrl}
            divisions={editDivisions}
            submitLabel="Save changes"
            isSubmitting={updateState.isLoading && !statusUpdatingId}
            error={formError}
            onSubmit={(values) => handleEdit(dialog.product, values)}
            onCancel={closeEditDialog}
          />
        ) : null}
      </Modal>

      <Modal
        open={dialog?.type === 'delete'}
        title="Delete product"
        onClose={() => setDialog(null)}
      >
        {dialog?.type === 'delete' ? (
          <div>
            <p className="text-sm text-slate-600">
              Delete <span className="font-medium text-slate-900">{dialog.product.name}</span>?
              This cannot be undone.
            </p>
            {formError ? (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="secondary"
                width="auto"
                onClick={() => setDialog(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                width="auto"
                disabled={deleteState.isLoading}
                onClick={() => handleDelete(dialog.product)}
              >
                {deleteState.isLoading ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  )
}
