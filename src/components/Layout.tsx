import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { RoleSelector } from './RoleSelector'
import { NotificationsDropdown } from './NotificationsDropdown'
import { useAuth } from '@/hooks/use-auth'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Layout() {
  const location = useLocation()
  const { session, signOut } = useAuth()

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen bg-slate-50/50">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 shadow-sm z-10 lg:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="text-slate-600 hover:text-orange-500 transition-colors" />
            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
            <h2 className="text-lg font-bold text-slate-800 ml-2 hidden sm:block tracking-tight">
              Gestion GMC
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationsDropdown />
            <RoleSelector />
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              title="Cerrar sesión"
              className="text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto relative">
          <div
            key={location.pathname}
            className="h-full p-4 md:p-6 lg:p-8 animate-fade-in duration-200 ease-out bg-[#a7b6bc]"
          >
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
