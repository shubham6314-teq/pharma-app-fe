import { useState, type FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { PagePanel } from '../../../components/ui/PagePanel'
import { TextField } from '../../../components/ui/TextField'
import {
  useCreateKnowledgeDocumentMutation,
  useGetKnowledgeDocumentsQuery,
} from '../api'
import type { KnowledgeDocumentKind } from '../types'

export function KnowledgeWorkspace() {
  const { data, isLoading, isError } = useGetKnowledgeDocumentsQuery()
  const [createDocument, createState] = useCreateKnowledgeDocumentMutation()
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<KnowledgeDocumentKind>('POLICY')
  const [file, setFile] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file || title.trim() === '') {
      setFormError('Add a title and a text or PDF file.')
      return
    }

    const body = new FormData()
    body.set('title', title.trim())
    body.set('kind', kind)
    body.set('file', file)
    setFormError(null)

    try {
      await createDocument(body).unwrap()
      setTitle('')
      setFile(null)
      event.currentTarget.reset()
    } catch {
      setFormError('The document could not be indexed.')
    }
  }

  return (
    <PagePanel
      title="Policies and supplier documents"
      description="Uploaded text is used only to explain a low-stock alert. It does not change inventory quantities."
    >
      <form onSubmit={onSubmit} className="grid gap-4 border-b border-slate-100 p-5 sm:grid-cols-2">
        <TextField
          label="Title"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <label className="block text-sm font-medium text-slate-700">
          Kind
          <select
            name="kind"
            value={kind}
            onChange={(event) => setKind(event.target.value as KnowledgeDocumentKind)}
            className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900"
          >
            <option value="POLICY">Policy</option>
            <option value="SUPPLIER">Supplier</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          File
          <input
            name="file"
            type="file"
            accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm text-slate-600"
          />
        </label>
        {formError ? (
          <p className="text-sm text-red-700 sm:col-span-2">{formError}</p>
        ) : null}
        <div className="sm:col-span-2 sm:max-w-xs">
          <Button type="submit" disabled={createState.isLoading}>
            Upload document
          </Button>
        </div>
      </form>
      {isLoading ? <p className="px-5 py-8 text-sm text-slate-500">Loading documents…</p> : null}
      {isError ? (
        <p className="px-5 py-8 text-sm text-red-700">Documents could not be loaded.</p>
      ) : null}
      {data && data.length === 0 ? (
        <p className="px-5 py-8 text-sm text-slate-500">No documents uploaded yet.</p>
      ) : null}
      {data && data.length > 0 ? (
        <ul className="divide-y divide-slate-100">
          {data.map((document) => (
            <li key={document.id} className="flex items-center justify-between px-5 py-4">
              <span>
                <span className="block font-medium text-slate-900">{document.title}</span>
                <span className="text-sm text-slate-500">
                  {document.kind === 'POLICY' ? 'Policy' : 'Supplier'} · {document.filename}
                </span>
              </span>
              <span className="text-sm text-slate-500">
                {document._count.chunks} sections
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </PagePanel>
  )
}