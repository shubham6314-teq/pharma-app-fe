export const PACK_UNITS = ['STRIP', 'BOTTLE', 'TUBE', 'VIAL', 'SACHET', 'BOX'] as const
export const CONTENT_UNITS = ['TABLET', 'CAPSULE', 'ML', 'GM'] as const

export type PackUnit = (typeof PACK_UNITS)[number]
export type ContentUnit = (typeof CONTENT_UNITS)[number]

export const PACK_UNIT_LABELS: Record<PackUnit, string> = {
  STRIP: 'Strip',
  BOTTLE: 'Bottle',
  TUBE: 'Tube',
  VIAL: 'Vial',
  SACHET: 'Sachet',
  BOX: 'Box',
}

export const CONTENT_UNIT_LABELS: Record<ContentUnit, string> = {
  TABLET: 'Tablet',
  CAPSULE: 'Capsule',
  ML: 'ml',
  GM: 'g',
}

const PACK_UNIT_FORMS: Record<PackUnit, [string, string]> = {
  STRIP: ['strip', 'strips'],
  BOTTLE: ['bottle', 'bottles'],
  TUBE: ['tube', 'tubes'],
  VIAL: ['vial', 'vials'],
  SACHET: ['sachet', 'sachets'],
  BOX: ['box', 'boxes'],
}

const CONTENT_UNIT_FORMS: Record<ContentUnit, [string, string]> = {
  TABLET: ['tablet', 'tablets'],
  CAPSULE: ['capsule', 'capsules'],
  ML: ['ml', 'ml'],
  GM: ['g', 'g'],
}

function pluralLabel(forms: [string, string], quantity: number): string {
  return Math.abs(quantity) === 1 ? forms[0] : forms[1]
}

export function formatPackQuantity(quantity: number, unit: PackUnit): string {
  return `${quantity} ${pluralLabel(PACK_UNIT_FORMS[unit], quantity)}`
}

export function formatContent(quantity: number, unit: ContentUnit): string {
  return `${quantity} ${pluralLabel(CONTENT_UNIT_FORMS[unit], quantity)}`
}

export function formatPackContent(
  quantity: number,
  contentUnit: ContentUnit,
  packUnit: PackUnit,
): string {
  return `${formatContent(quantity, contentUnit)} per ${PACK_UNIT_FORMS[packUnit][0]}`
}
