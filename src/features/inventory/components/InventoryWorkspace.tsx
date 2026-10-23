import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { EntityCell } from '../../../components/ui/EntityCell'
import { Modal } from '../../../components/ui/Modal'
import { ResourceTable, type TableColumn } from '../../../components/ui/ResourceTable'
import { SelectField } from '../../../components/ui/SelectField'
import { useToast } from '../../../hooks/use-toast'
import { getApiErrorMessage } from '../../../lib/get-api-error-message'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../../lib/pagination'
import { useGetCategoriesQuery } from '../../categories/api'
import { useGetDivisionsQuery } from '../../divisions/api'
import type { Division } from '../../divisions/types'
import { formatPackQuantity } from '../../products/units'
import { useCreateStockMovementMutation, useGetInventoryQuery } from '../api'
import {
  formatIsoDate,
  formatMoney,
  STOCK_STATUS_LABELS,
} from '../labels'
import type { StockMovementFormValues } from '../stock-movement-schema'
import { emptyStockMovementValues } from '../stock-movement-schema'
import type { InventoryBatch, StockStatus } from '../types'
import { InventoryDetails } from './InventoryDetails'
import { StockMovementForm } from './StockMovementForm'
import { StockStatusBadge } from './StockStatusBadge'

const OPTIONS_LIMIT = 100

type DialogState =
  | { type: 'create'; preset?: Partial<StockMovementFormValues> }
  | { type: 'view'; batch: InventoryBatch }

function activeDivisions(divisions: Division[]): Division[] {
  return divisions.filter((division) => division.status === 'ACTIVE')
}

