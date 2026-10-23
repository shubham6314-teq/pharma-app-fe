import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import '../features/auth/api'
import '../features/catalog-units/api'
import '../features/categories/api'
import '../features/divisions/api'
import '../features/inventory/api'
import '../features/products/api'
import { baseApi } from './api/base-api'
import { authReducer } from './slices/auth-slice'
import { toastReducer } from './slices/toast-slice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    toast: toastReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
