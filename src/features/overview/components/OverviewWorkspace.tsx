import { Link } from 'react-router-dom'
import { ResourceTable, type TableColumn } from '../../../components/ui/ResourceTable'
import { useLocalTable } from '../../../hooks/use-local-table'
import { matchesQuery } from '../../../lib/matches-query'
import { useGetOverviewQuery } from '../api'
import { toOverviewItems } from '../to-overview-items'
import type { OverviewItem } from '../types'

function matchesOverview(item: OverviewItem, query: string) {
  return matchesQuery(query, [item.title, item.detail, item.area])
}

const columns: TableColumn<OverviewItem>[] = [
  {
    id: 'title',
    header: 'Activity',
    mobilePrimary: true,
    render: (row) => (
      <Link to={row.to} className="font-medium text-slate-900 hover:text-teal-800">
        {row.title}
      </Link>
    ),
  },
  { id: 'detail', header: 'Detail', render: (row) => row.detail },
  {
    id: 'area',
    header: 'Area',
    render: (row) => (
      <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">
        {row.area}
      </span>
    ),
  },
]

export function OverviewWorkspace() {
  const { data, isLoading, isError } = useGetOverviewQuery()
  const items = data ? toOverviewItems(data) : []
  const table = useLocalTable(items, matchesOverview)

  return (
    <ResourceTable
      title="Overview"
      description="Live low-stock, near-expiry, and purchase-order work. These counts do not change inventory."
      searchPlaceholder="Search activity"
      columns={columns}
      rowKey={(row) => row.id}
      emptyMessage="No activity"
      isLoading={isLoading}
      isError={isError}
      errorMessage="Overview could not be loaded."
      {...table}
    />
  )
}
