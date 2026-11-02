import type { PaginatedResponse } from '../../lib/pagination'
import { baseApi } from '../../store/api/base-api'
import type {
  CreateSupplierPayload,
  ListSuppliersQuery,
  Supplier,
  UpdateSupplierPayload,
} from './types'

export const suppliersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query<PaginatedResponse<Supplier>, ListSuppliersQuery>({
      query: ({ page, limit }) => ({
        url: '/suppliers',
        params: { page, limit },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((supplier) => ({
                type: 'Supplier' as const,
                id: supplier.id,
              })),
              { type: 'Supplier' as const, id: 'LIST' },
            ]
          : [{ type: 'Supplier' as const, id: 'LIST' }],
    }),
    createSupplier: builder.mutation<Supplier, CreateSupplierPayload>({
      query: (body) => ({
        url: '/suppliers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Supplier', id: 'LIST' }],
    }),
    updateSupplier: builder.mutation<
      Supplier,
      { id: string; body: UpdateSupplierPayload }
    >({
      query: ({ id, body }) => ({
        url: `/suppliers/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Supplier', id },
        { type: 'Supplier', id: 'LIST' },
      ],
    }),
    deleteSupplier: builder.mutation<void, string>({
      query: (id) => ({
        url: `/suppliers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Supplier', id },
        { type: 'Supplier', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = suppliersApi
