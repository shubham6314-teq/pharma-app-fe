export type NavIconName =
  | 'divisions'
  | 'categories'
  | 'products'
  | 'masterData'
  | 'packTypes'
  | 'contentUnits'
  | 'overview'
  | 'inventory'
  | 'orders'
  | 'prescriptions'

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
  { to: "/divisions", label: "Divisions", icon: "divisions" },
  { to: "/categories", label: "Categories", icon: "categories" },
  { to: "/products", label: "Products", icon: "products" },
  { to: "/inventory", label: "Inventory", icon: "inventory" },
  {
    type: "group",
    id: "master-data",
    label: "Master data",
    icon: "masterData",
    children: [
      { to: "/pack-types", label: "Pack types", icon: "packTypes" },
      { to: "/content-units", label: "Content units", icon: "contentUnits" },
    ],
  },
  {
    type: "group",
    id: "master-data",
    label: "Master data",
    icon: "masterData",
    children: [
      { to: "/pack-types", label: "Pack types", icon: "packTypes" },
      { to: "/content-units", label: "Content units", icon: "contentUnits" },
    ],
  },
  { to: "/overview", label: "Overview", icon: "overview" },
  { to: "/orders", label: "Orders", icon: "orders" },
  { to: "/prescriptions", label: "Prescriptions", icon: "prescriptions" },
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

  return (
    flattenNavLinks().find((item) =>
      item.end ? pathname === item.to : pathname.startsWith(item.to),
    )?.label ?? 'Divisions'
  )
}

export function groupContainsPath(group: NavGroupItem, pathname: string): boolean {
  return group.children.some((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to),
  )
}
