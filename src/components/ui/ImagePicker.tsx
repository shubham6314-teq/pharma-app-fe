import { useEffect, useRef, useState, type Ref } from 'react'
import { resolveMediaUrl } from '../../lib/media-url'
import { Thumbnail } from './Thumbnail'

type ImagePickerProps = {
  name: string
  value: File | undefined
  currentImageUrl?: string | null
  accept: readonly string[] | string
  alt: string
  error?: string
  hint?: string
  inputRef: Ref<HTMLInputElement>
  onBlur: () => void
  onChange: (file: File | undefined) => void
}

const DEFAULT_HINT = 'Optional JPEG, PNG, WebP, or GIF up to 5MB.'

export function ImagePicker({
  name,
  value,
  currentImageUrl,
  accept,
  alt,
  error,
  hint = DEFAULT_HINT,
  inputRef,
  onBlur,
  onChange,
}: ImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [removedCurrent, setRemovedCurrent] = useState(false)

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  useEffect(() => {
    setRemovedCurrent(false)
  }, [currentImageUrl])

  const imageSrc =
    previewUrl ?? (removedCurrent ? null : resolveMediaUrl(currentImageUrl))
  const acceptValue = typeof accept === 'string' ? accept : accept.join(',')

  function assignRef(node: HTMLInputElement | null) {
    fileInputRef.current = node
    if (typeof inputRef === 'function') {
      inputRef(node)
    } else if (inputRef) {
      inputRef.current = node
    }
  }

  function setFile(file: File | undefined) {
    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current)
      }
      return file instanceof File ? URL.createObjectURL(file) : null
    })
    if (file instanceof File) {
      setRemovedCurrent(false)
    }
    onChange(file)
  }

  function handleRemove() {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setRemovedCurrent(true)
    setFile(undefined)
  }

  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        Image
      </label>
      <input
        id={name}
        name={name}
        ref={assignRef}
        type="file"
        accept={acceptValue}
        onBlur={onBlur}
        onChange={(event) => {
          const file = event.target.files?.[0]
          setFile(file instanceof File ? file : undefined)
        }}
        aria-invalid={Boolean(error)}
        className={`block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-700 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-teal-800 ${
          error ? 'text-red-600' : ''
        }`}
      />
      {value instanceof File ? (
        <p className="text-xs text-slate-500">{value.name}</p>
      ) : null}
      {imageSrc ? (
        <Thumbnail
          src={imageSrc}
          alt={alt}
          size="md"
          viewer
          onRemove={handleRemove}
        />
      ) : null}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : (
        <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  )
}
