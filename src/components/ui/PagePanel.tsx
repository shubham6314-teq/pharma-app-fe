import type { ReactNode } from 'react'
import { useSidebarUi } from '../../hooks/use-sidebar-ui'
import { IconMenu } from './icons'

type PagePanelProps = {
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
}

export function PagePanel({
  title,
  description,
  actions,
  children,
}: PagePanelProps) {
  const sidebarUi = useSidebarUi()

  return (
    // <div className="mx-auto w-full max-w-7xl">
    <div className="mx-auto w-full">
      <div className="flex items-start gap-3">
        {sidebarUi ? (
          <button
            type="button"
            className="mt-0.5 hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-800 hover:bg-slate-200/70 lg:flex"
            aria-label={
              sidebarUi.collapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            aria-expanded={!sidebarUi.collapsed}
            onClick={sidebarUi.toggleCollapsed}
          >
            <IconMenu />
          </button>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          {actions ? (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </div>
      </div>
      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_50px_-28px_rgba(15,42,46,0.35)]">
        {children}
      </div>
    </div>
  );
}
