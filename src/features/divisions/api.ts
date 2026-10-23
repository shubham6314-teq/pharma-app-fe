import type { PaginatedResponse } from '../../lib/pagination'
import { baseApi } from '../../store/api/base-api'
import { toDivisionFormData } from './to-form-data'
import type {
  CreateDivisionPayload,
  Division,
  ListDivisionsQuery,
  UpdateDivisionPayload,
} from './types'

export const divisionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDivisions: builder.query<PaginatedResponse<Division>, ListDivisionsQuery>({
      query: ({ page, limit }) => ({
        url: '/divisions',
        params: { page, limit },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((division) => ({
                type: 'Division' as const,
                id: division.id,
              })),
              { type: 'Division' as const, id: 'LIST' },
            ]
          : [{ type: 'Division' as const, id: 'LIST' }],
    }),
    createDivision: builder.mutation<Division, CreateDivisionPayload>({
      query: (payload) => ({
        url: '/divisions',
        method: 'POST',
        body: toDivisionFormData(payload),
      }),
      invalidatesTags: [{ type: 'Division', id: 'LIST' }],
    }),
    updateDivision: builder.mutation<
      Division,
      { id: string; body: UpdateDivisionPayload }
    >({
      query: ({ id, body }) => ({
        url: `/divisions/${id}`,
        method: 'PATCH',
        body: toDivisionFormData(body),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Division', id },
        { type: 'Division', id: 'LIST' },
      ],
    }),
    deleteDivision: builder.mutation<void, string>({
      query: (id) => ({
        url: `/divisions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Division', id },
        { type: 'Division', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetDivisionsQuery,
  useCreateDivisionMutation,
  useUpdateDivisionMutation,
  useDeleteDivisionMutation,
} = divisionsApi
