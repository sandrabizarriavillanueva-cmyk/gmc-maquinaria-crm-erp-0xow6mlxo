import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { pb } from '@/lib/api'

interface AuthContextType {
  user: any | null
  session: any | null
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null)
  const [session, setSession] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('skip_token')
    const savedUser = localStorage.getItem('skip_user')
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setSession({ token, user: parsedUser })
        setUser(parsedUser)
      } catch (e) {
        localStorage.removeItem('skip_token')
        localStorage.removeItem('skip_user')
      }
    }
    setLoading(false)
  }, [])

  const signUp = async (email: string, password: string) => {
    return { error: new Error('Not implemented') }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const authData = await pb.authWithPassword('collaborators', email, password)
      localStorage.setItem('skip_token', authData.token)
      localStorage.setItem('skip_user', JSON.stringify(authData.record))
      setSession({ token: authData.token, user: authData.record })
      setUser(authData.record)
      return { error: null }
    } catch (err: any) {
      return { error: new Error('Invalid login credentials') }
    }
  }

  const signOut = async () => {
    localStorage.removeItem('skip_token')
    localStorage.removeItem('skip_user')
    setSession(null)
    setUser(null)
    return { error: null }
  }

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
