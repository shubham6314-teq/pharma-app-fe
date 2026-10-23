import { ResourceTable, type TableColumn } from '../../components/ui/ResourceTable'
import { useLocalTable } from '../../hooks/use-local-table'

type Prescription = {
  title: string
  subtitle: string
  meta: string
}

const prescriptions: Prescription[] = [
  {
    title: 'Rx-8821 · Anika Sharma',
    subtitle: 'Amoxicillin 250mg · Dr. Mehta',
    meta: 'To fill',
  },
  {
    title: 'Rx-8820 · Rohan Patel',
    subtitle: 'Paracetamol 500mg · Dr. Iyer',
    meta: 'Ready',
  },
  {
    title: 'Rx-8819 · Meera Joseph',
    subtitle: 'Cetirizine 10mg · Dr. Mehta',
    meta: 'Dispensed',
  },
  {
    title: 'Rx-8818 · Vikram Singh',
    subtitle: 'Ibuprofen 200mg · Dr. Rao',
    meta: 'On hold',
  },
]

function matchesPrescription(item: Prescription, query: string) {
  return `${item.title} ${item.subtitle} ${item.meta}`.toLowerCase().includes(query)
}

const columns: TableColumn<Prescription>[] = [
  {
    id: 'title',
    header: 'Prescription',
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

export function PrescriptionsPage() {
  const table = useLocalTable(prescriptions, matchesPrescription)

  return (
    <ResourceTable
      title="Prescriptions"
      description="Prescriptions waiting to be filled or collected."
      searchPlaceholder="Search prescriptions"
      columns={columns}
      rowKey={(row) => row.title}
      emptyMessage="No prescriptions"
      {...table}
    />
  )
}
