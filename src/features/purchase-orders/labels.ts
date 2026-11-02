export function purchaseOrderStatusLabel(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'Draft'
    case 'CONFIRMED':
      return 'Confirmed'
    case 'CANCELLED':
      return 'Cancelled'
    default:
      return status
  }
}
