import { supabase } from '@/lib/supabase/client'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

export const getCollaborators = async () => {
  const { data, error } = await supabase
    .from('collaborators')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const createCollaborator = async (
  collaborator: { name: string; email: string; role: string; avatar_url: string | null },
  password?: string,
) => {
  // Use a temporary client to sign up the new user without logging out the current admin
  const tempClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })

  const { data: authData, error: authError } = await tempClient.auth.signUp({
    email: collaborator.email,
    password: password || 'Gmc123456!',
  })

  if (authError) throw authError
  if (!authData.user) throw new Error('No se pudo crear el usuario en el sistema de autenticación')

  // Identify if a user already exists but we got a fake success due to email enumerability protection
  if (authData.user.identities && authData.user.identities.length === 0) {
    throw new Error('User already registered')
  }

  // The database has a trigger that creates the collaborator row automatically on signup.
  // We use upsert to update the row with the correct data (name, role, avatar_url) avoiding duplicate key error.
  const { data, error } = await supabase
    .from('collaborators')
    .upsert({
      id: authData.user.id,
      name: collaborator.name,
      email: collaborator.email,
      role: collaborator.role,
      avatar_url: collaborator.avatar_url,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateCollaborator = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('collaborators')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const removeCollaborator = async (id: string) => {
  const { error } = await supabase.from('collaborators').delete().eq('id', id)
  if (error) throw error
  return true
}
