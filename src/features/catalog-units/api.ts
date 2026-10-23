import type { PaginatedResponse } from '../../lib/pagination'
import { baseApi } from '../../store/api/base-api'
import type {
  CatalogUnit,
  CreateCatalogUnitPayload,
  ListCatalogUnitsQuery,
  UpdateCatalogUnitPayload,
} from './types'

export const packTypesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPackTypes: builder.query<PaginatedResponse<CatalogUnit>, ListCatalogUnitsQuery>({
      query: ({ page, limit }) => ({
        url: '/pack-types',
        params: { page, limit },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((item) => ({ type: 'PackType' as const, id: item.id })),
              { type: 'PackType' as const, id: 'LIST' },
            ]
          : [{ type: 'PackType' as const, id: 'LIST' }],
    }),
    createPackType: builder.mutation<CatalogUnit, CreateCatalogUnitPayload>({
      query: (body) => ({
        url: '/pack-types',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'PackType', id: 'LIST' },
        { type: 'Product', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
      ],
    }),
    updatePackType: builder.mutation<
      CatalogUnit,
      { id: string; body: UpdateCatalogUnitPayload }
    >({
      query: ({ id, body }) => ({
        url: `/pack-types/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PackType', id },
        { type: 'PackType', id: 'LIST' },
        { type: 'Product', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
      ],
    }),
    deletePackType: builder.mutation<void, string>({
      query: (id) => ({
        url: `/pack-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'PackType', id },
        { type: 'PackType', id: 'LIST' },
      ],
    }),
  }),
})

export const contentUnitsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContentUnits: builder.query<PaginatedResponse<CatalogUnit>, ListCatalogUnitsQuery>({
      query: ({ page, limit }) => ({
        url: '/content-units',
        params: { page, limit },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((item) => ({
                type: 'ContentUnit' as const,
                id: item.id,
              })),
              { type: 'ContentUnit' as const, id: 'LIST' },
            ]
          : [{ type: 'ContentUnit' as const, id: 'LIST' }],
    }),
    createContentUnit: builder.mutation<CatalogUnit, CreateCatalogUnitPayload>({
      query: (body) => ({
        url: '/content-units',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'ContentUnit', id: 'LIST' },
        { type: 'Product', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
      ],
    }),
    updateContentUnit: builder.mutation<
      CatalogUnit,
      { id: string; body: UpdateCatalogUnitPayload }
    >({
      query: ({ id, body }) => ({
        url: `/content-units/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ContentUnit', id },
        { type: 'ContentUnit', id: 'LIST' },
        { type: 'Product', id: 'LIST' },
        { type: 'Inventory', id: 'LIST' },
      ],
    }),
    deleteContentUnit: builder.mutation<void, string>({
      query: (id) => ({
        url: `/content-units/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'ContentUnit', id },
        { type: 'ContentUnit', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetPackTypesQuery,
  useCreatePackTypeMutation,
  useUpdatePackTypeMutation,
  useDeletePackTypeMutation,
} = packTypesApi

export const {
  useGetContentUnitsQuery,
  useCreateContentUnitMutation,
  useUpdateContentUnitMutation,
  useDeleteContentUnitMutation,
} = contentUnitsApi
