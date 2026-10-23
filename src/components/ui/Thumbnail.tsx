import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconClose, IconEye } from './icons'

const PREVIEW_SIZE_PX = 240
const PREVIEW_GAP_PX = 12

type ThumbnailSize = 'sm' | 'md'

type ThumbnailProps = {
  src: string
  alt: string
  size?: ThumbnailSize
  viewer?: boolean
  onRemove?: () => void
}

const sizeClassName: Record<ThumbnailSize, string> = {
  sm: 'h-10 w-10 rounded-lg',
  md: 'h-20 w-20 rounded-xl',
}

function previewPosition(rect: DOMRect): { top: number; left: number } {
  const viewportPadding = 16
  let left = rect.right + PREVIEW_GAP_PX
  let top = rect.top + rect.height / 2 - PREVIEW_SIZE_PX / 2

  if (left + PREVIEW_SIZE_PX > window.innerWidth - viewportPadding) {
    left = rect.left - PREVIEW_GAP_PX - PREVIEW_SIZE_PX
  }
  if (left < viewportPadding) {
    left = viewportPadding
  }
  if (top + PREVIEW_SIZE_PX > window.innerHeight - viewportPadding) {
    top = window.innerHeight - PREVIEW_SIZE_PX - viewportPadding
  }
  if (top < viewportPadding) {
    top = viewportPadding
  }

  return { top, left }
}

export function Thumbnail({
  src,
  alt,
  size = 'sm',
  viewer = false,
  onRemove,
}: ThumbnailProps) {
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipId = useId()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const hoverOpen = !viewer && (hovered || focused)

  const syncPosition = useCallback(() => {
    const node = triggerRef.current
    if (!node) {
      return
    }
    setPosition(previewPosition(node.getBoundingClientRect()))
  }, [])

  useEffect(() => {
    if (!hoverOpen) {
      return
    }

    syncPosition()

    function handleReposition() {
      syncPosition()
    }

    window.addEventListener('scroll', handleReposition, true)
    window.addEventListener('resize', handleReposition)
    return () => {
      window.removeEventListener('scroll', handleReposition, true)
      window.removeEventListener('resize', handleReposition)
    }
  }, [hoverOpen, syncPosition])

  const image = (
    <span
      ref={triggerRef}
      tabIndex={viewer ? undefined : 0}
      className={`inline-flex overflow-hidden border border-slate-200 outline-none focus-visible:ring-4 focus-visible:ring-teal-600/15 ${
        viewer ? '' : 'cursor-zoom-in '
      }${size === 'md' && !viewer ? 'mt-1 ' : ''}${sizeClassName[size]}`}
      aria-describedby={hoverOpen ? tooltipId : undefined}
      onMouseEnter={viewer ? undefined : () => setHovered(true)}
      onMouseLeave={viewer ? undefined : () => setHovered(false)}
      onFocus={viewer ? undefined : () => setFocused(true)}
      onBlur={viewer ? undefined : () => setFocused(false)}
    >
      <img src={src} alt={alt} className="block h-full w-full object-cover" />
    </span>
  )

  return (
    <>
      {viewer ? (
        <div className={size === 'md' ? 'mt-1 flex items-center gap-2' : 'flex items-center gap-2'}>
          {image}
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
            aria-label={`View larger ${alt}`}
            onClick={() => setLightboxOpen(true)}
          >
            <IconEye className="h-5 w-5" />
          </button>
          {onRemove ? (
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              aria-label={`Remove ${alt}`}
              onClick={onRemove}
            >
              <IconClose className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      ) : (
        image
      )}
      {hoverOpen
        ? createPortal(
            <div
              id={tooltipId}
              role="tooltip"
              className="pointer-events-none fixed z-[90] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-[0_18px_40px_-24px_rgba(15,42,46,0.45)]"
              style={{
                top: position.top,
                left: position.left,
                width: PREVIEW_SIZE_PX,
                height: PREVIEW_SIZE_PX,
              }}
            >
              <img src={src} alt="" className="block h-full w-full object-cover" />
            </div>,
            document.body,
          )
        : null}
      {lightboxOpen ? (
        <ImageLightbox src={src} alt={alt} onClose={() => setLightboxOpen(false)} />
      ) : null}
    </>
  )
}

function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string
  alt: string
  onClose: () => void
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      onClose()
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/60"
        aria-label="Close image preview"
        onClick={onClose}
      />
      <button
        type="button"
        className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm hover:bg-slate-100 hover:text-slate-900"
        aria-label="Close"
        onClick={onClose}
      >
        <IconClose className="h-4 w-4" />
      </button>
      <img
        src={src}
        alt={alt}
        className="pointer-events-none relative z-10 max-h-[85svh] max-w-[min(100%,48rem)] rounded-2xl object-contain shadow-[0_24px_50px_-28px_rgba(15,42,46,0.55)]"
      />
    </div>,
    document.body,
  )
}
