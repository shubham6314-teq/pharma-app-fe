import type { InputHTMLAttributes, ReactNode, Ref } from 'react'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  trailing?: ReactNode
  srOnlyLabel?: boolean
  ref?: Ref<HTMLInputElement>
}

export function TextField({
  label,
  error,
  trailing,
  srOnlyLabel = false,
  id,
  className = '',
  ref,
  ...props
}: TextFieldProps) {
  const inputId = id ?? props.name

  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label
        htmlFor={inputId}
        className={
          srOnlyLabel ? 'sr-only' : 'text-sm font-medium text-slate-700'
        }
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`h-12 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15 ${
            trailing ? 'pr-12' : ''
          } ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' : 'border-slate-200'} ${className}`}
          {...props}
        />
        {trailing ? (
          <div className="absolute inset-y-0 right-1.5 flex items-center">
            {trailing}
          </div>
        ) : null}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}
