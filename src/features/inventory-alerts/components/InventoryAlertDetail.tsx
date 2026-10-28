import { Link, useParams } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { PagePanel } from '../../../components/ui/PagePanel'
import {
  useDismissInventoryAlertMutation,
  useGetInventoryAlertQuery,
} from '../api'
import { alertStatusLabel, missingFactLabel } from '../labels'

const DISMISSABLE = new Set(['OPEN', 'READY', 'FAILED'])

export function InventoryAlertDetail() {
  const { alertId = '' } = useParams()
  const { data, isLoading, isError } = useGetInventoryAlertQuery(alertId, {
    skip: !alertId,
  })
  const [dismiss, dismissState] = useDismissInventoryAlertMutation()
  const citedChunks =
    data?.analysis?.evidence?.observations?.searchKnowledge?.chunks?.filter(
      (chunk) => data.analysis?.citedChunkIds.includes(chunk.id),
    ) ?? []

  return (
    <PagePanel
      title={data?.product.name ?? 'Inventory alert'}
      description="The original low-stock notification stays next to the investigation. The recommendation does not change stock or create a purchase."
      actions={
        data && DISMISSABLE.has(data.status) ? (
          <Button
            width="auto"
            variant="secondary"
            disabled={dismissState.isLoading}
            onClick={() => {
              void dismiss(data.id)
            }}
          >
            Dismiss
          </Button>
        ) : null
      }
    >
      {isLoading ? <p className="px-5 py-8 text-sm text-slate-500">Loading alert…</p> : null}
      {isError ? (
        <p className="px-5 py-8 text-sm text-red-700">This alert could not be loaded.</p>
      ) : null}
      {data ? (
        <div className="grid gap-px bg-slate-100 lg:grid-cols-2">
          <section className="bg-white p-5">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Notification
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">
              {data.product.name} is below its reorder level
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500">Available</dt>
                <dd className="font-medium text-slate-900">{data.availableQuantity}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Reorder level</dt>
                <dd className="font-medium text-slate-900">{data.reorderLevel}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="font-medium text-slate-900">
                  {alertStatusLabel(data.status)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Pack</dt>
                <dd className="font-medium text-slate-900">{data.product.packSize}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-slate-500">
              {data.product.category.division.name} · {data.product.category.name} ·{' '}
              {data.product.code}
            </p>
            <Link
              to="/inventory"
              className="mt-4 inline-block text-sm font-medium text-teal-800"
            >
              Open inventory
            </Link>
          </section>
          <section className="bg-white p-5">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Analysis
            </p>
            {data.status === 'ANALYZING' || data.status === 'OPEN' ? (
              <p className="mt-2 text-sm text-slate-600">
                The investigation is still running. This page updates when it finishes.
              </p>
            ) : null}
            {data.status === 'FAILED' ? (
              <p className="mt-2 text-sm text-slate-600">
                No recommendation was generated. The low-stock notification is unchanged.
              </p>
            ) : null}
            {data.analysis ? (
              <div className="mt-2 space-y-4 text-sm text-slate-700">
                <p>{data.analysis.explanation}</p>
                <div>
                  <p className="font-medium text-slate-900">
                    Recommended quantity:{' '}
                    {data.analysis.recommendedQuantity === null
                      ? 'Not available'
                      : data.analysis.recommendedQuantity}
                  </p>
                  <p className="mt-1">{data.analysis.calculationExplanation}</p>
                </div>
                {data.analysis.missingInformation.length > 0 ? (
                  <ul className="list-disc space-y-1 pl-5">
                    {data.analysis.missingInformation.map((item) => (
                      <li key={item}>{missingFactLabel(item)}</li>
                    ))}
                  </ul>
                ) : null}
                {citedChunks.length > 0 ? (
                  <div>
                    <p className="font-medium text-slate-900">Cited documents</p>
                    <ul className="mt-1 space-y-2">
                      {citedChunks.map((chunk) => (
                        <li key={chunk.id}>
                          <span className="font-medium">{chunk.title}</span>
                          <span className="mt-1 block text-slate-500">{chunk.content}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </PagePanel>
  )
}
