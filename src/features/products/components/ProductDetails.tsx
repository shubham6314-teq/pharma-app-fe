import type { ReactNode } from 'react'
import { Button } from '../../../components/ui/Button'
import { IconPencil } from '../../../components/ui/icons'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { Thumbnail } from '../../../components/ui/Thumbnail'
import { resolveMediaUrl } from '../../../lib/media-url'
import type { Product } from '../types'
import { formatPackContent } from '../units'

type ProductDetailsProps = {
  product: Product
  onEdit: () => void
  onClose: () => void
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function displayText(value: string | null | undefined): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : '—'
}

export function ProductDetails({ product, onEdit, onClose }: ProductDetailsProps) {
  const imageSrc = resolveMediaUrl(product.imageUrl)

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {imageSrc ? (
          <Thumbnail src={imageSrc} alt={product.name} size="md" viewer />
        ) : (
          <span
            className="inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-400"
            aria-hidden="true"
          >
            No image
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
              {product.name}
            </h3>
            <StatusBadge status={product.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {product.brandName} · {product.code}
          </p>
          <p className="mt-2 text-sm text-slate-600">{displayText(product.composition)}</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <DetailField label="Division">
          {displayText(product.category.division?.name)}
        </DetailField>
        <DetailField label="Category">{product.category.name}</DetailField>
        <DetailField label="Brand name">{product.brandName}</DetailField>
        <DetailField label="Code">{product.code}</DetailField>
        <DetailField label="Packaging size">{product.packSize}</DetailField>
        <DetailField label="Pack content">
          {formatPackContent(
            product.contentQuantity,
            product.contentUnit,
            product.packUnit,
          )}
        </DetailField>
        <DetailField label="Reorder level">
          {product.reorderLevel > 0 ? `${product.reorderLevel} packs` : 'Off'}
        </DetailField>
        <DetailField label="Status">
          <StatusBadge status={product.status} />
        </DetailField>
        <DetailField label="MRP">{formatMoney(product.mrp)}</DetailField>
        <DetailField label="Discount">{product.discountPercent}%</DetailField>
        <DetailField label="Selling price">{formatMoney(product.sellingPrice)}</DetailField>
        <DetailField label="Created">{formatDateTime(product.createdAt)}</DetailField>
        <DetailField label="Updated">{formatDateTime(product.updatedAt)}</DetailField>
        <DetailField label="Composition" wide>
          {displayText(product.composition)}
        </DetailField>
        <DetailField label="Description" wide>
          {displayText(product.description)}
        </DetailField>
      </dl>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" width="auto" onClick={onClose}>
          Close
        </Button>
        <Button width="auto" onClick={onEdit}>
          <IconPencil className="h-4 w-4" />
          Edit
        </Button>
      </div>
    </div>
  )
}

function DetailField({
  label,
  children,
  wide = false,
}: {
  label: string
  children: ReactNode
  wide?: boolean
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{children}</dd>
    </div>
  )
}
