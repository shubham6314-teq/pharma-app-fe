export type NavIconName =
  | 'divisions'
  | 'categories'
  | 'products'
  | 'masterData'
  | 'packTypes'
  | 'contentUnits'
  | 'overview'
  | 'inventory'
  | 'alerts'
  | 'copilot'
  | 'policies'
  | 'orders'
  | 'suppliers'

export type NavLinkItem = {
  type?: 'link'
  to: string
  label: string
  icon: NavIconName
  end?: boolean
}

export type NavGroupItem = {
  type: 'group'
  id: string
  label: string
  icon: NavIconName
  children: NavLinkItem[]
}

export type NavEntry = NavLinkItem | NavGroupItem

export const navItems: NavEntry[] = [
  { to: '/overview', label: 'Overview', icon: 'overview' },
  { to: '/inventory-alerts', label: 'Alerts', icon: 'alerts' },
  { to: '/orders', label: 'Orders', icon: 'orders' },
  { to: '/inventory', label: 'Inventory', icon: 'inventory' },
  { to: '/copilot', label: 'Copilot', icon: 'copilot' },
  { to: '/knowledge', label: 'Policies', icon: 'policies' },
  { to: '/divisions', label: 'Divisions', icon: 'divisions' },
  { to: '/categories', label: 'Categories', icon: 'categories' },
  { to: '/products', label: 'Products', icon: 'products' },
  {
    type: 'group',
    id: 'master-data',
    label: 'Master data',
    icon: 'masterData',
    children: [
      { to: '/pack-types', label: 'Pack types', icon: 'packTypes' },
      { to: '/content-units', label: 'Content units', icon: 'contentUnits' },
      { to: '/suppliers', label: 'Suppliers', icon: 'suppliers' },
    ],
  },
];

export function isNavGroup(item: NavEntry): item is NavGroupItem {
  return item.type === 'group'
}

export function flattenNavLinks(items: NavEntry[] = navItems): NavLinkItem[] {
  return items.flatMap((item) => (isNavGroup(item) ? item.children : [item]))
}

export function navLabelForPath(pathname: string): string {
  if (pathname === '/profile') {
    return 'Profile'
  }

  const matches = flattenNavLinks().filter((item) =>
    item.end
      ? pathname === item.to
      : pathname === item.to || pathname.startsWith(`${item.to}/`),
  )

  return matches.sort((left, right) => right.to.length - left.to.length)[0]?.label ?? 'Overview'
}

export function groupContainsPath(group: NavGroupItem, pathname: string): boolean {
  return group.children.some((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to),
  )
}
