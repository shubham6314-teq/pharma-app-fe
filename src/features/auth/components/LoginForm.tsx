import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { PasswordField } from '../../../components/ui/PasswordField'
import { TextField } from '../../../components/ui/TextField'
import { useToast } from '../../../hooks/use-toast'
import { getApiErrorMessage } from '../../../lib/get-api-error-message'
import { zodResolver } from '../../../lib/zod-resolver'
import { setAuth } from '../../../store/slices/auth-slice'
import { useAppDispatch } from '../../../store/hooks'
import { useLoginMutation } from '../api'
import { loginSchema, type LoginFormValues } from '../login-schema'

export function LoginForm() {
  const [formError, setFormError] = useState<string | null>(null)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const [login, { isLoading }] = useLoginMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  })

  async function onSubmit(values: LoginFormValues) {
    setFormError(null)

    try {
      const result = await login(values).unwrap()
      dispatch(
        setAuth({
          token: result.accessToken,
          user: result.user,
        }),
      )
      toast.success('Signed in successfully.')
      navigate('/', { replace: true })
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to sign in. Try again.')
      setFormError(message)
      toast.error(message)
    }
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@pharmacy.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <PasswordField
        label="Password"
        autoComplete="current-password"
        placeholder="Enter your password"
        error={errors.password?.message}
        {...register('password')}
      />

      {formError ? (
        <p className="text-sm text-red-600" role="alert">
          {formError}
        </p>
      ) : null}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
