import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import type { LoginResponse } from '../../features/auth/types'
import { clearAuth, setAuth } from '../slices/auth-slice'

type RootStateLike = {
  auth: {
    token: string | null
  }
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootStateLike).auth.token

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    return headers
  },
})

type RawBaseQuery = typeof rawBaseQuery
type QueryResult = Awaited<ReturnType<RawBaseQuery>>

function getRequestUrl(args: string | FetchArgs): string {
  return typeof args === 'string' ? args : args.url
}

function isRefreshRequest(url: string): boolean {
  return url.includes('/auth/refresh')
}

function shouldSkipReauth(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout')
  )
}

function isAuthResponse(value: unknown): value is LoginResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<LoginResponse>
  return (
    typeof candidate.accessToken === 'string' &&
    typeof candidate.user?.id === 'string' &&
    typeof candidate.user.email === 'string' &&
    typeof candidate.user.name === 'string'
  )
}

let refreshPromise: Promise<QueryResult> | null = null

function runRefresh(
  api: Parameters<RawBaseQuery>[1],
  extraOptions: Parameters<RawBaseQuery>[2],
): Promise<QueryResult> {
  if (!refreshPromise) {
    refreshPromise = Promise.resolve(
      rawBaseQuery(
        { url: '/auth/refresh', method: 'POST' },
        api,
        extraOptions,
      ),
    )
      .then((result) => {
        if (result.data && isAuthResponse(result.data)) {
          api.dispatch(
            setAuth({
              token: result.data.accessToken,
              user: result.data.user,
            }),
          )
        } else {
          api.dispatch(clearAuth())
        }

        return result
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const url = getRequestUrl(args)

  if (isRefreshRequest(url)) {
    return runRefresh(api, extraOptions)
  }

  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401 && !shouldSkipReauth(url)) {
    const refreshResult = await runRefresh(api, extraOptions)

    if (refreshResult.data && isAuthResponse(refreshResult.data)) {
      result = await rawBaseQuery(args, api, extraOptions)
    }
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Division', 'Category', 'PackType', 'ContentUnit', 'Product', 'Inventory'],
  endpoints: () => ({}),
})
