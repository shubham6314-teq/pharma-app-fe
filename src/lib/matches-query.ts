export function matchesQuery(
  query: string,
  fields: Array<string | number | null | undefined>,
): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) {
    return true
  }

  return fields.join(' ').toLowerCase().includes(needle)
}
