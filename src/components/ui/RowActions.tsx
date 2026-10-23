import { IconEye, IconPencil, IconTrash } from './icons'

type RowActionsProps = {
  onView?: () => void
  onEdit: () => void
  onDelete: () => void
}

const actionClassName =
  'inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-white shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2'

export function RowActions({ onView, onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="inline-flex items-center justify-end gap-1.5">
      {onView ? (
        <button
          type="button"
          className={`${actionClassName} border-slate-200 text-slate-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 focus-visible:outline-teal-700`}
          aria-label="View"
          title="View"
          onClick={onView}
        >
          <IconEye className="h-4 w-4" />
        </button>
      ) : null}
      <button
        type="button"
        className={`${actionClassName} border-slate-200 text-slate-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 focus-visible:outline-teal-700`}
        aria-label="Edit"
        title="Edit"
        onClick={onEdit}
      >
        <IconPencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={`${actionClassName} border-slate-200 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-red-600`}
        aria-label="Delete"
        title="Delete"
        onClick={onDelete}
      >
        <IconTrash className="h-4 w-4" />
      </button>
    </div>
  )
}
