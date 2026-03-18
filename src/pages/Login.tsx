import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Navigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldAlert, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function Login() {
  const { signIn, session } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (session) return <Navigate to="/" replace />

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { error } = await signIn(email, password)
      if (error) throw error
    } catch (err: any) {
      toast({
        title: 'Error de Autenticación',
        description: err.message || 'Credenciales inválidas, verifica tu correo y contraseña.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-elevation border-0">
        <CardHeader className="text-center pb-8 pt-10">
          <ShieldAlert className="w-14 h-14 mx-auto text-orange-500 mb-6" />
          <CardTitle className="text-2xl font-bold text-slate-800">Acceso Operativo</CardTitle>
          <p className="text-slate-500 text-sm mt-2 font-medium">Inicia sesión para continuar</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4 pb-2">
            <Input
              placeholder="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 bg-slate-50"
            />
            <Input
              placeholder="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-14 bg-slate-50"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-lg bg-slate-800 hover:bg-slate-700 mt-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ingresar al Sistema'}
            </Button>
          </form>
          <div className="mt-6 text-center border-t pt-4">
            <p className="text-sm text-slate-500">
              ¿No tienes cuenta?{' '}
              <Link
                to="/signup"
                className="text-orange-600 hover:text-orange-700 font-semibold hover:underline"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
