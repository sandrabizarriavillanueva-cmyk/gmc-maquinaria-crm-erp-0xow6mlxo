import { supabase } from '@/lib/supabase/client'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

// Cliente de Auth secundario para crear usuarios sin cerrar la sesión del admin actual
const authClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const getBaseUrl = () => {
  if (typeof window === 'undefined') return '/api/collections'
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'https://gmc-maquinaria-crmerp-f8291.goskip.app/api/collections'
  }
  return '/api/collections'
}

const BASE_URL = getBaseUrl()

const handleResponse = async (res: Response, collection: string, action: string) => {
  if (!res.ok) {
    let errorMsg = ''
    try {
      const data = await res.json()
      errorMsg = JSON.stringify(data)
    } catch {
      errorMsg = await res.text()
    }
    throw new Error(`Error ${res.status} al ${action} en '${collection}': ${errorMsg}`)
  }
  return action === 'eliminar' ? true : res.json()
}

const mapToDB = (collection: string, payload: any) => {
  const data = { ...payload }
  if (collection === 'products') {
    if (data.sku) {
      data.code = data.sku
      delete data.sku
    }
    if (data.minStock !== undefined) {
      data.min_stock = data.minStock
      delete data.minStock
    }
    if (data.imageUrl) {
      data.image_url = data.imageUrl
      delete data.imageUrl
    }
    if (data.clientId) {
      data.client_id = data.clientId
      delete data.clientId
    }
  } else if (collection === 'users') {
    if (data.avatarUrl) {
      data.avatar_url = data.avatarUrl
      delete data.avatarUrl
    }
    delete data.password
    delete data.passwordConfirm
    delete data.avatar
  }
  return data
}

const mapFromDB = (collection: string, data: any) => {
  const item = { ...data }
  if (collection === 'products') {
    if (item.code) {
      item.sku = item.code
      delete item.code
    }
    if (item.min_stock !== undefined) {
      item.minStock = item.min_stock
      delete item.min_stock
    }
    if (item.image_url) {
      item.imageUrl = item.image_url
      delete item.image_url
    }
    if (item.client_id) {
      item.clientId = item.client_id
      delete item.client_id
    }
  } else if (collection === 'users') {
    if (item.avatar_url) {
      item.avatarUrl = item.avatar_url
      delete item.avatar_url
    }
  }
  return item
}

const isSupabaseCollection = (collection: string) => ['users', 'products'].includes(collection)

