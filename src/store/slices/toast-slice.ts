import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type ToastVariant = 'success' | 'error'

export type ToastItem = {
  id: string
  message: string
  variant: ToastVariant
}

type ToastState = {
  items: ToastItem[]
  nextId: number
}

const MAX_TOASTS = 3

const initialState: ToastState = {
  items: [],
  nextId: 0,
}

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    pushToast: (
      state,
      action: PayloadAction<{ message: string; variant?: ToastVariant }>,
    ) => {
      state.nextId += 1
      state.items.push({
        id: String(state.nextId),
        message: action.payload.message,
        variant: action.payload.variant ?? 'success',
      })

      if (state.items.length > MAX_TOASTS) {
        state.items.shift()
      }
    },
    dismissToast: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
  },
})

export const { pushToast, dismissToast } = toastSlice.actions
export const toastReducer = toastSlice.reducer
