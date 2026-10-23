import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { PasswordField } from '../../../components/ui/PasswordField'
import { TextField } from '../../../components/ui/TextField'
import { useToast } from '../../../hooks/use-toast'
import { getApiErrorMessage } from '../../../lib/get-api-error-message'
import { zodResolver } from '../../../lib/zod-resolver'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { clearAuth, updateUser } from '../../../store/slices/auth-slice'
import { useChangePasswordMutation, useUpdateProfileMutation } from '../api'
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '../change-password-schema'
import { profileSchema, type ProfileFormValues } from '../profile-schema'

export function ProfilePanel() {
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const user = useAppSelector((state) => state.auth.user)
  const email = user?.email ?? ''
  const name = user?.name ?? ''

  return (
    <div className="px-5 py-6 sm:px-6">
      <div className="flex max-w-xl flex-col gap-5">
        <ProfileDetailsForm name={name} email={email} />

        <div>
          <Button
            type="button"
            variant={showPasswordForm ? 'primary' : 'secondary'}
            width="auto"
            onClick={() => setShowPasswordForm((current) => !current)}
          >
            Change password
          </Button>
        </div>

        {showPasswordForm ? (
          <ChangePasswordForm onCancel={() => setShowPasswordForm(false)} />
        ) : null}
      </div>
    </div>
  )
}

function ProfileDetailsForm({
  name,
  email,
}: {
  name: string
  email: string
}) {
  const [formError, setFormError] = useState<string | null>(null)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const [updateProfile, { isLoading }] = useUpdateProfileMutation()
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name,
      email,
    },
    values: {
      name,
      email,
    },
    resetOptions: {
      keepDirtyValues: true,
    },
    mode: 'onTouched',
  })

  const nameValue = watch('name')
  const emailValue = watch('email')
  const hasChanges =
    nameValue.trim() !== name.trim() ||
    emailValue.trim().toLowerCase() !== email.trim().toLowerCase()

  async function onSubmit(values: ProfileFormValues) {
    setFormError(null)

    try {
      const result = await updateProfile(values).unwrap()

      if (result.emailChanged) {
        dispatch(clearAuth())
        toast.success('Profile updated. Sign in with your new email.')
        navigate('/login', { replace: true })
        return
      }

      dispatch(updateUser(result.user))
      reset(values)
      toast.success('Profile updated.')
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Unable to update profile. Try again.',
      )
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
        label="Name"
        autoComplete="name"
        placeholder="Your name"
        error={errors.name?.message}
        {...register('name')}
      />
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@pharmacy.com"
        error={errors.email?.message}
        {...register('email')}
      />

      {formError ? (
        <p className="text-sm text-red-600" role="alert">
          {formError}
        </p>
      ) : null}

      <div>
        <Button
          type="submit"
          width="auto"
          disabled={!hasChanges || isLoading}
        >
          {isLoading ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}

function ChangePasswordForm({ onCancel }: { onCancel: () => void }) {
  const [formError, setFormError] = useState<string | null>(null)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const [changePassword, { isLoading }] = useChangePasswordMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  })

  async function onSubmit(values: ChangePasswordFormValues) {
    setFormError(null)

    try {
      await changePassword(values).unwrap()
      dispatch(clearAuth())
      toast.success('Password updated. Sign in with your new password.')
      navigate('/login', { replace: true })
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Unable to change password. Try again.',
      )
      setFormError(message)
      toast.error(message)
    }
  }

  return (
    <form
      className="flex flex-col gap-5 border-t border-slate-100 pt-5"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <PasswordField
        label="Current password"
        autoComplete="current-password"
        placeholder="Enter your current password"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />
      <PasswordField
        label="New password"
        autoComplete="new-password"
        placeholder="Enter a new password"
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <PasswordField
        label="Confirm password"
        autoComplete="new-password"
        placeholder="Confirm the new password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      {formError ? (
        <p className="text-sm text-red-600" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" width="auto" disabled={isLoading}>
          {isLoading ? 'Saving…' : 'Save password'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          width="auto"
          disabled={isLoading}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
