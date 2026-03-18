import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ShieldAlert, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function Signup() {
  const { signUp, session } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  if (session) return <Navigate to="/" replace />

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'O nome é obrigatório'
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'E-mail inválido'
    if (!formData.password || formData.password.length < 6)
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres'
    if (formData.password !== formData.confirm) newErrors.confirm = 'As senhas não coincidem'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast({
        title: 'Erro de validação',
        description: 'Por favor, corrija os campos destacados.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await signUp(formData.email, formData.password, formData.name)
      if (error) {
        if (
          error.message.includes('already registered') ||
          error.message.includes('already exists')
        ) {
          throw new Error('Este e-mail já está cadastrado.')
        }
        throw error
      }
      toast({ title: 'Sucesso', description: 'Conta criada com sucesso!' })
      navigate('/login')
    } catch (err: any) {
      toast({
        title: 'Erro no cadastro',
        description: err.message || 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 py-10">
      <Card className="w-full max-w-md shadow-elevation border-0">
        <CardHeader className="text-center pb-6 pt-8">
          <ShieldAlert className="w-12 h-12 mx-auto text-orange-500 mb-4" />
          <CardTitle className="text-2xl font-bold text-slate-800">Criar conta</CardTitle>
          <CardDescription className="mt-2">
            Preencha os dados para se registrar na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name" className={cn(errors.name && 'text-red-500')}>
                Nome Completo
              </Label>
              <Input
                id="name"
                placeholder="Seu nome"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  setErrors({ ...errors, name: '' })
                }}
                className={cn(
                  'h-11 bg-slate-50',
                  errors.name && 'border-red-500 focus-visible:ring-red-500',
                )}
              />
              {errors.name && <p className="text-xs font-medium text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className={cn(errors.email && 'text-red-500')}>
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Seu e-mail"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  setErrors({ ...errors, email: '' })
                }}
                className={cn(
                  'h-11 bg-slate-50',
                  errors.email && 'border-red-500 focus-visible:ring-red-500',
                )}
              />
              {errors.email && <p className="text-xs font-medium text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className={cn(errors.password && 'text-red-500')}>
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  setErrors({ ...errors, password: '' })
                }}
                className={cn(
                  'h-11 bg-slate-50',
                  errors.password && 'border-red-500 focus-visible:ring-red-500',
                )}
              />
              {errors.password && (
                <p className="text-xs font-medium text-red-500">{errors.password}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm" className={cn(errors.confirm && 'text-red-500')}>
                Confirmar Senha
              </Label>
              <Input
                id="confirm"
                type="password"
                placeholder="Repita a senha"
                value={formData.confirm}
                onChange={(e) => {
                  setFormData({ ...formData, confirm: e.target.value })
                  setErrors({ ...errors, confirm: '' })
                }}
                className={cn(
                  'h-11 bg-slate-50',
                  errors.confirm && 'border-red-500 focus-visible:ring-red-500',
                )}
              />
              {errors.confirm && (
                <p className="text-xs font-medium text-red-500">{errors.confirm}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-orange-500 hover:bg-orange-600 mt-6"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registrar-se'}
            </Button>
          </form>
          <div className="border-t pt-6 text-center">
            <Button
              asChild
              variant="link"
              className="text-slate-500 hover:text-slate-800 p-0 h-auto font-normal"
            >
              <Link to="/login" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Voltar para o Login
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