export const pb = {
  getFileUrl: (collection: string, id: string, filename: string) => {
    if (isSupabaseCollection(collection)) {
      if (!filename) return ''
      if (filename.startsWith('http') || filename.startsWith('data:')) return filename
      const bucket = collection === 'users' ? 'avatars' : 'products'
      return supabase.storage.from(bucket).getPublicUrl(`${id}/${filename}`).data.publicUrl
    }
    if (!filename) return ''
    if (filename.startsWith('http') || filename.startsWith('data:')) return filename
    const filesUrl = BASE_URL.replace('/collections', '/files')
    return `${filesUrl}/${collection}/${id}/${filename}`
  },
  get: async (collection: string) => {
    if (isSupabaseCollection(collection)) {
      const table = collection === 'users' ? 'collaborators' : collection
      const { data, error } = await supabase.from(table).select('*')
      if (error && error.code !== '42P01') throw new Error(error.message)
      return (data || []).map((d) => mapFromDB(collection, d))
    }
    const res = await fetch(`${BASE_URL}/${collection}/records?perPage=500`, {
      headers: { Accept: 'application/json' },
    })
    const data = await handleResponse(res, collection, 'leer')
    return data.items || data
  },
  create: async (collection: string, payload: any) => {
    if (isSupabaseCollection(collection)) {
      let authId = undefined
      const dataObj = payload instanceof FormData ? Object.fromEntries(payload.entries()) : payload

      if (collection === 'users' && dataObj.password) {
        const { data: authData, error: authError } = await authClient.auth.signUp({
          email: dataObj.email as string,
          password: dataObj.password as string,
        })
        if (authError) throw new Error(authError.message)
        authId = authData.user?.id
      }

      const table = collection === 'users' ? 'collaborators' : collection
      let insertData: any = {}
      const recordId = collection === 'users' ? authId : crypto.randomUUID()
      if (recordId) insertData.id = recordId

      if (payload instanceof FormData) {
        for (const [key, value] of payload.entries()) {
          if (value instanceof File && value.size > 0) {
            const bucket = collection === 'users' ? 'avatars' : 'products'
            const fileExt = value.name.split('.').pop() || 'png'
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${recordId || 'item'}/${fileName}`
            const { error: uploadError } = await supabase.storage
              .from(bucket)
              .upload(filePath, value, { upsert: true, cacheControl: '3600' })

            if (uploadError) throw new Error('Error al subir imagen: ' + uploadError.message)

            const {
              data: { publicUrl },
            } = supabase.storage.from(bucket).getPublicUrl(filePath)
            if (collection === 'users') insertData.avatarUrl = publicUrl
            else insertData.imageUrl = publicUrl
          } else if (typeof value === 'string') {
            insertData[key] = value
          }
        }
      } else {
        insertData = { ...insertData, ...payload }
      }

      const dbPayload = mapToDB(collection, insertData)
      const { data, error } = await supabase.from(table).insert(dbPayload).select().single()
      if (error) {
        if (error.code === '42P01') return mapFromDB(collection, { ...dbPayload, id: recordId })
        throw new Error(error.message)
      }
      return mapFromDB(collection, data)
    }

    const isFormData = payload instanceof FormData
    const res = await fetch(`${BASE_URL}/${collection}/records`, {
      method: 'POST',
      headers: isFormData
        ? { Accept: 'application/json' }
        : { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: isFormData ? payload : JSON.stringify(payload),
    })
    return await handleResponse(res, collection, 'crear')
  },
  update: async (collection: string, id: string, payload: any) => {
    if (isSupabaseCollection(collection)) {
      const table = collection === 'users' ? 'collaborators' : collection
      let updateData: any = {}

      if (payload instanceof FormData) {
        for (const [key, value] of payload.entries()) {
          if (value instanceof File && value.size > 0) {
            const bucket = collection === 'users' ? 'avatars' : 'products'
            const fileExt = value.name.split('.').pop() || 'png'
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${id}/${fileName}`
            const { error: uploadError } = await supabase.storage
              .from(bucket)
              .upload(filePath, value, { upsert: true, cacheControl: '3600' })

            if (uploadError) throw new Error('Error al subir imagen: ' + uploadError.message)

            const {
              data: { publicUrl },
            } = supabase.storage.from(bucket).getPublicUrl(filePath)
            if (collection === 'users') updateData.avatarUrl = publicUrl
            else updateData.imageUrl = publicUrl
          } else if (typeof value === 'string') {
            updateData[key] = value
          }
        }
      } else {
        updateData = { ...payload }
      }

      const dbPayload = mapToDB(collection, updateData)
      const { data, error } = await supabase
        .from(table)
        .update(dbPayload)
        .eq('id', id)
        .select()
        .single()
      if (error) {
        if (error.code === '42P01') return mapFromDB(collection, { id, ...dbPayload })
        throw new Error(error.message)
      }
      return mapFromDB(collection, data)
    }

    const isFormData = payload instanceof FormData
    const res = await fetch(`${BASE_URL}/${collection}/records/${id}`, {
      method: 'PATCH',
      headers: isFormData
        ? { Accept: 'application/json' }
        : { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: isFormData ? payload : JSON.stringify(payload),
    })
    return await handleResponse(res, collection, 'actualizar')
  },
  delete: async (collection: string, id: string) => {
    if (isSupabaseCollection(collection)) {
      const table = collection === 'users' ? 'collaborators' : collection
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error && error.code !== '42P01') throw new Error(error.message)
      return true
    }

    const res = await fetch(`${BASE_URL}/${collection}/records/${id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    })
    return await handleResponse(res, collection, 'eliminar')
  },
}
