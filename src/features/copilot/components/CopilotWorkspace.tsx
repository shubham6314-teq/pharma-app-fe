import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { PagePanel } from '../../../components/ui/PagePanel'
import { TextField } from '../../../components/ui/TextField'
import { useAppSelector } from '../../../store/hooks'
import {
  useCreateCopilotThreadMutation,
  useLazyGetCopilotThreadQuery,
} from '../api'
import { streamCopilotMessage } from '../stream-message'
import type { CopilotCitation, CopilotMessage, CopilotThread } from '../types'

const THREAD_STORAGE_KEY = 'pharma-copilot-thread-id'

const EXAMPLES = [
  'Which products are below reorder level?',
  'What does the reorder policy say?',
  'How many boxes of CRO500 are available?',
]

function readStoredThreadId(): string | null {
  try {
    return localStorage.getItem(THREAD_STORAGE_KEY)
  } catch {
    return null
  }
}

function storeThreadId(id: string): void {
  localStorage.setItem(THREAD_STORAGE_KEY, id)
}

function citationLabel(citation: CopilotCitation): string {
  if (citation.title) {
    return citation.title
  }

  if (citation.source === 'ledger') {
    return 'Ledger'
  }

  if (citation.source === 'document') {
    return 'Document'
  }

  return 'Inventory'
}

export function CopilotWorkspace() {
  const token = useAppSelector((state) => state.auth.token)
  const [createThread, createState] = useCreateCopilotThreadMutation()
  const [loadThread] = useLazyGetCopilotThreadQuery()
  const [thread, setThread] = useState<CopilotThread | null>(null)
  const [pendingUser, setPendingUser] = useState<CopilotMessage | null>(null)
  const [draft, setDraft] = useState('')
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [status, setStatus] = useState('Looking up inventory…')
  const [error, setError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const booted = useRef(false)

  useEffect(() => {
    if (booted.current) {
      return
    }

    booted.current = true
    const storedId = readStoredThreadId()

    void (async () => {
      try {
        if (storedId) {
          const existing = await loadThread(storedId).unwrap()
          setThread(existing)
          return
        }
      } catch {
        try {
          localStorage.removeItem(THREAD_STORAGE_KEY)
        } catch {
          // Ignore unavailable storage.
        }
      }

      try {
        const created = await createThread().unwrap()
        storeThreadId(created.id)
        setThread(created)
      } catch {
        setLoadError(true)
        setError('The copilot could not be started.')
      }
    })()
  }, [createThread, loadThread])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [thread, pendingUser, draft])

  const messages = [
    ...(thread?.messages ?? []),
    ...(pendingUser ? [pendingUser] : []),
  ]
  const empty = messages.length === 0 && draft === '' && !streaming

  async function startNewThread() {
    if (streaming) {
      return
    }

    setError(null)
    setLoadError(false)
    setPendingUser(null)
    setDraft('')
    try {
      const created = await createThread().unwrap()
      storeThreadId(created.id)
      setThread(created)
    } catch {
      setLoadError(true)
      setError('The copilot could not be started.')
    }
  }

  async function send(content: string) {
    const trimmed = content.trim()
    if (!trimmed || !thread || !token || streaming) {
      return
    }

    setInput('')
    setError(null)
    setStreaming(true)
    setStatus('Looking up inventory…')
    setDraft('')
    setPendingUser({
      id: 'pending-user',
      role: 'USER',
      content: trimmed,
      citations: null,
      createdAt: '',
    })

    await streamCopilotMessage({
      threadId: thread.id,
      content: trimmed,
      token,
      onStatus(text) {
        setStatus(text)
      },
      onToken(text) {
        setDraft((current) => current + text)
      },
      onDone() {
        setDraft('')
        setStreaming(false)
        setStatus('Looking up inventory…')
        setPendingUser(null)
        void loadThread(thread.id)
          .unwrap()
          .then(setThread)
          .catch(() => {
            setError('This conversation could not be loaded.')
          })
      },
      onError(message) {
        setDraft('')
        setStreaming(false)
        setStatus('Looking up inventory…')
        setError(message)
      },
    })
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void send(input)
  }

  return (
    <PagePanel
      title="Copilot"
      description="Ask about live stock, low-stock products, or uploaded policies. The copilot cannot change inventory."
      actions={
        <Button
          width="auto"
          size="sm"
          variant="secondary"
          disabled={streaming || createState.isLoading}
          onClick={() => {
            void startNewThread()
          }}
        >
          New conversation
        </Button>
      }
    >
      <div className="flex min-h-[32rem] flex-col">
        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {loadError ? (
            <p className="text-sm text-red-700">This conversation could not be loaded.</p>
          ) : null}
          {empty ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Try a question:</p>
              <div className="flex flex-col gap-2">
                {EXAMPLES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                    disabled={!thread || streaming}
                    onClick={() => {
                      void send(example)
                    }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {draft ? (
            <MessageBubble
              message={{
                id: 'draft',
                role: 'ASSISTANT',
                content: draft,
                citations: null,
                createdAt: '',
              }}
            />
          ) : null}
          {streaming && !draft ? (
            <p className="text-sm text-slate-500">{status}</p>
          ) : null}
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </div>
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-end"
        >
          <div className="min-w-0 flex-1">
            <TextField
              label="Question"
              name="content"
              value={input}
              srOnlyLabel
              placeholder="Ask about inventory…"
              disabled={!thread || streaming}
              onChange={(event) => setInput(event.target.value)}
            />
          </div>
          <Button
            type="submit"
            width="auto"
            disabled={!thread || streaming || input.trim() === ''}
          >
            Send
          </Button>
        </form>
      </div>
    </PagePanel>
  )
}

function MessageBubble({ message }: { message: CopilotMessage }) {
  const isUser = message.role === 'USER'
  const citations = Array.isArray(message.citations) ? message.citations : []

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
          isUser ? 'bg-teal-800 text-white' : 'bg-slate-100 text-slate-800'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {!isUser && citations.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {citations.map((citation) => (
              <li
                key={`${citation.source}:${citation.title ?? ''}`}
                className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-600"
              >
                {citationLabel(citation)}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
