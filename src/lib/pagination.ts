export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: PaginationMeta
}

export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 10

export function paginateItems<T>(
  items: T[],
  page: number,
  limit = DEFAULT_PAGE_SIZE,
): PaginatedResponse<T> {
  const total = items.length
  const totalPages = Math.ceil(total / limit)
  const safePage = totalPages === 0 ? DEFAULT_PAGE : Math.min(Math.max(page, DEFAULT_PAGE), totalPages)
  const start = (safePage - 1) * limit

  return {
    data: items.slice(start, start + limit),
    meta: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  }
}

export function rangeLabel(meta: PaginationMeta): string {
  if (meta.total === 0) {
    return 'No results'
  }

  const from = (meta.page - 1) * meta.limit + 1
  const to = Math.min(meta.page * meta.limit, meta.total)
  return `Showing ${from}–${to} of ${meta.total}`
}
