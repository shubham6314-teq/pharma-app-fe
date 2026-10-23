import { createContext, useContext } from 'react'

export type SidebarUi = {
  collapsed: boolean
  toggleCollapsed: () => void
}

export const SidebarUiContext = createContext<SidebarUi | null>(null)

export function useSidebarUi() {
  return useContext(SidebarUiContext)
}
