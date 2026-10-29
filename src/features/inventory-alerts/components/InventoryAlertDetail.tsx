import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { PagePanel } from '../../../components/ui/PagePanel'
import { TextField } from '../../../components/ui/TextField'
import {
  useDecideInventoryAlertRecommendationMutation,
  useDismissInventoryAlertMutation,
  useGetInventoryAlertQuery,
} from '../api'
import {
  alertStatusLabel,
  missingFactLabel,
  recommendationStatusLabel,
} from '../labels'

const DISMISSABLE = new Set(['OPEN', 'READY', 'FAILED'])

export function InventoryAlertDetail() {
  const { alertId = '' } = useParams()
  const { data, isLoading, isError } = useGetInventoryAlertQuery(alertId, {
    skip: !alertId,
  })
  const [dismiss, dismissState] = useDismissInventoryAlertMutation()
  const [decide, decideState] = useDecideInventoryAlertRecommendationMutation()
  const [quantityDraft, setQuantityDraft] = useState<string | undefined>(undefined)
  const [quantityAlertId, setQuantityAlertId] = useState(data?.id)
  const [decisionError, setDecisionError] = useState<string | null>(null)
  const citedChunks =
    data?.analysis?.evidence?.observations?.searchKnowledge?.chunks?.filter(
      (chunk) => data.analysis?.citedChunkIds.includes(chunk.id),
    ) ?? []
  const pendingRecommendation =
    data?.status === 'READY' &&
    data.analysis?.recommendationStatus === 'PENDING'

  if (data?.id !== quantityAlertId) {
    setQuantityAlertId(data?.id)
    setQuantityDraft(undefined)
  }

  const quantity =
    quantityDraft ??
    (data?.analysis?.recommendedQuantity != null
      ? String(data.analysis.recommendedQuantity)
      : '')

  async function onDecide(decision: 'APPROVE' | 'REJECT') {
    if (!data) {
      return
    }

    setDecisionError(null)
    const parsed = Number(quantity)
    try {
      await decide({
        id: data.id,
        decision,
        ...(decision === 'APPROVE' && Number.isInteger(parsed) && parsed > 0
          ? { quantity: parsed }
          : {}),
      }).unwrap()
    } catch {
      setDecisionError(
        decision === 'APPROVE'
          ? 'The recommendation could not be approved.'
          : 'The recommendation could not be rejected.',
      )
    }
  }

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
                <p className="text-slate-500">
                  Decision: {recommendationStatusLabel(data.analysis.recommendationStatus)}
                  {data.analysis.decidedQuantity != null
                    ? ` · ${data.analysis.decidedQuantity} boxes`
                    : ''}
                </p>
                {pendingRecommendation ? (
                  <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
                    <TextField
                      label="Quantity"
                      name="quantity"
                      type="number"
                      min={1}
                      step={1}
                      value={quantity}
                      onChange={(event) => setQuantityDraft(event.target.value)}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        width="auto"
                        size="sm"
                        disabled={decideState.isLoading}
                        onClick={() => {
                          void onDecide('APPROVE')
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        width="auto"
                        size="sm"
                        variant="danger"
                        disabled={decideState.isLoading}
                        onClick={() => {
                          void onDecide('REJECT')
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                    {decisionError ? (
                      <p className="text-sm text-red-700">{decisionError}</p>
                    ) : null}
                  </div>
                ) : null}
                {data.analysis.recommendationStatus === 'APPROVED' ? (
                  <p className="rounded-2xl bg-teal-50 px-4 py-3 text-sm text-teal-900">
                    Recorded. Stock is unchanged. Record a purchase on Inventory if you
                    want to add boxes.{' '}
                    <Link to="/inventory" className="font-medium underline">
                      Open inventory
                    </Link>
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </PagePanel>
  )
}
