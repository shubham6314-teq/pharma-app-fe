import { useEffect, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useRefreshMutation } from '../features/auth/api'
import { CategoriesPage } from '../pages/categories/CategoriesPage'
import { ContentUnitsPage } from '../pages/content-units/ContentUnitsPage'
import { DivisionsPage } from '../pages/divisions/DivisionsPage'
import { PackTypesPage } from '../pages/pack-types/PackTypesPage'
import { ProductsPage } from '../pages/products/ProductsPage'
import { HomePage } from '../pages/home/HomePage'
import { InventoryPage } from '../pages/inventory/InventoryPage'
import { LoginPage } from '../pages/login/LoginPage'
import { OrdersPage } from '../pages/orders/OrdersPage'
import { ProfilePage } from '../pages/profile/ProfilePage'
import { PrescriptionsPage } from '../pages/prescriptions/PrescriptionsPage'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { markSessionChecked } from '../store/slices/auth-slice'
import { AppShell } from './AppShell'

function SessionGate({ children }: { children: ReactNode }) {
  const sessionChecked = useAppSelector((state) => state.auth.sessionChecked)
  const dispatch = useAppDispatch()
  const [refresh] = useRefreshMutation()

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      try {
        await refresh().unwrap()
      } catch {
        // No cookie or expired session — route guards decide next.
      } finally {
        if (!cancelled) {
          dispatch(markSessionChecked())
        }
      }
    }

    void restoreSession()

    return () => {
      cancelled = true
    }
  }, [dispatch, refresh])

  if (!sessionChecked) {
    return (
      <div className="grid min-h-svh place-items-center bg-[#f4f7f6] text-sm text-slate-500">
        Restoring session…
      </div>
    )
  }

  return children
}

function RequireAuth({ children }: { children: ReactNode }) {
  const token = useAppSelector((state) => state.auth.token)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

function GuestOnly({ children }: { children: ReactNode }) {
  const token = useAppSelector((state) => state.auth.token)

  if (token) {
    return <Navigate to="/" replace />
  }

  return children
}

export function App() {
  return (
    <SessionGate>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestOnly>
                <LoginPage />
              </GuestOnly>
            }
          />
          <Route
            path="/"
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/divisions" replace />} />
            <Route path="divisions" element={<DivisionsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="pack-types" element={<PackTypesPage />} />
            <Route path="content-units" element={<ContentUnitsPage />} />
            <Route path="overview" element={<HomePage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="prescriptions" element={<PrescriptionsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionGate>
  )
}
