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
import { useGetDivisionsQuery } from '../../divisions/api'
import type { Division } from '../../divisions/types'
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from '../api'
import type { CategoryFormValues } from '../category-schema'
import type { Category } from '../types'
import { CategoryForm } from './CategoryForm'

const DIVISION_OPTIONS_LIMIT = 100

type DialogState =
  | { type: 'create' }
  | { type: 'edit'; category: Category }
  | { type: 'delete'; category: Category }

function emptyFormValues(divisionId = ''): CategoryFormValues {
  return {
    name: '',
    code: '',
    description: '',
    divisionId,
    status: 'ACTIVE',
  }
}

function valuesFromCategory(category: Category): CategoryFormValues {
  return {
    name: category.name,
    code: category.code,
    description: category.description ?? '',
    divisionId: category.divisionId,
    status: category.status,
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

export function CategoriesWorkspace() {
  const [page, setPage] = useState(DEFAULT_PAGE)
  const [search, setSearch] = useState('')
  const [divisionId, setDivisionId] = useState('')
  const [status, setStatus] = useState('')
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)
  const toast = useToast()

  const { data, isLoading, isError } = useGetCategoriesQuery({
    page,
    limit: DEFAULT_PAGE_SIZE,
    ...(divisionId ? { divisionId } : {}),
  })
  const { data: divisionsData } = useGetDivisionsQuery({
    page: DEFAULT_PAGE,
    limit: DIVISION_OPTIONS_LIMIT,
  })
  const [createCategory, createState] = useCreateCategoryMutation()
  const [updateCategory, updateState] = useUpdateCategoryMutation()
  const [deleteCategory, deleteState] = useDeleteCategoryMutation()

  const divisions = divisionsData?.data ?? []

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
        item.division.name,
        item.division.code,
      ])
    })
  }, [data?.data, search, status])

  const meta = data?.meta ?? {
    page,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  }

  const columns: TableColumn<Category>[] = [
    {
      id: 'name',
      header: 'Category',
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
      id: 'division',
      header: 'Division',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.division.name}</p>
          <p className="text-xs text-slate-500">{row.division.code}</p>
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
      className: 'text-right',
      render: (row) => (
        <RowActions
          onEdit={() => {
            setFormError(null)
            setDialog({ type: 'edit', category: row })
          }}
          onDelete={() => setDialog({ type: 'delete', category: row })}
        />
      ),
    },
  ]

  async function handleCreate(values: CategoryFormValues) {
    setFormError(null)
    const description = optionalText(values.description)

    try {
      await createCategory({
        name: values.name,
        code: values.code,
        divisionId: values.divisionId,
        ...(description ? { description } : {}),
        ...(values.image ? { image: values.image } : {}),
      }).unwrap()
      setPage(DEFAULT_PAGE)
      setDialog(null)
      toast.success('Category created.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to create category.')
      setFormError(message)
      toast.error(message)
    }
  }

  async function handleEdit(category: Category, values: CategoryFormValues) {
    setFormError(null)
    try {
      await updateCategory({
        id: category.id,
        body: {
          name: values.name,
          code: values.code,
          divisionId: values.divisionId,
          description: optionalText(values.description) ?? '',
          ...(values.image ? { image: values.image } : {}),
        },
      }).unwrap()
      setDialog(null)
      toast.success('Category updated.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to update category.')
      setFormError(message)
      toast.error(message)
    }
  }

  async function handleStatusToggle(category: Category) {
    const nextStatus = nextResourceStatus(category.status)
    setStatusUpdatingId(category.id)

    try {
      await updateCategory({
        id: category.id,
        body: { status: nextStatus },
      }).unwrap()
      toast.success(
        nextStatus === 'ACTIVE'
          ? 'Category activated.'
          : 'Category deactivated.',
      )
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Unable to update category status.'),
      )
    } finally {
      setStatusUpdatingId(null)
    }
  }

  async function handleDelete(category: Category) {
    setFormError(null)
    try {
      await deleteCategory(category.id).unwrap()
      if (meta.page > 1 && rows.length <= 1) {
        setPage(meta.page - 1)
      }
      setDialog(null)
      toast.success('Category deleted.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to delete category.')
      setFormError(message)
      toast.error(message)
    }
  }

  const editDivisions =
    dialog?.type === 'edit'
      ? divisionOptionsForForm(divisions, dialog.category.divisionId)
      : divisionOptionsForForm(divisions)

  return (
    <>
      <ResourceTable
        title="Categories"
        description="Group products under a division."
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter this page by name, code, or division"
        toolbarExtra={
          <div className="grid w-full gap-3 sm:grid-cols-2 xl:max-w-lg">
            <SelectField
              label="Division"
              name="category-division"
              value={divisionId}
              onChange={(event) => {
                setDivisionId(event.target.value)
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
              label="Status"
              name="category-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </SelectField>
          </div>
        }
        createLabel="Create category"
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
        errorMessage="Unable to load categories."
        emptyMessage={
          divisionId ? 'No categories in this division' : 'No categories yet'
        }
        emptyHint="Create a category under a division."
      />

      <Modal
        open={dialog?.type === 'create'}
        title="Create category"
        onClose={() => setDialog(null)}
      >
        <CategoryForm
          key="create"
          defaultValues={emptyFormValues()}
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
        title="Edit category"
        onClose={() => setDialog(null)}
      >
        {dialog?.type === 'edit' ? (
          <CategoryForm
            key={dialog.category.id}
            defaultValues={valuesFromCategory(dialog.category)}
            currentImageUrl={dialog.category.imageUrl}
            divisions={editDivisions}
            submitLabel="Save changes"
            isSubmitting={updateState.isLoading && !statusUpdatingId}
            error={formError}
            onSubmit={(values) => handleEdit(dialog.category, values)}
            onCancel={() => setDialog(null)}
          />
        ) : null}
      </Modal>

      <Modal
        open={dialog?.type === 'delete'}
        title="Delete category"
        onClose={() => setDialog(null)}
      >
        {dialog?.type === 'delete' ? (
          <div>
            <p className="text-sm text-slate-600">
              Delete <span className="font-medium text-slate-900">{dialog.category.name}</span>?
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
                onClick={() => handleDelete(dialog.category)}
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
