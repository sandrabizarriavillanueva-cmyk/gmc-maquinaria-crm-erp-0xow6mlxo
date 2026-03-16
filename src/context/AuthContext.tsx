import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { pb } from '@/lib/api'

interface AuthContextType {
  user: any
  token: string | null
  login: (email: string, pass: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('skip_token'))

  useEffect(() => {
    if (token) {
      const storedUser = localStorage.getItem('skip_user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          // Ignore JSON parse errors
        }
      }
    }
  }, [token])

  const login = async (email: string, pass: string) => {
    const data = await pb.authWithPassword('collaborators', email, pass)
    setToken(data.token)
    setUser(data.record)
    localStorage.setItem('skip_token', data.token)
    localStorage.setItem('skip_user', JSON.stringify(data.record))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('skip_token')
    localStorage.removeItem('skip_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>
  )
}
