import { Outlet, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { Bell, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Layout() {
  const location = useLocation()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen bg-slate-50/50">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 shadow-sm z-10 lg:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="text-slate-600 hover:text-orange-500 transition-colors" />
            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
            <h2 className="text-lg font-bold text-slate-800 ml-2 hidden sm:block tracking-tight">
              Portal Operativo
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative hover:bg-slate-100">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse border border-white"></span>
            </Button>
            <Button
              variant="ghost"
              className="hidden sm:flex gap-2 font-medium text-slate-600 hover:text-slate-900"
            >
              <UserCircle className="w-6 h-6" /> Admin
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto relative">
          <div
            key={location.pathname}
            className="h-full p-4 md:p-6 lg:p-8 animate-fade-in duration-200 ease-out"
          >
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
