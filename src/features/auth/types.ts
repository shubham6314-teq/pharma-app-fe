export type { LoginFormValues } from './login-schema'

export type AuthUser = {
  id: string
  email: string
  name: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type UpdateProfileRequest = {
  name: string
  email: string
}

export type UpdateProfileResponse = {
  user: AuthUser
  emailChanged: boolean
}

export type LoginResponse = {
  user: AuthUser
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
}
