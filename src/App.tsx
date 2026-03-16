import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { MainProvider } from '@/context/MainContext'
import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Inventario from '@/pages/Inventario'
import Clientes from '@/pages/Clientes'
import ClienteDetalle from '@/pages/ClienteDetalle'
import Ventas from '@/pages/Ventas'
import Facturacion from '@/pages/Facturacion'
import Reportes from '@/pages/Reportes'
import Auditoria from '@/pages/Auditoria'
import Configuracion from '@/pages/Configuracion'
import Rutas from '@/pages/Rutas'
import PortalCliente from '@/pages/PortalCliente'
import Usuarios from '@/pages/Usuarios'
import NotFound from '@/pages/NotFound'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <MainProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/portal-cliente" element={<PortalCliente />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/:id" element={<ClienteDetalle />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/facturacion" element={<Facturacion />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/auditoria" element={<Auditoria />} />
            <Route path="/rutas" element={<Rutas />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/configuracion" element={<Configuracion />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </MainProvider>
  </BrowserRouter>
)

export default App
