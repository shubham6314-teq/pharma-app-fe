import { baseApi } from '../../store/api/base-api'
import type { KnowledgeDocument } from './types'

export const knowledgeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getKnowledgeDocuments: builder.query<KnowledgeDocument[], void>({
      query: () => '/knowledge/documents',
      providesTags: (result) =>
        result
          ? [
              ...result.map((document) => ({
                type: 'KnowledgeDocument' as const,
                id: document.id,
              })),
              { type: 'KnowledgeDocument' as const, id: 'LIST' },
            ]
          : [{ type: 'KnowledgeDocument' as const, id: 'LIST' }],
    }),
    createKnowledgeDocument: builder.mutation<KnowledgeDocument, FormData>({
      query: (body) => ({
        url: '/knowledge/documents',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'KnowledgeDocument', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetKnowledgeDocumentsQuery,
  useCreateKnowledgeDocumentMutation,
} = knowledgeApi
