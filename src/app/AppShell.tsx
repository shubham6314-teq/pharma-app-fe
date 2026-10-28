import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import {
  IconBeaker,
  IconBox,
  IconChevron,
  IconClipboard,
  IconDatabase,
  IconFile,
  IconGrid,
  IconLayers,
  IconMenu,
  IconPackage,
  IconPills,
  IconSignOut,
  IconTag,
  IconUser,
} from '../components/ui/icons'
import { PharmacyMark } from '../components/ui/PharmacyMark'
import { ProfileButton } from '../components/ui/ProfileButton'
import { SidebarUiContext } from '../hooks/use-sidebar-ui'
import { useToast } from '../hooks/use-toast'
import { useLogoutMutation } from '../features/auth/api'
import { AlertBell } from '../features/inventory-alerts/components/AlertBell'
import { useAlertSocket } from '../features/inventory-alerts/use-alert-socket'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { clearAuth } from '../store/slices/auth-slice'
import {
  groupContainsPath,
  isNavGroup,
  navItems,
  navLabelForPath,
  type NavGroupItem,
  type NavIconName,
  type NavLinkItem,
} from './nav-items'

const SIDEBAR_COLLAPSED_KEY = 'pharma-sidebar-collapsed'

const navIcons: Record<NavIconName, ReactNode> = {
  divisions: <IconLayers />,
  categories: <IconTag />,
  products: <IconPills />,
  masterData: <IconDatabase />,
  packTypes: <IconPackage />,
  contentUnits: <IconBeaker />,
  overview: <IconGrid />,
  inventory: <IconBox />,
  alerts: <IconBox />,
  policies: <IconFile />,
  orders: <IconClipboard />,
  prescriptions: <IconFile />,
}

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

export function AppShell() {
  const [navOpen, setNavOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const location = useLocation()
  const [navPath, setNavPath] = useState(location.pathname)
  if (navPath !== location.pathname) {
    setNavPath(location.pathname)
    setNavOpen(false)
  }
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const [logout] = useLogoutMutation()
  const user = useAppSelector((state) => state.auth.user)
  const currentLabel = navLabelForPath(location.pathname)
  useAlertSocket()

  useEffect(() => {
    if (!navOpen) {
      return
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setNavOpen(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [navOpen])

  async function handleSignOut() {
    try {
      await logout().unwrap()
    } catch {
      // Cookie may already be gone; still leave the local session.
    } finally {
      dispatch(clearAuth())
      toast.success('Signed out.')
      navigate('/login', { replace: true })
    }
  }

  function setSidebarCollapsed(next: boolean) {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0')
    setCollapsed(next)
  }

  function toggleCollapsed() {
    setSidebarCollapsed(!collapsed)
  }

  return (
    <SidebarUiContext.Provider value={{ collapsed, toggleCollapsed }}>
      <div className="min-h-svh bg-[#f4f7f6] lg:flex">
        <aside
          className={`sticky top-0 hidden h-svh shrink-0 flex-col overflow-hidden bg-[#0b3d3a] text-white transition-[width] duration-200 ease-out lg:flex ${
            collapsed ? 'w-[4.75rem]' : 'w-64'
          }`}
        >
          <SidebarNav
            collapsed={collapsed}
            userName={user?.name}
            userEmail={user?.email}
            onSignOut={handleSignOut}
            onExpandSidebar={() => setSidebarCollapsed(false)}
          />
        </aside>

        <div
          className="fixed inset-0 z-40 bg-slate-900/40 transition-opacity duration-200 lg:hidden"
          style={{
            opacity: navOpen ? 1 : 0,
            pointerEvents: navOpen ? 'auto' : 'none',
          }}
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />

        <aside
          id="app-sidebar"
          className="fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col overflow-y-auto bg-[#0b3d3a] text-white transition-transform duration-200 ease-out lg:hidden"
          style={{ transform: navOpen ? 'translateX(0)' : 'translateX(-100%)' }}
          aria-hidden={!navOpen}
          aria-label="Navigation"
          aria-modal={navOpen ? true : undefined}
          role={navOpen ? 'dialog' : undefined}
          inert={!navOpen}
        >
          <SidebarNav
            collapsed={false}
            userName={user?.name}
            userEmail={user?.email}
            onSignOut={handleSignOut}
            onNavigate={() => setNavOpen(false)}
          />
        </aside>

        <div className="flex min-h-svh min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-[#f4f7f6]/95 px-4 backdrop-blur lg:hidden">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-800 hover:bg-slate-200/70"
              aria-label="Open menu"
              aria-expanded={navOpen}
              aria-controls="app-sidebar"
              onClick={() => setNavOpen(true)}
            >
              <IconMenu />
            </button>
            <PharmacyMark tone="onLight" />
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
              {currentLabel}
            </p>
            <AlertBell />
            <ProfileButton />
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto px-3 py-5 sm:px-4 lg:px-5 lg:py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarUiContext.Provider>
  )
}

function SidebarNav({
  collapsed,
  userName,
  userEmail,
  onSignOut,
  onNavigate,
  onExpandSidebar,
}: {
  collapsed: boolean
  userName: string | undefined
  userEmail: string | undefined
  onSignOut: () => void
  onNavigate?: () => void
  onExpandSidebar?: () => void
}) {
  return (
    <>
      <div className={`py-4 ${collapsed ? 'px-2' : 'px-3'}`}>
        {collapsed ? (
          <div className="flex justify-center">
            <AlertBell tone="onDark" />
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-3">
            <PharmacyMark tone="onDark" />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold tracking-tight">PharmaDesk</p>
              <p className="text-sm text-teal-100/75">Pharmacy operations</p>
            </div>
            <AlertBell tone="onDark" />
          </div>
        )}
      </div>

      <nav className={`flex flex-1 flex-col gap-1 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'}`}>
        {navItems.map((item) =>
          isNavGroup(item) ? (
            <SidebarNavGroup
              key={item.id}
              group={item}
              collapsed={collapsed}
              onNavigate={onNavigate}
              onExpandSidebar={onExpandSidebar}
            />
          ) : (
            <SidebarNavLink
              key={item.to}
              item={item}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ),
        )}
      </nav>

      <SidebarAccount
        collapsed={collapsed}
        userName={userName}
        userEmail={userEmail}
        onSignOut={onSignOut}
        onNavigate={onNavigate}
      />
    </>
  )
}

function navLinkClassName(isActive: boolean, collapsed: boolean) {
  return `flex items-center rounded-xl text-sm font-medium transition ${
    collapsed ? 'h-10 justify-center' : 'gap-3 px-3 py-2.5'
  } ${
    isActive
      ? 'bg-white/12 text-white'
      : 'text-teal-100/75 hover:bg-white/10 hover:text-white'
  }`
}

function SidebarNavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavLinkItem
  collapsed: boolean
  nested?: boolean
  onNavigate?: () => void
}) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) => navLinkClassName(isActive, collapsed)}
    >
      <span className="shrink-0">{navIcons[item.icon]}</span>
      {collapsed ? <span className="sr-only">{item.label}</span> : item.label}
    </NavLink>
  )
}

