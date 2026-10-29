export type CopilotMessageRole = 'USER' | 'ASSISTANT'

export type CopilotCitation = {
  source: 'inventory' | 'ledger' | 'document' | 'catalog'
  title?: string
}

export type CopilotMessage = {
  id: string
  role: CopilotMessageRole
  content: string
  citations: CopilotCitation[] | null
  createdAt: string
}

export type CopilotThread = {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
  messages: CopilotMessage[]
}

export type CopilotStreamDoneEvent = {
  type: 'done'
  message: CopilotMessage
}

export type CopilotStreamErrorEvent = {
  type: 'error'
  message: string
}

export type CopilotStreamTokenEvent = {
  type: 'token'
  text: string
}
