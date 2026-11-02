import { Link } from 'react-router-dom'
import { PagePanel } from '../../../components/ui/PagePanel'
import { useGetInventoryAlertsQuery } from '../api'
import { alertKindLabel, alertStatusLabel } from '../labels'

export function InventoryAlertsWorkspace() {
  const { data, isLoading, isError } = useGetInventoryAlertsQuery({
    page: 1,
    limit: 20,
    active: true,
  })

  return (
    <PagePanel
      title="Inventory alerts"
      description="Low-stock and near-expiry notifications stay here while the investigation runs. Analysis does not change stock or write an expiry movement."
    >
      {isLoading ? (
        <p className="px-5 py-8 text-sm text-slate-500">Loading alerts…</p>
      ) : null}
      {isError ? (
        <p className="px-5 py-8 text-sm text-red-700">Alerts could not be loaded.</p>
      ) : null}
      {data && data.data.length === 0 ? (
        <p className="px-5 py-8 text-sm text-slate-500">No open inventory alerts.</p>
      ) : null}
      {data && data.data.length > 0 ? (
        <ul className="divide-y divide-slate-100">
          {data.data.map((alert) => (
            <li key={alert.id}>
              <Link
                to={`/inventory-alerts/${alert.id}`}
                className="flex flex-col gap-1 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <span>
                  <span className="block font-medium text-slate-900">
                    {alert.product.name}
                  </span>
                  <span className="text-sm text-slate-500">
                    {alertKindLabel(alert.kind)}
                    {alert.kind === 'EXPIRY' && alert.batchNumber
                      ? ` · batch ${alert.batchNumber}${
                          alert.expiryDate
                            ? ` · expires ${alert.expiryDate.slice(0, 10)}`
                            : ''
                        }`
                      : ` · ${alert.availableQuantity} available · reorder level ${alert.reorderLevel}`}
                  </span>
                </span>
                <span className="text-sm font-medium text-teal-800">
                  {alertStatusLabel(alert.status)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </PagePanel>
  )
}
