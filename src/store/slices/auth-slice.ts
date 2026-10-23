import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser } from '../../features/auth/types'

type AuthState = {
  token: string | null
  user: AuthUser | null
  sessionChecked: boolean
}

const AUTH_STORAGE_KEY = 'pharma-auth'

const initialState: AuthState = {
  token: null,
  user: null,
  sessionChecked: false,
}

try {
  localStorage.removeItem(AUTH_STORAGE_KEY)
} catch {
  // Ignore unavailable storage.
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{
        token: string
        user: AuthUser
      }>,
    ) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.sessionChecked = true
    },
    clearAuth: (state) => {
      state.token = null
      state.user = null
      state.sessionChecked = true
    },
    updateUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload
    },
    markSessionChecked: (state) => {
      state.sessionChecked = true
    },
  },
})

export const { setAuth, clearAuth, updateUser, markSessionChecked } =
  authSlice.actions
export const authReducer = authSlice.reducer
