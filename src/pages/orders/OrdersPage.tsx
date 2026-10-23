import { ResourceTable, type TableColumn } from '../../components/ui/ResourceTable'
import { useLocalTable } from '../../hooks/use-local-table'

type Order = {
  title: string
  subtitle: string
  meta: string
}

const orders: Order[] = [
  {
    title: 'Order #1048',
    subtitle: 'MedSupply Co. · 12 line items',
    meta: 'Pending',
  },
  {
    title: 'Order #1047',
    subtitle: 'Apex Distributors · Walk-in restock',
    meta: 'In transit',
  },
  {
    title: 'Order #1046',
    subtitle: 'City Wholesale · Received this morning',
    meta: 'Delivered',
  },
  {
    title: 'Order #1045',
    subtitle: 'MedSupply Co. · Partial shipment',
    meta: 'Partial',
  },
]

function matchesOrder(item: Order, query: string) {
  return `${item.title} ${item.subtitle} ${item.meta}`.toLowerCase().includes(query)
}

const columns: TableColumn<Order>[] = [
  {
    id: 'title',
    header: 'Order',
    render: (row) => (
      <div>
        <p className="font-medium text-slate-900">{row.title}</p>
        <p className="text-xs text-slate-500">{row.subtitle}</p>
      </div>
    ),
  },
  {
    id: 'meta',
    header: 'Status',
    render: (row) => (
      <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">
        {row.meta}
      </span>
    ),
  },
]

export function OrdersPage() {
  const table = useLocalTable(orders, matchesOrder)

  return (
    <ResourceTable
      title="Orders"
      description="Purchase and restock orders."
      searchPlaceholder="Search orders"
      columns={columns}
      rowKey={(row) => row.title}
      emptyMessage="No orders"
      {...table}
    />
  )
}
