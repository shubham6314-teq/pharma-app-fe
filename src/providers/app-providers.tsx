import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { Toaster } from '../components/ui/Toaster'
import { store } from '../store'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      {children}
      <Toaster />
    </Provider>
  )
}
