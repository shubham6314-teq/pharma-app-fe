import { baseApi } from '../../store/api/base-api'
import type {
  ListPurchaseOrdersQuery,
  PurchaseOrder,
  PurchaseOrderList,
} from './types'

export const purchaseOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query<PurchaseOrderList, ListPurchaseOrdersQuery>({
      query: ({ page = 1, limit = 20, status }) => ({
        url: '/purchase-orders',
        params: {
          page,
          limit,
          ...(status ? { status } : {}),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((order) => ({
                type: 'PurchaseOrder' as const,
                id: order.id,
              })),
              { type: 'PurchaseOrder' as const, id: 'LIST' },
            ]
          : [{ type: 'PurchaseOrder' as const, id: 'LIST' }],
    }),
    getPurchaseOrder: builder.query<PurchaseOrder, string>({
      query: (id) => `/purchase-orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'PurchaseOrder', id }],
    }),
    assignPurchaseOrderSupplier: builder.mutation<
      PurchaseOrder,
      { id: string; supplierId: string }
    >({
      query: ({ id, supplierId }) => ({
        url: `/purchase-orders/${id}`,
        method: 'PATCH',
        body: { supplierId },
      }),
      invalidatesTags: (result, _error, { id }) => [
        { type: 'PurchaseOrder', id },
        { type: 'PurchaseOrder', id: 'LIST' },
        ...(result?.alertId
          ? [{ type: 'InventoryAlert' as const, id: result.alertId }]
          : []),
        { type: 'Overview', id: 'SUMMARY' },
      ],
    }),
    confirmPurchaseOrder: builder.mutation<PurchaseOrder, string>({
      query: (id) => ({
        url: `/purchase-orders/${id}/confirm`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, _error, id) => [
        { type: 'PurchaseOrder', id },
        { type: 'PurchaseOrder', id: 'LIST' },
        ...(result?.alertId
          ? [{ type: 'InventoryAlert' as const, id: result.alertId }]
          : []),
        { type: 'Overview', id: 'SUMMARY' },
      ],
    }),
    cancelPurchaseOrder: builder.mutation<PurchaseOrder, string>({
      query: (id) => ({
        url: `/purchase-orders/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, _error, id) => [
        { type: 'PurchaseOrder', id },
        { type: 'PurchaseOrder', id: 'LIST' },
        ...(result?.alertId
          ? [{ type: 'InventoryAlert' as const, id: result.alertId }]
          : []),
        { type: 'Overview', id: 'SUMMARY' },
      ],
    }),
  }),
})

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useAssignPurchaseOrderSupplierMutation,
  useConfirmPurchaseOrderMutation,
  useCancelPurchaseOrderMutation,
} = purchaseOrdersApi
