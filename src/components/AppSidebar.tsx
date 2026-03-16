import { Link, useLocation } from 'react-router-dom'
import { useStore } from '@/context/MainContext'
import { ModuleId } from '@/types'
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
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Receipt,
  ShieldAlert,
  BarChart3,
  ClipboardList,
  Settings,
  MapPin,
  ExternalLink,
  UserCog,
} from 'lucide-react'

export function AppSidebar() {
  const location = useLocation()
  const { currentRole, permissions, companyLogo } = useStore()

  const allItems: { id: ModuleId; title: string; url: string; icon: any }[] = [
    { id: 'dashboard', title: 'Dashboard', url: '/', icon: LayoutDashboard },
    { id: 'inventario', title: 'Inventario', url: '/inventario', icon: Package },
    { id: 'clientes', title: 'Clientes', url: '/clientes', icon: Users },
    { id: 'ventas', title: 'Control Ventas', url: '/ventas', icon: ShoppingCart },
    { id: 'facturacion', title: 'Facturación', url: '/facturacion', icon: Receipt },
    { id: 'rutas', title: 'Rutas de Terreno', url: '/rutas', icon: MapPin },
    { id: 'usuarios', title: 'Colaboradores', url: '/usuarios', icon: UserCog },
    { id: 'reportes', title: 'Reportes', url: '/reportes', icon: BarChart3 },
    { id: 'auditoria', title: 'Auditoría', url: '/auditoria', icon: ClipboardList },
    { id: 'configuracion', title: 'Configuración', url: '/configuracion', icon: Settings },
  ]

  const items = allItems.filter((item) => permissions[currentRole][item.id])

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt="Logo"
              className="w-10 h-10 object-contain rounded-lg shadow-sm bg-white p-1"
            />
          ) : (
            <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-orange-500 text-white shadow-subtle">
              <ShieldAlert className="size-6" />
            </div>
          )}
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
      <SidebarFooter className="p-4">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs text-slate-400 w-full justify-start hover:text-orange-500 hover:bg-slate-800"
          >
            <Link to="/portal-cliente" target="_blank">
              <ExternalLink className="w-4 h-4 mr-2" /> Portal de Clientes
            </Link>
          </Button>
          <div className="text-xs text-slate-500 font-medium px-2 py-1">
            ERP v0.3 • {currentRole}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