function SidebarNavGroup({
  group,
  collapsed,
  onNavigate,
  onExpandSidebar,
}: {
  group: NavGroupItem
  collapsed: boolean
  onNavigate?: () => void
  onExpandSidebar?: () => void
}) {
  const location = useLocation()
  const childActive = groupContainsPath(group, location.pathname)
  const [expanded, setExpanded] = useState(childActive)
  const open = childActive || expanded

  if (collapsed) {
    return (
      <button
        type="button"
        title={group.label}
        aria-label={group.label}
        className={navLinkClassName(childActive, true)}
        onClick={() => {
          setExpanded(true)
          onExpandSidebar?.()
        }}
      >
        <span className="shrink-0">{navIcons[group.icon]}</span>
        <span className="sr-only">{group.label}</span>
      </button>
    )
  }

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
          childActive
            ? 'bg-white/12 text-white'
            : 'text-teal-100/75 hover:bg-white/10 hover:text-white'
        }`}
        onClick={() => setExpanded((current) => (childActive ? true : !current))}
      >
        <span className="shrink-0">{navIcons[group.icon]}</span>
        <span className="min-w-0 flex-1 truncate">{group.label}</span>
        <IconChevron
          className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open ? (
        <div className="mt-1 ml-4 flex flex-col gap-1 border-l border-white/10 pl-2">
          {group.children.map((item) => (
            <SidebarNavLink
              key={item.to}
              item={item}
              collapsed={false}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function SidebarAccount({
  collapsed,
  userName,
  userEmail,
  onSignOut,
  onNavigate,
}: {
  collapsed: boolean
  userName: string | undefined
  userEmail: string | undefined
  onSignOut: () => void
  onNavigate?: () => void
}) {
  const location = useLocation()
  const isProfile = location.pathname === '/profile'
  const displayName = userName || userEmail || 'Profile'

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1 border-t border-white/10 p-2">
        <ProfileButton tone="onDark" />
        <Button
          variant="ghost"
          width="auto"
          className="h-10 w-10 px-0"
          aria-label="Sign out"
          title="Sign out"
          onClick={onSignOut}
        >
          <IconSignOut />
        </Button>
      </div>
    )
  }

  return (
    <div className="border-t border-white/10 p-4">
      <Link
        to="/profile"
        onClick={onNavigate}
        aria-current={isProfile ? 'page' : undefined}
        className={`flex items-center gap-3 rounded-xl px-2 py-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
          isProfile ? 'bg-white/12 text-white' : 'text-white hover:bg-white/10'
        }`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <IconUser />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{displayName}</span>
          {userName && userEmail ? (
            <span className="block truncate text-xs text-teal-100/75">
              {userEmail}
            </span>
          ) : null}
        </span>
      </Link>
      <Button className="mt-3" type="button" onClick={onSignOut}>
        Sign out
      </Button>
    </div>
  )
}
