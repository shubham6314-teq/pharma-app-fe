export type KnowledgeDocumentKind = 'POLICY' | 'SUPPLIER'

export type KnowledgeDocument = {
  id: string
  title: string
  kind: KnowledgeDocumentKind
  filename: string
  createdAt: string
  _count: {
    chunks: number
  }
}
