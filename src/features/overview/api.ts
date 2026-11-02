import { baseApi } from '../../store/api/base-api'
import type { OverviewSummary } from './types'

export const overviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOverview: builder.query<OverviewSummary, void>({
      query: () => '/overview',
      providesTags: [{ type: 'Overview', id: 'SUMMARY' }],
    }),
  }),
})

export const { useGetOverviewQuery } = overviewApi
