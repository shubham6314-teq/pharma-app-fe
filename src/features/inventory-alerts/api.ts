import { baseApi } from '../../store/api/base-api'
import type {
  InventoryAlert,
  InventoryAlertList,
  ListInventoryAlertsQuery,
} from './types'

export const inventoryAlertsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventoryAlerts: builder.query<InventoryAlertList, ListInventoryAlertsQuery>({
      query: ({ page = 1, limit = 10, active, status }) => ({
        url: '/inventory-alerts',
        params: {
          page,
          limit,
          ...(active ? { active: true } : {}),
          ...(status ? { status } : {}),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((alert) => ({
                type: 'InventoryAlert' as const,
                id: alert.id,
              })),
              { type: 'InventoryAlert' as const, id: 'LIST' },
            ]
          : [{ type: 'InventoryAlert' as const, id: 'LIST' }],
    }),
    getInventoryAlert: builder.query<InventoryAlert, string>({
      query: (id) => `/inventory-alerts/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'InventoryAlert', id }],
    }),
    dismissInventoryAlert: builder.mutation<InventoryAlert, string>({
      query: (id) => ({
        url: `/inventory-alerts/${id}/dismiss`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'InventoryAlert', id },
        { type: 'InventoryAlert', id: 'LIST' },
      ],
    }),
    decideInventoryAlertRecommendation: builder.mutation<
      InventoryAlert,
      { id: string; decision: 'APPROVE' | 'REJECT'; quantity?: number }
    >({
      query: ({ id, decision, quantity }) => ({
        url: `/inventory-alerts/${id}/recommendation`,
        method: 'PATCH',
        body: {
          decision,
          ...(typeof quantity === 'number' ? { quantity } : {}),
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'InventoryAlert', id },
        { type: 'InventoryAlert', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetInventoryAlertsQuery,
  useGetInventoryAlertQuery,
  useDismissInventoryAlertMutation,
  useDecideInventoryAlertRecommendationMutation,
} = inventoryAlertsApi
