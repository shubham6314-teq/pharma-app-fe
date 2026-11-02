import { Link } from 'react-router-dom'
import { PagePanel } from '../../../components/ui/PagePanel'
import { useGetPurchaseOrdersQuery } from '../api'
import { purchaseOrderStatusLabel } from '../labels'

export function PurchaseOrdersWorkspace() {
  const { data, isLoading, isError } = useGetPurchaseOrdersQuery({
    page: 1,
    limit: 20,
  })

  return (
    <PagePanel
      title="Purchase orders"
      description="Draft orders are created when a low-stock recommendation is approved. Confirming an order does not add stock."
    >
      {isLoading ? (
        <p className="px-5 py-8 text-sm text-slate-500">Loading orders…</p>
      ) : null}
      {isError ? (
        <p className="px-5 py-8 text-sm text-red-700">Orders could not be loaded.</p>
      ) : null}
      {data && data.data.length === 0 ? (
        <p className="px-5 py-8 text-sm text-slate-500">
          No purchase orders yet. Approve a low-stock recommendation to create a draft.
        </p>
      ) : null}
      {data && data.data.length > 0 ? (
        <ul className="divide-y divide-slate-100">
          {data.data.map((order) => {
            const line = order.lines[0]
            return (
              <li key={order.id}>
                <Link
                  to={`/orders/${order.id}`}
                  className="flex flex-col gap-1 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span>
                    <span className="block font-medium text-slate-900">
                      {order.number}
                      {line ? ` · ${line.product.name}` : ''}
                    </span>
                    <span className="text-sm text-slate-500">
                      {order.supplier?.name ?? 'Supplier not assigned'}
                      {line ? ` · ${line.quantity} packs` : ''}
                    </span>
                  </span>
                  <span className="text-sm font-medium text-teal-800">
                    {purchaseOrderStatusLabel(order.status)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : null}
    </PagePanel>
  )
}
