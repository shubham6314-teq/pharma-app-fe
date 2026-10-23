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
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  type PaginatedResponse,
} from '../../../lib/pagination'
import type { CatalogUnitFormValues } from '../catalog-unit-schema'
import type {
  CatalogUnit,
  CreateCatalogUnitPayload,
  ListCatalogUnitsQuery,
  UpdateCatalogUnitPayload,
} from '../types'
import { CatalogUnitForm } from './CatalogUnitForm'

type QueryResult = {
  data?: PaginatedResponse<CatalogUnit>
  isLoading: boolean
  isError: boolean
}

type MutationState = {
  isLoading: boolean
}

type MutationHook<Arg> = () => readonly [
  (arg: Arg) => { unwrap: () => Promise<unknown> },
  MutationState,
]

type CatalogUnitsWorkspaceProps = {
  title: string
  description: string
  createLabel: string
  entityLabel: string
  singularHint: string
  pluralHint: string
  useListQuery: (query: ListCatalogUnitsQuery) => QueryResult
  useCreateMutation: MutationHook<CreateCatalogUnitPayload>
  useUpdateMutation: MutationHook<{
    id: string
    body: UpdateCatalogUnitPayload
  }>
  useDeleteMutation: MutationHook<string>
}

type DialogState =
  | { type: 'create' }
  | { type: 'edit'; unit: CatalogUnit }
  | { type: 'delete'; unit: CatalogUnit }

function emptyFormValues(): CatalogUnitFormValues {
  return {
    name: '',
    code: '',
    singularLabel: '',
    pluralLabel: '',
    sortOrder: 0,
    status: 'ACTIVE',
  }
}

function valuesFromUnit(unit: CatalogUnit): CatalogUnitFormValues {
  return {
    name: unit.name,
    code: unit.code,
    singularLabel: unit.singularLabel,
    pluralLabel: unit.pluralLabel,
    sortOrder: unit.sortOrder,
    status: unit.status,
  }
}

