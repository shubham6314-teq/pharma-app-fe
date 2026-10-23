import type { PaginatedResponse } from '../../lib/pagination'
import { baseApi } from '../../store/api/base-api'
import type {
  CreateStockMovementPayload,
  InventoryBatch,
  ListInventoryQuery,
} from './types'

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query<PaginatedResponse<InventoryBatch>, ListInventoryQuery>({
      query: ({ page, limit, divisionId, categoryId, productId, search, status }) => ({
        url: '/inventory',
        params: {
          page,
          limit,
          ...(divisionId ? { divisionId } : {}),
          ...(categoryId ? { categoryId } : {}),
          ...(productId ? { productId } : {}),
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((batch) => ({
                type: 'Inventory' as const,
                id: batch.id,
              })),
              { type: 'Inventory' as const, id: 'LIST' },
            ]
          : [{ type: 'Inventory' as const, id: 'LIST' }],
    }),
    getInventoryBatch: builder.query<InventoryBatch, string>({
      query: (id) => `/inventory/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Inventory', id }],
    }),
    createStockMovement: builder.mutation<InventoryBatch, CreateStockMovementPayload>({
      query: (body) => ({
        url: '/inventory/movements',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result) => [
        { type: 'Inventory', id: 'LIST' },
        ...(result ? [{ type: 'Inventory' as const, id: result.id }] : []),
      ],
    }),
  }),
})

export const {
  useGetInventoryQuery,
  useGetInventoryBatchQuery,
  useCreateStockMovementMutation,
} = inventoryApi
