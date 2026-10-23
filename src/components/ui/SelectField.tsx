import type { ReactNode, Ref, SelectHTMLAttributes } from 'react'

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
  srOnlyLabel?: boolean
  hint?: string
  children: ReactNode
  ref?: Ref<HTMLSelectElement>
}

export function SelectField({
  label,
  error,
  srOnlyLabel = false,
  hint,
  id,
  className = '',
  children,
  ref,
  ...props
}: SelectFieldProps) {
  const selectId = id ?? props.name

  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label
        htmlFor={selectId}
        className={
          srOnlyLabel ? 'sr-only' : 'text-sm font-medium text-slate-700'
        }
      >
        {label}
      </label>
      <select
        id={selectId}
        ref={ref}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
        }
        className={`h-12 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15 disabled:bg-slate-50 disabled:text-slate-500 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
            : 'border-slate-200'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p id={`${selectId}-error`} className="text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
