export type NavIconName =
  | 'divisions'
  | 'categories'
  | 'products'
  | 'overview'
  | 'inventory'
  | 'orders'
  | 'prescriptions'

export type NavItem = {
  to: string
  label: string
  icon: NavIconName
  end?: boolean
}

export const navItems: NavItem[] = [
  { to: "/divisions", label: "Divisions", icon: "divisions" },
  { to: "/categories", label: "Categories", icon: "categories" },
  { to: "/products", label: "Products", icon: "products" },

  { to: "/inventory", label: "Inventory", icon: "inventory" },
  { to: "/overview", label: "Overview", icon: "overview" },
  { to: "/orders", label: "Orders", icon: "orders" },
  { to: "/prescriptions", label: "Prescriptions", icon: "prescriptions" },
];
