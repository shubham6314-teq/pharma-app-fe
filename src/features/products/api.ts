import type { PaginatedResponse } from '../../lib/pagination'
import { baseApi } from '../../store/api/base-api'
import { toProductFormData } from './to-form-data'
import type {
  CreateProductPayload,
  ListProductsQuery,
  Product,
  UpdateProductPayload,
} from './types'

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<PaginatedResponse<Product>, ListProductsQuery>({
      query: ({ page, limit, categoryId, divisionId }) => ({
        url: '/products',
        params: {
          page,
          limit,
          ...(categoryId ? { categoryId } : {}),
          ...(divisionId ? { divisionId } : {}),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((product) => ({
                type: 'Product' as const,
                id: product.id,
              })),
              { type: 'Product' as const, id: 'LIST' },
            ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),
    createProduct: builder.mutation<Product, CreateProductPayload>({
      query: (payload) => ({
        url: '/products',
        method: 'POST',
        body: toProductFormData(payload),
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    updateProduct: builder.mutation<
      Product,
      { id: string; body: UpdateProductPayload }
    >({
      query: ({ id, body }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body: toProductFormData(body),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi
