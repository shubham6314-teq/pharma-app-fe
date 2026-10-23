import type { PaginatedResponse } from '../../lib/pagination'
import { baseApi } from '../../store/api/base-api'
import { toCategoryFormData } from './to-form-data'
import type {
  CreateCategoryPayload,
  Category,
  ListCategoriesQuery,
  UpdateCategoryPayload,
} from './types'

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<PaginatedResponse<Category>, ListCategoriesQuery>({
      query: ({ page, limit, divisionId }) => ({
        url: '/categories',
        params: {
          page,
          limit,
          ...(divisionId ? { divisionId } : {}),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((category) => ({
                type: 'Category' as const,
                id: category.id,
              })),
              { type: 'Category' as const, id: 'LIST' },
            ]
          : [{ type: 'Category' as const, id: 'LIST' }],
    }),
    createCategory: builder.mutation<Category, CreateCategoryPayload>({
      query: (payload) => ({
        url: '/categories',
        method: 'POST',
        body: toCategoryFormData(payload),
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
    updateCategory: builder.mutation<
      Category,
      { id: string; body: UpdateCategoryPayload }
    >({
      query: ({ id, body }) => ({
        url: `/categories/${id}`,
        method: 'PATCH',
        body: toCategoryFormData(body),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi
