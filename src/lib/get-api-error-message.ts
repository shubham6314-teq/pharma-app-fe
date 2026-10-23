type NestErrorBody = {
  message?: string | string[]
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== 'object' || error === null || !('data' in error)) {
    return fallback
  }

  const data = (error as { data?: NestErrorBody | string }).data

  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (typeof data !== 'object' || data === null) {
    return fallback
  }

  const { message } = data

  if (typeof message === 'string' && message.trim()) {
    return message
  }

  if (Array.isArray(message) && typeof message[0] === 'string') {
    return message[0]
  }

  return fallback
}
