import { useStore } from '@/context/MainContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Image as ImageIcon, Upload, Download, ShieldCheck, Database, Camera } from 'lucide-react'
import { UserRole, ModuleId } from '@/types'
import { toast } from '@/hooks/use-toast'
import { RestrictedAccess } from '@/components/RestrictedAccess'

export default function Configuracion() {
  const {
    currentRole,
    permissions,
    updateRolePermission,
    companyLogo,
    updateCompanyLogo,
    userAvatar,
    updateUserAvatar,
    clients,
    products,
    invoices,
    auditLogs,
  } = useStore()

  if (!permissions[currentRole].configuracion) return <RestrictedAccess />

  const isAdmin = currentRole === 'Administrador'

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target?.files
    if (!files || files.length === 0) return
    const file = files[0]
    if (file) {
      const r = new FileReader()
      r.onloadend = () => {
        updateCompanyLogo(r.result as string)
        toast({ title: 'Logo actualizado' })
      }
      r.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target?.files
    if (!files || files.length === 0) return
    const file = files[0]
    if (file) {
      const r = new FileReader()
      r.onloadend = () => {
        updateUserAvatar(r.result as string)
        toast({ title: 'Perfil actualizado' })
      }
      r.readAsDataURL(file)
    }
  }

  const exportJSON = () => {
    const data = { clients, products, invoices, auditLogs }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'GMC_Respaldo.json'
    a.click()
    toast({ title: 'Exportación Exitosa', description: 'Archivo JSON generado correctamente.' })
  }

  const exportExcel = () => {
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="utf-8"></head>
      <body>
        <h2>Clientes</h2><table border="1"><tr><th>ID</th><th>RUT</th><th>Nombre</th><th>Región</th></tr>${clients.map((c) => `<tr><td>${c.id}</td><td>${c.rut}</td><td>${c.name}</td><td>${c.region}</td></tr>`).join('')}</table>
        <h2>Inventario</h2><table border="1"><tr><th>SKU</th><th>Equipo</th><th>Categoría</th><th>Estado</th><th>Stock</th></tr>${products.map((p) => `<tr><td>${p.sku}</td><td>${p.name}</td><td>${p.category}</td><td>${p.status}</td><td>${p.stock}</td></tr>`).join('')}</table>
      </body></html>
    `
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'GMC_Reporte.xls'
    a.click()
    toast({ title: 'Exportación Exitosa', description: 'Archivo Excel generado correctamente.' })
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Configuración Global</h1>
        <p className="text-slate-500">
          Administra tu perfil, la imagen corporativa y políticas de acceso.
        </p>
      </div>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid grid-cols-2 md:flex h-auto md:h-12 bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="perfil" className="text-sm px-6 h-9">
            Mi Perfil
          </TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="branding" className="text-sm px-6 h-9">
                Branding
              </TabsTrigger>
              <TabsTrigger value="permisos" className="text-sm px-6 h-9">
                Gestión de Usuarios
              </TabsTrigger>
              <TabsTrigger value="datos" className="text-sm px-6 h-9">
                Respaldo y Exportación
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="perfil" className="mt-6">
          <Card className="shadow-subtle max-w-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" /> Foto de Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-6 items-center">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  className="w-32 h-32 rounded-full object-cover border-4 border-slate-100"
                />
              ) : (
                <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border-4 border-white shadow-sm">
                  <ImageIcon className="w-10 h-10" />
                </div>
              )}
              <div className="space-y-2 text-center sm:text-left">
                <p className="text-sm text-slate-500">
                  Sube una imagen para identificarte en el sistema y en la Auditoría.
                </p>
                <div className="relative">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Upload className="w-4 h-4 mr-2" /> Seleccionar Imagen
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="branding" className="mt-6">
              <Card className="shadow-subtle max-w-xl">
                <CardHeader>
                  <CardTitle>Identidad Visual</CardTitle>
                  <CardDescription>Logo aplicado a PDFs y panel lateral.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center">
                    {companyLogo ? (
                      <img src={companyLogo} className="h-20 object-contain mb-4" />
                    ) : (
                      <div className="h-20 w-20 bg-white shadow-sm rounded-lg flex items-center justify-center text-orange-500 mb-4">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    <div className="relative mt-2">
                      <Button className="bg-slate-800 hover:bg-slate-700">
                        <Upload className="w-4 h-4 mr-2" /> Subir Logo Corporativo
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permisos" className="mt-6">
              <div className="grid gap-6 md:grid-cols-3">
                {(['Administrador', 'Vendedor', 'Técnico'] as UserRole[]).map((role) => (
                  <Card key={role} className="shadow-subtle">
                    <CardHeader className="bg-slate-50 border-b pb-4 rounded-t-lg">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-orange-500" /> {role}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      {Object.keys(permissions[role]).map((mod) => (
                        <div key={mod} className="flex items-center justify-between">
                          <Label className="capitalize text-slate-700 cursor-pointer">{mod}</Label>
                          <Switch
                            checked={permissions[role][mod as ModuleId]}
                            onCheckedChange={(val) =>
                              updateRolePermission(role, mod as ModuleId, val)
                            }
                            disabled={role === 'Administrador' && mod === 'configuracion'}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="datos" className="mt-6">
              <Card className="shadow-subtle max-w-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" /> Herramientas de Datos
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={exportExcel}
                    variant="outline"
                    className="h-14 flex-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  >
                    <Download className="w-5 h-5 mr-2" /> Exportar a Excel
                  </Button>
                  <Button
                    onClick={exportJSON}
                    variant="outline"
                    className="h-14 flex-1 text-blue-700 border-blue-200 hover:bg-blue-50"
                  >
                    <Download className="w-5 h-5 mr-2" /> Exportar a JSON
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