export function InventoryWorkspace() {
  const [page, setPage] = useState(DEFAULT_PAGE)
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [divisionId, setDivisionId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState<'' | StockStatus>('')
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const toast = useToast()

  const appliedSearchRef = useRef('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = search.trim()
      if (appliedSearchRef.current === next) {
        return
      }

      appliedSearchRef.current = next
      setAppliedSearch(next)
      setPage(DEFAULT_PAGE)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [search])

  const { data: divisionsData } = useGetDivisionsQuery({
    page: DEFAULT_PAGE,
    limit: OPTIONS_LIMIT,
  })
  const { data: categoriesData, isFetching: categoriesLoading } = useGetCategoriesQuery(
    { page: DEFAULT_PAGE, limit: OPTIONS_LIMIT, divisionId },
    { skip: !divisionId },
  )
  const { data, isLoading, isError } = useGetInventoryQuery({
    page,
    limit: DEFAULT_PAGE_SIZE,
    ...(categoryId ? { categoryId } : divisionId ? { divisionId } : {}),
    ...(appliedSearch ? { search: appliedSearch } : {}),
    ...(status ? { status } : {}),
  })
  const [createMovement, createState] = useCreateStockMovementMutation()

  const divisions = divisionsData?.data ?? []
  const categories = divisionId
    ? (categoriesData?.data ?? []).filter((category) => category.status === 'ACTIVE')
    : []
  const rows = data?.data ?? []
  const meta = data?.meta ?? {
    page,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  }

  const columns: TableColumn<InventoryBatch>[] = [
    {
      id: 'product',
      header: 'Product',
      mobilePrimary: true,
      render: (row) => (
        <EntityCell
          title={row.product.name}
          subtitle={`${row.product.code} · ${row.product.packSize}`}
          meta={`${row.product.category.division.name} · ${row.product.category.name}`}
        />
      ),
    },
    {
      id: 'batch',
      header: 'Batch',
      render: (row) => row.batchNumber,
    },
    {
      id: 'expiry',
      header: 'Expiry',
      render: (row) => formatIsoDate(row.expiryDate),
    },
    {
      id: 'quantity',
      header: 'On hand',
      render: (row) => formatPackQuantity(row.quantityOnHand, row.product.packUnit),
    },
    {
      id: 'rate',
      header: 'Purchase rate',
      className: 'whitespace-nowrap',
      render: (row) => formatMoney(row.purchaseRate),
    },
    {
      id: 'status',
      header: 'Status',
      render: (row) => <StockStatusBadge status={row.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'whitespace-nowrap text-right',
      render: (row) => (
        <div className="inline-flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            width="auto"
            onClick={() => setDialog({ type: 'view', batch: row })}
          >
            Details
          </Button>
          <Button
            size="sm"
            width="auto"
            onClick={() => openMovement(row)}
          >
            Move
          </Button>
        </div>
      ),
    },
  ]

  function openMovement(batch: InventoryBatch) {
    setFormError(null)
    setDialog({
      type: 'create',
      preset: {
        divisionId: batch.product.category.divisionId,
        categoryId: batch.product.category.id,
        productId: batch.productId,
        batchChoice: batch.id,
      },
    })
  }

  async function handleCreate(values: StockMovementFormValues) {
    setFormError(null)
    const note = values.note.trim()

    try {
      await createMovement({
        productId: values.productId,
        batchNumber: values.batchNumber,
        type: values.type,
        quantity: values.quantity,
        ...(values.batchChoice === 'new'
          ? {
              manufacturingDate: values.manufacturingDate,
              expiryDate: values.expiryDate,
              purchaseRate: Number(values.purchaseRate),
            }
          : {}),
        ...(note ? { note } : {}),
      }).unwrap()
      setDialog(null)
      toast.success('Stock movement saved.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to save the stock movement.')
      setFormError(message)
      toast.error(message)
    }
  }

  return (
    <>
      <ResourceTable
        title="Inventory"
        description="Stock is counted in packs. Expiring means the batch expires within 90 days."
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by product, code, or batch"
        toolbarExtra={
          <div className="grid w-full gap-3 sm:grid-cols-2 xl:max-w-3xl xl:grid-cols-3">
            <SelectField
              label="Division"
              name="inventory-division"
              value={divisionId}
              onChange={(event) => {
                setDivisionId(event.target.value)
                setCategoryId('')
                setPage(DEFAULT_PAGE)
              }}
            >
              <option value="">All divisions</option>
              {activeDivisions(divisions).map((division) => (
                <option key={division.id} value={division.id}>
                  {division.name}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Category"
              name="inventory-category"
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
              name="inventory-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as '' | StockStatus)
                setPage(DEFAULT_PAGE)
              }}
            >
              <option value="">All statuses</option>
              {(Object.keys(STOCK_STATUS_LABELS) as StockStatus[]).map((item) => (
                <option key={item} value={item}>
                  {STOCK_STATUS_LABELS[item]}
                </option>
              ))}
            </SelectField>
          </div>
        }
        createLabel="Record stock"
        onCreate={() => {
          setFormError(null)
          setDialog({
            type: 'create',
            preset: { divisionId, categoryId },
          })
        }}
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        meta={meta}
        onPageChange={setPage}
        isLoading={isLoading && !data}
        isError={isError}
        isFiltered={Boolean(divisionId || categoryId || status)}
        errorMessage="Unable to load inventory."
        emptyMessage={
          divisionId || categoryId || status || appliedSearch
            ? 'No batches match these filters'
            : 'No stock yet'
        }
        emptyHint="Record opening stock or a purchase for a product."
      />

      <Modal
        open={dialog?.type === 'view'}
        title="Batch details"
        size="lg"
        onClose={() => setDialog(null)}
      >
        {dialog?.type === 'view' ? (
          <InventoryDetails
            batchId={dialog.batch.id}
            onClose={() => setDialog(null)}
            onRecord={() => openMovement(dialog.batch)}
          />
        ) : null}
      </Modal>

      <Modal
        open={dialog?.type === 'create'}
        title="Record stock"
        size="lg"
        onClose={() => setDialog(null)}
      >
        {dialog?.type === 'create' ? (
          <StockMovementForm
            key={`${dialog.preset?.productId ?? 'new'}-${dialog.preset?.batchChoice ?? 'new'}`}
            defaultValues={emptyStockMovementValues(dialog.preset)}
            divisions={divisions.filter(
              (division) =>
                division.status === 'ACTIVE' ||
                division.id === dialog.preset?.divisionId,
            )}
            isSubmitting={createState.isLoading}
            error={formError}
            onSubmit={handleCreate}
            onCancel={() => setDialog(null)}
          />
        ) : null}
      </Modal>
    </>
  )
}
