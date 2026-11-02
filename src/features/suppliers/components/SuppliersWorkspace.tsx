import { useMemo, useState } from 'react'
import { Button } from '../../../components/ui/Button'
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
import {
  useCreateSupplierMutation,
  useDeleteSupplierMutation,
  useGetSuppliersQuery,
  useUpdateSupplierMutation,
} from '../api'
import type { SupplierFormValues } from '../supplier-schema'
import type { Supplier } from '../types'
import { SupplierForm } from './SupplierForm'

type DialogState =
  | { type: 'create' }
  | { type: 'edit'; supplier: Supplier }
  | { type: 'delete'; supplier: Supplier }

function emptyFormValues(): SupplierFormValues {
  return {
    name: '',
    code: '',
    contactName: '',
    email: '',
    phone: '',
    notes: '',
    status: 'ACTIVE',
  }
}

function valuesFromSupplier(supplier: Supplier): SupplierFormValues {
  return {
    name: supplier.name,
    code: supplier.code,
    contactName: supplier.contactName ?? '',
    email: supplier.email ?? '',
    phone: supplier.phone ?? '',
    notes: supplier.notes ?? '',
    status: supplier.status,
  }
}

function optionalText(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export function SuppliersWorkspace() {
  const [page, setPage] = useState(DEFAULT_PAGE)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)
  const toast = useToast()

  const { data, isLoading, isError } = useGetSuppliersQuery({
    page,
    limit: DEFAULT_PAGE_SIZE,
  })
  const [createSupplier, createState] = useCreateSupplierMutation()
  const [updateSupplier, updateState] = useUpdateSupplierMutation()
  const [deleteSupplier, deleteState] = useDeleteSupplierMutation()

  const rows = useMemo(() => {
    const items = data?.data ?? []

    return items.filter((item) => {
      if (status && item.status !== status) {
        return false
      }

      return matchesQuery(search, [
        item.name,
        item.code,
        item.contactName,
        item.email,
        item.status,
      ])
    })
  }, [data?.data, search, status])

  const meta = data?.meta ?? {
    page,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  }

  const columns: TableColumn<Supplier>[] = [
    {
      id: 'name',
      header: 'Supplier',
      mobilePrimary: true,
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">{row.contactName ?? row.email ?? row.code}</p>
        </div>
      ),
    },
    {
      id: 'code',
      header: 'Code',
      render: (row) => row.code,
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
      className: 'text-right',
      render: (row) => (
        <RowActions
          onEdit={() => {
            setFormError(null)
            setDialog({ type: 'edit', supplier: row })
          }}
          onDelete={() => setDialog({ type: 'delete', supplier: row })}
        />
      ),
    },
  ]

  async function handleCreate(values: SupplierFormValues) {
    setFormError(null)
    try {
      await createSupplier({
        name: values.name,
        code: values.code,
        ...(optionalText(values.contactName)
          ? { contactName: optionalText(values.contactName) }
          : {}),
        ...(optionalText(values.email) ? { email: optionalText(values.email) } : {}),
        ...(optionalText(values.phone) ? { phone: optionalText(values.phone) } : {}),
        ...(optionalText(values.notes) ? { notes: optionalText(values.notes) } : {}),
      }).unwrap()
      setPage(DEFAULT_PAGE)
      setDialog(null)
      toast.success('Supplier created.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to create supplier.')
      setFormError(message)
      toast.error(message)
    }
  }

  async function handleEdit(supplier: Supplier, values: SupplierFormValues) {
    setFormError(null)
    try {
      await updateSupplier({
        id: supplier.id,
        body: {
          name: values.name,
          code: values.code,
          contactName: optionalText(values.contactName),
          email: optionalText(values.email),
          phone: optionalText(values.phone),
          notes: optionalText(values.notes),
        },
      }).unwrap()
      setDialog(null)
      toast.success('Supplier updated.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to update supplier.')
      setFormError(message)
      toast.error(message)
    }
  }

  async function handleStatusToggle(supplier: Supplier) {
    setStatusUpdatingId(supplier.id)
    try {
      await updateSupplier({
        id: supplier.id,
        body: { status: nextResourceStatus(supplier.status) },
      }).unwrap()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to update supplier status.'))
    } finally {
      setStatusUpdatingId(null)
    }
  }

  async function handleDelete(supplier: Supplier) {
    setFormError(null)
    try {
      await deleteSupplier(supplier.id).unwrap()
      setDialog(null)
      toast.success('Supplier deleted.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to delete supplier.')
      setFormError(message)
      toast.error(message)
    }
  }

  return (
    <>
      <ResourceTable
        title="Suppliers"
        description="Wholesalers used on draft purchase orders. Assigning a supplier does not change stock."
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(DEFAULT_PAGE)
        }}
        searchPlaceholder="Search suppliers"
        createLabel="Create supplier"
        onCreate={() => {
          setFormError(null)
          setDialog({ type: 'create' })
        }}
        toolbarExtra={
          <SelectField
            label="Status"
            srOnlyLabel
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(DEFAULT_PAGE)
            }}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </SelectField>
        }
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        meta={meta}
        onPageChange={setPage}
        isLoading={isLoading && !data}
        isError={isError}
        isFiltered={Boolean(status)}
        errorMessage="Unable to load suppliers."
        emptyMessage="No suppliers yet"
        emptyHint="Create a supplier before confirming a purchase order."
      />

      <Modal
        open={dialog?.type === 'create'}
        title="Create supplier"
        onClose={() => setDialog(null)}
      >
        <SupplierForm
          key="create"
          defaultValues={emptyFormValues()}
          submitLabel="Create"
          isSubmitting={createState.isLoading}
          error={formError}
          onSubmit={handleCreate}
          onCancel={() => setDialog(null)}
        />
      </Modal>

      <Modal
        open={dialog?.type === 'edit'}
        title="Edit supplier"
        onClose={() => setDialog(null)}
      >
        {dialog?.type === 'edit' ? (
          <SupplierForm
            key={dialog.supplier.id}
            defaultValues={valuesFromSupplier(dialog.supplier)}
            submitLabel="Save changes"
            isSubmitting={updateState.isLoading && !statusUpdatingId}
            error={formError}
            onSubmit={(values) => handleEdit(dialog.supplier, values)}
            onCancel={() => setDialog(null)}
          />
        ) : null}
      </Modal>

      <Modal
        open={dialog?.type === 'delete'}
        title="Delete supplier"
        onClose={() => setDialog(null)}
      >
        {dialog?.type === 'delete' ? (
          <div>
            <p className="text-sm text-slate-600">
              Delete <span className="font-medium text-slate-900">{dialog.supplier.name}</span>?
              Open purchase orders must be cancelled first.
            </p>
            {formError ? (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" width="auto" onClick={() => setDialog(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                width="auto"
                disabled={deleteState.isLoading}
                onClick={() => handleDelete(dialog.supplier)}
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
