import type { CatalogUnit } from '../catalog-units/types'

export type { CatalogUnit }

export function formatPackQuantity(
  quantity: number,
  packType: Pick<CatalogUnit, 'singularLabel' | 'pluralLabel'>,
): string {
  const label = Math.abs(quantity) === 1 ? packType.singularLabel : packType.pluralLabel
  return `${quantity} ${label}`
}

export function formatPackContent(
  quantity: number,
  contentUnit: Pick<CatalogUnit, 'singularLabel' | 'pluralLabel'>,
  packType: Pick<CatalogUnit, 'singularLabel'>,
): string {
  const contentLabel =
    Math.abs(quantity) === 1 ? contentUnit.singularLabel : contentUnit.pluralLabel
  return `${quantity} ${contentLabel} per ${packType.singularLabel}`
}
