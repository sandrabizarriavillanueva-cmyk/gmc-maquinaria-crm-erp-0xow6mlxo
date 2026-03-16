import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { LayoutDashboard, Package, Users, ShoppingCart, Receipt, ShieldAlert } from 'lucide-react'

const items = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Inventario', url: '/inventario', icon: Package },
  { title: 'Clientes', url: '/clientes', icon: Users },
  { title: 'Control Ventas', url: '/ventas', icon: ShoppingCart },
  { title: 'Facturación', url: '/facturacion', icon: Receipt },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-orange-500 text-white shadow-subtle">
            <ShieldAlert className="size-6" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-bold text-lg text-white">GMC</span>
            <span className="text-xs font-medium text-slate-400">Maquinaria</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.url}
                  className="h-11 rounded-lg transition-colors"
                >
                  <Link to={item.url}>
                    <item.icon className="size-5" />
                    <span className="font-medium text-[15px]">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-6">
        <div className="text-xs text-slate-500 font-medium">ERP v0.1 • Admin</div>
      </SidebarFooter>
    </Sidebar>
  )
}