export function CatalogUnitsWorkspace({
  title,
  description,
  createLabel,
  entityLabel,
  singularHint,
  pluralHint,
  useListQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
}: CatalogUnitsWorkspaceProps) {
  const [page, setPage] = useState(DEFAULT_PAGE)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)
  const toast = useToast()

  const { data, isLoading, isError } = useListQuery({
    page,
    limit: DEFAULT_PAGE_SIZE,
  })
  const [createUnit, createState] = useCreateMutation()
  const [updateUnit, updateState] = useUpdateMutation()
  const [deleteUnit, deleteState] = useDeleteMutation()

  const rows = useMemo(() => {
    const items = data?.data ?? []

    return items.filter((item) => {
      if (status && item.status !== status) {
        return false
      }

      return matchesQuery(search, [
        item.name,
        item.code,
        item.singularLabel,
        item.pluralLabel,
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

  const columns: TableColumn<CatalogUnit>[] = [
    {
      id: 'name',
      header: 'Name',
      mobilePrimary: true,
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">
            {row.singularLabel} / {row.pluralLabel}
          </p>
        </div>
      ),
    },
    {
      id: 'code',
      header: 'Code',
      render: (row) => row.code,
    },
    {
      id: 'sortOrder',
      header: 'Order',
      render: (row) => row.sortOrder,
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
            setDialog({ type: 'edit', unit: row })
          }}
          onDelete={() => setDialog({ type: 'delete', unit: row })}
        />
      ),
    },
  ]

  async function handleCreate(values: CatalogUnitFormValues) {
    setFormError(null)
    try {
      await createUnit({
        name: values.name,
        code: values.code,
        singularLabel: values.singularLabel,
        pluralLabel: values.pluralLabel,
        sortOrder: values.sortOrder,
      }).unwrap()
      setPage(DEFAULT_PAGE)
      setDialog(null)
      toast.success(`${entityLabel} created.`)
    } catch (error) {
      const message = getApiErrorMessage(error, `Unable to create ${entityLabel.toLowerCase()}.`)
      setFormError(message)
      toast.error(message)
    }
  }

  async function handleEdit(unit: CatalogUnit, values: CatalogUnitFormValues) {
    setFormError(null)
    try {
      await updateUnit({
        id: unit.id,
        body: {
          name: values.name,
          code: values.code,
          singularLabel: values.singularLabel,
          pluralLabel: values.pluralLabel,
          sortOrder: values.sortOrder,
        },
      }).unwrap()
      setDialog(null)
      toast.success(`${entityLabel} updated.`)
    } catch (error) {
      const message = getApiErrorMessage(error, `Unable to update ${entityLabel.toLowerCase()}.`)
      setFormError(message)
      toast.error(message)
    }
  }

  async function handleStatusToggle(unit: CatalogUnit) {
    const nextStatus = nextResourceStatus(unit.status)
    setStatusUpdatingId(unit.id)

    try {
      await updateUnit({
        id: unit.id,
        body: { status: nextStatus },
      }).unwrap()
      toast.success(
        nextStatus === 'ACTIVE'
          ? `${entityLabel} activated.`
          : `${entityLabel} deactivated.`,
      )
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, `Unable to update ${entityLabel.toLowerCase()} status.`),
      )
    } finally {
      setStatusUpdatingId(null)
    }
  }

  async function handleDelete(unit: CatalogUnit) {
    setFormError(null)
    try {
      await deleteUnit(unit.id).unwrap()
      if (meta.page > 1 && rows.length <= 1) {
        setPage(meta.page - 1)
      }
      setDialog(null)
      toast.success(`${entityLabel} deleted.`)
    } catch (error) {
      const message = getApiErrorMessage(error, `Unable to delete ${entityLabel.toLowerCase()}.`)
      setFormError(message)
      toast.error(message)
    }
  }

  return (
    <>
      <ResourceTable
        title={title}
        description={description}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter this page by name or code"
        toolbarExtra={
          <div className="xl:max-w-xs">
            <SelectField
              label="Status"
              name={`${title}-status`}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </SelectField>
          </div>
        }
        createLabel={createLabel}
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
        errorMessage={`Unable to load ${title.toLowerCase()}.`}
        emptyMessage={`No ${title.toLowerCase()} yet`}
        emptyHint={`Add a ${entityLabel.toLowerCase()} so products can use it.`}
      />

      <Modal
        open={dialog?.type === 'create'}
        title={`Create ${entityLabel.toLowerCase()}`}
        onClose={() => setDialog(null)}
      >
        <CatalogUnitForm
          key="create"
          defaultValues={emptyFormValues()}
          submitLabel="Create"
          isSubmitting={createState.isLoading}
          error={formError}
          singularHint={singularHint}
          pluralHint={pluralHint}
          onSubmit={handleCreate}
          onCancel={() => setDialog(null)}
        />
      </Modal>

      <Modal
        open={dialog?.type === 'edit'}
        title={`Edit ${entityLabel.toLowerCase()}`}
        onClose={() => setDialog(null)}
      >
        {dialog?.type === 'edit' ? (
          <CatalogUnitForm
            key={dialog.unit.id}
            defaultValues={valuesFromUnit(dialog.unit)}
            submitLabel="Save changes"
            isSubmitting={updateState.isLoading && !statusUpdatingId}
            error={formError}
            singularHint={singularHint}
            pluralHint={pluralHint}
            onSubmit={(values) => handleEdit(dialog.unit, values)}
            onCancel={() => setDialog(null)}
          />
        ) : null}
      </Modal>

      <Modal
        open={dialog?.type === 'delete'}
        title={`Delete ${entityLabel.toLowerCase()}`}
        onClose={() => setDialog(null)}
      >
        {dialog?.type === 'delete' ? (
          <div>
            <p className="text-sm text-slate-600">
              Delete <span className="font-medium text-slate-900">{dialog.unit.name}</span>?
              Products using it must be changed first.
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
                onClick={() => handleDelete(dialog.unit)}
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
