import type { ReactNode } from 'react'
import { Button } from '../../../components/ui/Button'
import { formatPackContent, formatPackQuantity } from '../../products/units'
import { useGetInventoryBatchQuery } from '../api'
import {
  formatIsoDate,
  formatMoney,
  MOVEMENT_TYPE_LABELS,
} from '../labels'
import { StockStatusBadge } from './StockStatusBadge'

type InventoryDetailsProps = {
  batchId: string
  onClose: () => void
  onRecord: () => void
}

export function InventoryDetails({ batchId, onClose, onRecord }: InventoryDetailsProps) {
  const { data, isLoading, isError } = useGetInventoryBatchQuery(batchId)

  if (isLoading && !data) {
    return <p className="text-sm text-slate-500">Loading batch…</p>
  }

  if (isError || !data) {
    return (
      <div>
        <p className="text-sm text-red-600" role="alert">
          Unable to load this batch.
        </p>
        <div className="mt-6 flex justify-end">
          <Button variant="secondary" width="auto" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">
          {data.product.name}
        </h3>
        <StockStatusBadge status={data.status} />
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {data.product.code} · Batch {data.batchNumber}
      </p>

      <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <DetailField label="Division">{data.product.category.division.name}</DetailField>
        <DetailField label="Category">{data.product.category.name}</DetailField>
        <DetailField label="Packaging">{data.product.packSize}</DetailField>
        <DetailField label="Content">
          {formatPackContent(
            data.product.contentQuantity,
            data.product.contentUnit,
            data.product.packUnit,
          )}
        </DetailField>
        <DetailField label="On hand">
          {formatPackQuantity(data.quantityOnHand, data.product.packUnit)}
        </DetailField>
        <DetailField label="Available for product">
          {formatPackQuantity(data.product.availableQuantity, data.product.packUnit)}
        </DetailField>
        <DetailField label="Manufacturing">{formatIsoDate(data.manufacturingDate)}</DetailField>
        <DetailField label="Expiry">{formatIsoDate(data.expiryDate)}</DetailField>
        <DetailField label="Purchase rate">{formatMoney(data.purchaseRate)}</DetailField>
        <DetailField label="Reorder level">
          {data.product.reorderLevel > 0 ? `${data.product.reorderLevel} packs` : 'Off'}
        </DetailField>
      </dl>

      <h4 className="mt-8 text-sm font-semibold text-slate-900">Movements</h4>
      {data.movements && data.movements.length > 0 ? (
        <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
          {data.movements.map((movement) => (
            <li key={movement.id} className="flex items-start justify-between gap-4 px-3.5 py-3">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {MOVEMENT_TYPE_LABELS[movement.type]}
                </p>
                <p className="text-xs text-slate-500">
                  {new Intl.DateTimeFormat('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(movement.createdAt))}
                  {movement.note ? ` · ${movement.note}` : ''}
                </p>
              </div>
              <p className="text-sm font-medium text-slate-800">
                {movement.quantity > 0 ? '+' : ''}
                {formatPackQuantity(movement.quantity, data.product.packUnit)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No movements recorded.</p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" width="auto" onClick={onClose}>
          Close
        </Button>
        <Button width="auto" onClick={onRecord}>
          Record movement
        </Button>
      </div>
    </div>
  )
}

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-800">{children}</dd>
    </div>
  )
}
