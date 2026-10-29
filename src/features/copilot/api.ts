import { baseApi } from '../../store/api/base-api'
import type { CopilotThread } from './types'

export const copilotApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCopilotThread: builder.mutation<CopilotThread, void>({
      query: () => ({
        url: '/copilot/threads',
        method: 'POST',
      }),
    }),
    getCopilotThread: builder.query<CopilotThread, string>({
      query: (id) => `/copilot/threads/${id}`,
    }),
  }),
})

export const {
  useCreateCopilotThreadMutation,
  useGetCopilotThreadQuery,
  useLazyGetCopilotThreadQuery,
} = copilotApi
