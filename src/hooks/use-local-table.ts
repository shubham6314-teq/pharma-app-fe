import { useMemo, useState } from 'react'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  paginateItems,
} from '../lib/pagination'

export function useLocalTable<T>(
  items: T[],
  matches: (item: T, query: string) => boolean,
) {
  const [page, setPage] = useState(DEFAULT_PAGE)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) {
      return items
    }

    return items.filter((item) => matches(item, query))
  }, [items, matches, search])

  const result = paginateItems(filtered, page, DEFAULT_PAGE_SIZE)

  function onSearchChange(value: string) {
    setSearch(value)
    setPage(DEFAULT_PAGE)
  }

  return {
    searchValue: search,
    onSearchChange,
    onPageChange: setPage,
    rows: result.data,
    meta: result.meta,
  }
}
