import { resolveMediaUrl } from '../../lib/media-url'
import { Thumbnail } from './Thumbnail'

type EntityCellProps = {
  title: string
  imageUrl?: string | null
  subtitle?: string | null
  meta?: string | null
}

export function EntityCell({
  title,
  imageUrl,
  subtitle,
  meta,
}: EntityCellProps) {
  const src = resolveMediaUrl(imageUrl)

  return (
    <div className="flex min-w-0 items-center gap-3">
      {src ? (
        <Thumbnail src={src} alt={title} />
      ) : (
        <span
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-[10px] font-medium uppercase tracking-wide text-slate-400"
          aria-hidden="true"
        >
          —
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-900">{title}</p>
        {subtitle ? (
          <p className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</p>
        ) : null}
        {meta ? (
          <p className="mt-0.5 truncate text-xs text-slate-500">{meta}</p>
        ) : null}
      </div>
    </div>
  )
}
