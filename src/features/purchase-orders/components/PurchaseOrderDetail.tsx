import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { PagePanel } from '../../../components/ui/PagePanel'
import { SelectField } from '../../../components/ui/SelectField'
import { useGetSuppliersQuery } from '../../suppliers/api'
import {
  useAssignPurchaseOrderSupplierMutation,
  useCancelPurchaseOrderMutation,
  useConfirmPurchaseOrderMutation,
  useGetPurchaseOrderQuery,
} from '../api'
import { purchaseOrderStatusLabel } from '../labels'

export function PurchaseOrderDetail() {
  const { orderId = '' } = useParams()
  const { data, isLoading, isError } = useGetPurchaseOrderQuery(orderId, {
    skip: !orderId,
  })
  const { data: suppliers } = useGetSuppliersQuery({ page: 1, limit: 100 })
  const [assignSupplier, assignState] = useAssignPurchaseOrderSupplierMutation()
  const [confirm, confirmState] = useConfirmPurchaseOrderMutation()
  const [cancel, cancelState] = useCancelPurchaseOrderMutation()
  const [actionError, setActionError] = useState<string | null>(null)
  const line = data?.lines[0]
  const isDraft = data?.status === 'DRAFT'
  const busy = assignState.isLoading || confirmState.isLoading || cancelState.isLoading

  async function onAssign(supplierId: string) {
    if (!data || !supplierId) {
      return
    }
    setActionError(null)
    try {
      await assignSupplier({ id: data.id, supplierId }).unwrap()
    } catch {
      setActionError('The supplier could not be assigned.')
    }
  }

  async function onConfirm() {
    if (!data) {
      return
    }
    setActionError(null)
    try {
      await confirm(data.id).unwrap()
    } catch {
      setActionError(
        data.supplierId
          ? 'The order could not be confirmed.'
          : 'Assign a supplier before confirming this order.',
      )
    }
  }

  async function onCancel() {
    if (!data) {
      return
    }
    setActionError(null)
    try {
      await cancel(data.id).unwrap()
    } catch {
      setActionError('The order could not be cancelled.')
    }
  }

  return (
    <PagePanel
      title={data?.number ?? 'Purchase order'}
      description="A confirmed order is a procurement record only. Record a purchase on Inventory when the goods arrive."
      actions={
        data && data.status !== 'CANCELLED' ? (
          <Button
            width="auto"
            variant="danger"
            disabled={busy}
            onClick={() => {
              void onCancel()
            }}
          >
            Cancel order
          </Button>
        ) : null
      }
    >
      {isLoading ? <p className="px-5 py-8 text-sm text-slate-500">Loading order…</p> : null}
      {isError ? (
        <p className="px-5 py-8 text-sm text-red-700">This order could not be loaded.</p>
      ) : null}
      {data ? (
        <div className="space-y-px bg-slate-100">
          <section className="bg-white p-5">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="font-medium text-slate-900">
                  {purchaseOrderStatusLabel(data.status)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Created by</dt>
                <dd className="font-medium text-slate-900">{data.createdBy.name}</dd>
              </div>
              {line ? (
                <>
                  <div>
                    <dt className="text-slate-500">Product</dt>
                    <dd className="font-medium text-slate-900">
                      {line.product.name} · {line.product.code}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Quantity</dt>
                    <dd className="font-medium text-slate-900">{line.quantity}</dd>
                  </div>
                </>
              ) : null}
            </dl>
            {data.alert ? (
              <Link
                to={`/inventory-alerts/${data.alert.id}`}
                className="mt-4 inline-block text-sm font-medium text-teal-800"
              >
                Open source alert
              </Link>
            ) : null}
          </section>
          <section className="bg-white p-5">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Supplier
            </p>
            {isDraft ? (
              <div className="mt-3 max-w-md">
                <SelectField
                  label="Assign supplier"
                  name="supplierId"
                  value={data.supplierId ?? ''}
                  onChange={(event) => {
                    void onAssign(event.target.value)
                  }}
                >
                  <option value="">Select a supplier</option>
                  {(suppliers?.data ?? []).map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name} ({supplier.code})
                    </option>
                  ))}
                </SelectField>
                <p className="mt-2 text-sm text-slate-500">
                  Need a new wholesaler?{' '}
                  <Link to="/suppliers" className="font-medium text-teal-800">
                    Open suppliers
                  </Link>
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm font-medium text-slate-900">
                {data.supplier?.name ?? 'No supplier assigned'}
              </p>
            )}
            {isDraft ? (
              <div className="mt-4">
                <Button
                  width="auto"
                  disabled={busy || !data.supplierId}
                  onClick={() => {
                    void onConfirm()
                  }}
                >
                  Confirm order
                </Button>
              </div>
            ) : null}
            {data.status === 'CONFIRMED' ? (
              <p className="mt-4 rounded-2xl bg-teal-50 px-4 py-3 text-sm text-teal-900">
                Confirmed. Stock is unchanged.{' '}
                <Link to="/inventory" className="font-medium underline">
                  Record the purchase on Inventory
                </Link>{' '}
                when the shipment arrives.
              </p>
            ) : null}
            {actionError ? <p className="mt-3 text-sm text-red-700">{actionError}</p> : null}
          </section>
        </div>
      ) : null}
    </PagePanel>
  )
}
