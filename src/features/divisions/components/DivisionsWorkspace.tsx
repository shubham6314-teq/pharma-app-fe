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
import {
  useCreateDivisionMutation,
  useDeleteDivisionMutation,
  useGetDivisionsQuery,
  useUpdateDivisionMutation,
} from '../api'
import type { DivisionFormValues } from '../division-schema'
import type { Division } from '../types'
import { DivisionForm } from './DivisionForm'

type DialogState =
  | { type: 'create' }
  | { type: 'edit'; division: Division }
  | { type: 'delete'; division: Division }

function emptyFormValues(): DivisionFormValues {
  return {
    name: '',
    code: '',
    description: '',
    status: 'ACTIVE',
  }
}

function valuesFromDivision(division: Division): DivisionFormValues {
  return {
    name: division.name,
    code: division.code,
    description: division.description ?? '',
    status: division.status,
  }
}

function optionalText(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export function DivisionsWorkspace() {
  const [page, setPage] = useState(DEFAULT_PAGE)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)
  const toast = useToast()

  const { data, isLoading, isError } = useGetDivisionsQuery({
    page,
    limit: DEFAULT_PAGE_SIZE,
  })
  const [createDivision, createState] = useCreateDivisionMutation()
  const [updateDivision, updateState] = useUpdateDivisionMutation()
  const [deleteDivision, deleteState] = useDeleteDivisionMutation()

  const rows = useMemo(() => {
    const items = data?.data ?? []

    return items.filter((item) => {
      if (status && item.status !== status) {
        return false
      }

      return matchesQuery(search, [
        item.name,
        item.code,
        item.description,
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

  const columns: TableColumn<Division>[] = [
    {
      id: 'name',
      header: 'Division',
      mobilePrimary: true,
      render: (row) => (
        <EntityCell
          title={row.name}
          imageUrl={row.imageUrl}
          subtitle={row.description}
        />
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
            setDialog({ type: 'edit', division: row })
          }}
          onDelete={() => setDialog({ type: 'delete', division: row })}
        />
      ),
    },
  ]

  async function handleCreate(values: DivisionFormValues) {
    setFormError(null)
    const description = optionalText(values.description)

    try {
      await createDivision({
        name: values.name,
        code: values.code,
        ...(description ? { description } : {}),
        ...(values.image ? { image: values.image } : {}),
      }).unwrap()
      setPage(DEFAULT_PAGE)
      setDialog(null)
      toast.success('Division created.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to create division.')
      setFormError(message)
      toast.error(message)
    }
  }

  async function handleEdit(division: Division, values: DivisionFormValues) {
    setFormError(null)
    try {
      await updateDivision({
        id: division.id,
        body: {
          name: values.name,
          code: values.code,
          description: optionalText(values.description) ?? '',
          ...(values.image ? { image: values.image } : {}),
        },
      }).unwrap()
      setDialog(null)
      toast.success('Division updated.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to update division.')
      setFormError(message)
      toast.error(message)
    }
  }

  async function handleStatusToggle(division: Division) {
    const nextStatus = nextResourceStatus(division.status)
    setStatusUpdatingId(division.id)

    try {
      await updateDivision({
        id: division.id,
        body: { status: nextStatus },
      }).unwrap()
      toast.success(
        nextStatus === 'ACTIVE'
          ? 'Division activated.'
          : 'Division deactivated.',
      )
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Unable to update division status.'),
      )
    } finally {
      setStatusUpdatingId(null)
    }
  }

  async function handleDelete(division: Division) {
    setFormError(null)
    try {
      await deleteDivision(division.id).unwrap()
      if (meta.page > 1 && rows.length <= 1) {
        setPage(meta.page - 1)
      }
      setDialog(null)
      toast.success('Division deleted.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to delete division.')
      setFormError(message)
      toast.error(message)
    }
  }

  return (
    <>
      <ResourceTable
        title="Divisions"
        description="Organize medicines by division."
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter this page by name, code, or status"
        toolbarExtra={
          <div className="w-full xl:w-44">
            <SelectField
              label="Status"
              name="division-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </SelectField>
          </div>
        }
        createLabel="Create division"
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
        errorMessage="Unable to load divisions."
        emptyMessage="No divisions yet"
        emptyHint="Create a division to start grouping medicines."
      />

      <Modal
        open={dialog?.type === 'create'}
        title="Create division"
        onClose={() => setDialog(null)}
      >
        <DivisionForm
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
        title="Edit division"
        onClose={() => setDialog(null)}
      >
        {dialog?.type === 'edit' ? (
          <DivisionForm
            key={dialog.division.id}
            defaultValues={valuesFromDivision(dialog.division)}
            currentImageUrl={dialog.division.imageUrl}
            submitLabel="Save changes"
            isSubmitting={updateState.isLoading && !statusUpdatingId}
            error={formError}
            onSubmit={(values) => handleEdit(dialog.division, values)}
            onCancel={() => setDialog(null)}
          />
        ) : null}
      </Modal>

      <Modal
        open={dialog?.type === 'delete'}
        title="Delete division"
        onClose={() => setDialog(null)}
      >
        {dialog?.type === 'delete' ? (
          <div>
            <p className="text-sm text-slate-600">
              Delete <span className="font-medium text-slate-900">{dialog.division.name}</span>?
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
                onClick={() => handleDelete(dialog.division)}
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
