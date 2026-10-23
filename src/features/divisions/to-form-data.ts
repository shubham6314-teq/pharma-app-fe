import type { CreateDivisionPayload, UpdateDivisionPayload } from './types'

export function toDivisionFormData(
  payload: CreateDivisionPayload | UpdateDivisionPayload,
): FormData {
  const form = new FormData()

  if (payload.name !== undefined) {
    form.append('name', payload.name)
  }

  if (payload.code !== undefined) {
    form.append('code', payload.code)
  }

  if (typeof payload.description === 'string') {
    form.append('description', payload.description)
  }

  if ('status' in payload && payload.status !== undefined) {
    form.append('status', payload.status)
  }

  if (payload.image) {
    form.append('image', payload.image)
  }

  return form
}
