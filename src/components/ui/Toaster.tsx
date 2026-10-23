import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { dismissToast, type ToastItem } from '../../store/slices/toast-slice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { IconAlert, IconCheck, IconClose } from './icons'

const AUTO_DISMISS_MS = 4000

export function Toaster() {
  const items = useAppSelector((state) => state.toast?.items ?? [])

  return createPortal(
    <div
      className="pointer-events-none fixed top-4 right-4 z-[80] flex w-[min(100%-2rem,24rem)] flex-col gap-2"
      aria-live="polite"
      aria-relevant="additions"
      data-toaster=""
    >
      {items.map((item) => (
        <ToastCard key={item.id} toast={item} />
      ))}
    </div>,
    document.body,
  )
}

function ToastCard({ toast }: { toast: ToastItem }) {
  const dispatch = useAppDispatch()
  const isError = toast.variant === 'error'

  useEffect(() => {
    const timer = window.setTimeout(() => {
      dispatch(dismissToast(toast.id))
    }, AUTO_DISMISS_MS)

    return () => window.clearTimeout(timer)
  }, [dispatch, toast.id])

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white px-4 py-3 shadow-[0_18px_40px_-24px_rgba(15,42,46,0.45)] ${
        isError ? 'border-red-200' : 'border-teal-200'
      }`}
    >
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isError ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-800'
        }`}
      >
        {isError ? <IconAlert className="h-4 w-4" /> : <IconCheck className="h-4 w-4" />}
      </span>
      <p className="min-w-0 flex-1 pt-1 text-sm font-medium text-slate-800">{toast.message}</p>
      <button
        type="button"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        aria-label="Dismiss notification"
        onClick={() => dispatch(dismissToast(toast.id))}
      >
        <IconClose className="h-4 w-4" />
      </button>
    </div>
  )
}
