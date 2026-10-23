import { ResourceTable, type TableColumn } from '../../components/ui/ResourceTable'
import { useLocalTable } from '../../hooks/use-local-table'

type OverviewItem = {
  title: string
  detail: string
  area: string
}

const overviewItems: OverviewItem[] = [
  {
    title: 'Low stock alerts',
    detail: '3 medicines below reorder level',
    area: 'Inventory',
  },
  {
    title: 'Open purchase orders',
    detail: '2 orders awaiting delivery',
    area: 'Orders',
  },
  {
    title: 'Prescriptions to fill',
    detail: '5 ready for pharmacist review',
    area: 'Rx',
  },
  {
    title: 'Walk-in queue',
    detail: 'No patients waiting at the counter',
    area: 'Clear',
  },
]

function matchesOverview(item: OverviewItem, query: string) {
  return `${item.title} ${item.detail} ${item.area}`.toLowerCase().includes(query)
}

const columns: TableColumn<OverviewItem>[] = [
  {
    id: 'title',
    header: 'Activity',
    render: (row) => <span className="font-medium text-slate-900">{row.title}</span>,
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

export function HomePage() {
  const table = useLocalTable(overviewItems, matchesOverview)

  return (
    <ResourceTable
      title="Overview"
      description="Today’s pharmacy activity."
      searchPlaceholder="Search activity"
      columns={columns}
      rowKey={(row) => row.title}
      emptyMessage="No activity"
      {...table}
    />
  )
}
