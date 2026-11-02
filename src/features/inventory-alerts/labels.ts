const missingFactLabels: Record<string, string> = {
  SALES_HISTORY_UNAVAILABLE:
    'No sale movements were found in the stock ledger for the lookback window.',
  POLICY_DOCUMENTS_UNAVAILABLE:
    'No matching inventory policy document was found.',
  SUPPLIER_TERMS_UNAVAILABLE: 'No supplier document was found.',
  KNOWLEDGE_RETRIEVAL_UNAVAILABLE:
    'Policy and supplier document search was unavailable.',
}

export function missingFactLabel(code: string): string {
  return missingFactLabels[code] ?? code
}

export function recommendationStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Pending'
    case 'APPROVED':
      return 'Approved'
    case 'REJECTED':
      return 'Rejected'
    default:
      return status
  }
}

export function alertKindLabel(kind: string): string {
  switch (kind) {
    case 'LOW_STOCK':
      return 'Low stock'
    case 'EXPIRY':
      return 'Near expiry'
    default:
      return kind
  }
}

export function expiryActionLabel(action: string | null): string {
  switch (action) {
    case 'USE_FIRST':
      return 'Use this batch first'
    case 'DO_NOT_DISPENSE':
      return 'Do not dispense'
    case 'RETURN_TO_SUPPLIER':
      return 'Return to supplier'
    default:
      return action ?? 'Not available'
  }
}

export function alertStatusLabel(status: string): string {
  switch (status) {
    case 'OPEN':
      return 'Open'
    case 'ANALYZING':
      return 'Investigating'
    case 'READY':
      return 'Analysis ready'
    case 'FAILED':
      return 'Analysis unavailable'
    case 'DISMISSED':
      return 'Dismissed'
    case 'RESOLVED':
      return 'Resolved'
    default:
      return status
  }
}
