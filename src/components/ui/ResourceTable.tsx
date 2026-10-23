import type { ReactNode } from 'react'
import type { PaginationMeta } from '../../lib/pagination'
import { rangeLabel } from '../../lib/pagination'
import { Button } from './Button'
import { PagePanel } from './PagePanel'
import { TextField } from './TextField'

export type TableColumn<T> = {
  id: string
  header: string
  className?: string
  hideOnMobile?: boolean
  mobilePrimary?: boolean
  render: (row: T) => ReactNode
}

type ResourceTableProps<T> = {
  title: string
  description: string
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  toolbarExtra?: ReactNode
  createLabel?: string
  onCreate?: () => void
  columns: TableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  meta: PaginationMeta
  onPageChange: (page: number) => void
  isLoading?: boolean
  isError?: boolean
  isFiltered?: boolean
  errorMessage?: string
  emptyMessage?: string
  emptyHint?: string
}

const SKELETON_ROWS = 6

function splitColumns<T>(columns: TableColumn<T>[]) {
  const actions = columns.find((column) => column.id === 'actions')
  const dataColumns = columns.filter((column) => column.id !== 'actions')
  const primary =
    dataColumns.find((column) => column.mobilePrimary) ?? dataColumns[0]
  const details = dataColumns.filter(
    (column) => column !== primary && !column.hideOnMobile,
  )

  return { actions, primary, details }
}

export function ResourceTable<T>({
  title,
  description,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search',
  toolbarExtra,
  createLabel,
  onCreate,
  columns,
  rows,
  rowKey,
  meta,
  onPageChange,
  isLoading = false,
  isError = false,
  isFiltered = false,
  errorMessage = 'Unable to load this list.',
  emptyMessage = 'No records yet',
  emptyHint,
}: ResourceTableProps<T>) {
  const hasQuery = searchValue.trim().length > 0 || isFiltered
  const showEmpty = !isLoading && !isError && rows.length === 0
  const { actions, primary, details } = splitColumns(columns)

  return (
    <PagePanel
      title={title}
      description={description}
      actions={
        onCreate && createLabel ? (
          <Button width="auto" type="button" onClick={onCreate}>
            {createLabel}
          </Button>
        ) : null
      }
    >
      <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
        <div
          className={
            toolbarExtra
              ? "flex flex-col justify-between gap-3 xl:flex-row xl:items-end"
              : undefined
          }
        >
          <div className="min-w-0 flex-1 xl:max-w-sm">
            <TextField
              label="Search"
              srOnlyLabel
              type="search"
              name="resource-search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          {toolbarExtra}
        </div>
      </div>

      {isLoading ? (
        <LoadingState columns={columns} primary={Boolean(primary)} />
      ) : null}

      {isError ? (
        <p className="px-5 py-12 text-center text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {showEmpty ? (
        <EmptyState
          title={hasQuery ? "No matching results" : emptyMessage}
          hint={
            hasQuery
              ? "Try a different search or clear the filters."
              : emptyHint
          }
          actionLabel={!hasQuery ? createLabel : undefined}
          onAction={!hasQuery ? onCreate : undefined}
        />
      ) : null}

      {!isLoading && !isError && !showEmpty ? (
        <>
          <ul className="divide-y divide-slate-100 md:hidden">
            {rows.map((row) => (
              <li key={rowKey(row)} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {primary ? primary.render(row) : null}
                  </div>
                  {actions ? (
                    <div className="shrink-0">{actions.render(row)}</div>
                  ) : null}
                </div>
                {details.length > 0 ? (
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
                    {details.map((column) => (
                      <div key={column.id}>
                        <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          {column.header}
                        </dt>
                        <dd className="mt-0.5 text-sm text-slate-800">
                          {column.render(row)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.id}
                      scope="col"
                      className={`whitespace-nowrap px-5 py-3 ${column.className ?? ""}`}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={rowKey(row)}
                    className="border-t border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50/70"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={`px-5 py-3.5 align-middle text-slate-800 ${column.className ?? ""}`}
                      >
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">{rangeLabel(meta)}</p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            width="auto"
            size="sm"
            disabled={meta.page <= 1 || isLoading}
            onClick={() => onPageChange(meta.page - 1)}
          >
            Previous
          </Button>
          <p className="min-w-20 text-center text-sm text-slate-600">
            Page {meta.page} of {Math.max(meta.totalPages, 1)}
          </p>
          <Button
            variant="secondary"
            width="auto"
            size="sm"
            disabled={
              meta.totalPages === 0 || meta.page >= meta.totalPages || isLoading
            }
            onClick={() => onPageChange(meta.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </PagePanel>
  );
}

function LoadingState<T>({
  columns,
  primary,
}: {
  columns: TableColumn<T>[]
  primary: boolean
}) {
  return (
    <>
      <ul className="divide-y divide-slate-100 md:hidden">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <li key={index} className="px-4 py-4">
            <div className="flex items-center gap-3">
              {primary ? (
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-slate-100" />
              ) : null}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={`whitespace-nowrap px-5 py-3 ${column.className ?? ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <tr key={index} className="border-t border-slate-100">
                {columns.map((column) => (
                  <td key={column.id} className="px-5 py-3.5">
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function EmptyState({
  title,
  hint,
  actionLabel,
  onAction,
}: {
  title: string
  hint?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="px-5 py-12 text-center">
      <p className="font-medium text-slate-800">{title}</p>
      {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
      {actionLabel && onAction ? (
        <Button
          className="mt-5"
          width="auto"
          type="button"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
