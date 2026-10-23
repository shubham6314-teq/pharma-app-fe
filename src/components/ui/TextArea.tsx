import type { TextareaHTMLAttributes, Ref } from 'react'

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string
  ref?: Ref<HTMLTextAreaElement>
}

export function TextArea({
  label,
  error,
  id,
  className = '',
  ref,
  ...props
}: TextAreaProps) {
  const inputId = id ?? props.name

  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        id={inputId}
        ref={ref}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`min-h-24 w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15 ${
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' : 'border-slate-200'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}
