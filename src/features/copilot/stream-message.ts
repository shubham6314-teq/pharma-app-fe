import type { CopilotMessage } from './types'

type StreamHandlers = {
  onStatus: (text: string) => void
  onToken: (text: string) => void
  onDone: (message: CopilotMessage) => void
  onError: (message: string) => void
}

const UNAVAILABLE = 'The copilot is unavailable.'
const TIMEOUT_MESSAGE =
  'The copilot took too long. Try again, or look up the product on Inventory.'
const CLIENT_TIMEOUT_MS = 310_000

export async function streamCopilotMessage(input: {
  threadId: string
  content: string
  token: string
  signal?: AbortSignal
} & StreamHandlers): Promise<void> {
  const timeout = new AbortController()
  const timer = setTimeout(() => timeout.abort(), CLIENT_TIMEOUT_MS)
  const signal = input.signal
    ? AbortSignal.any([input.signal, timeout.signal])
    : timeout.signal
  let settled = false

  const fail = (message: string) => {
    if (settled) {
      return
    }
    settled = true
    input.onError(message)
  }

  try {
    const base = import.meta.env.VITE_API_BASE_URL ?? ''
    const response = await fetch(`${base}/copilot/threads/${input.threadId}/messages`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${input.token}`,
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: input.content }),
      signal,
    })

    if (response.status === 503 || !response.ok || !response.body) {
      fail(await errorMessage(response))
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const blocks = buffer.split('\n\n')
      buffer = blocks.pop() ?? ''

      for (const block of blocks) {
        const kind = dispatchSse(block, {
          ...input,
          onDone(message) {
            settled = true
            input.onDone(message)
          },
          onError(message) {
            fail(message)
          },
        })
        if (kind === 'done' || kind === 'error') {
          return
        }
      }
    }

    if (buffer.trim() !== '') {
      dispatchSse(buffer, {
        ...input,
        onDone(message) {
          settled = true
          input.onDone(message)
        },
        onError(message) {
          fail(message)
        },
      })
    }

    if (!settled) {
      fail(TIMEOUT_MESSAGE)
    }
  } catch (error) {
    if (timeout.signal.aborted) {
      fail(TIMEOUT_MESSAGE)
      return
    }
    fail(error instanceof Error ? error.message : UNAVAILABLE)
  } finally {
    clearTimeout(timer)
  }
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string }
    if (typeof body.message === 'string' && body.message.trim() !== '') {
      return body.message
    }
  } catch {
    // Non-JSON error bodies still map to the same unavailable copy.
  }

  return UNAVAILABLE
}

function dispatchSse(
  block: string,
  handlers: StreamHandlers,
): 'status' | 'token' | 'done' | 'error' | null {
  let eventName = 'message'
  const dataLines: string[] = []

  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim())
    }
  }

  if (dataLines.length === 0) {
    return null
  }

  try {
    const payload = JSON.parse(dataLines.join('\n')) as {
      type?: string
      text?: string
      message?: CopilotMessage | string
    }

    if (eventName === 'status' && typeof payload.text === 'string') {
      handlers.onStatus(payload.text)
      return 'status'
    }

    if (eventName === 'token' && typeof payload.text === 'string') {
      handlers.onToken(payload.text)
      return 'token'
    }

    if (eventName === 'done' && payload.message && typeof payload.message !== 'string') {
      handlers.onDone(payload.message)
      return 'done'
    }

    if (eventName === 'error') {
      handlers.onError(
        typeof payload.message === 'string' ? payload.message : UNAVAILABLE,
      )
      return 'error'
    }
  } catch {
    handlers.onError(UNAVAILABLE)
    return 'error'
  }

  return null
}
