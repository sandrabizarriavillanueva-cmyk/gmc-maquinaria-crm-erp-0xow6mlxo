const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'https://gmc-maquinaria-crmerp-f8291.goskip.app/api/collections'
    }
    return `${window.location.origin}/api/collections`
  }
  return '/api/collections'
}

const BASE_URL = getBaseUrl()

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('skip_token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    let errorMsg = ''
    try {
      const data = await res.json()
      errorMsg = JSON.stringify(data)
    } catch {
      errorMsg = await res.text()
    }
    throw new Error(errorMsg || `Error ${res.status}`)
  }
  if (res.status === 204) return true
  const text = await res.text()
  return text ? JSON.parse(text) : true
}

export const pb = {
  getFileUrl: (collection: string, id: string, filename: string) => {
    if (!filename) return ''
    if (filename.startsWith('http') || filename.startsWith('data:')) return filename
    const filesUrl = BASE_URL.replace('/api/collections', '/api/files')
    return `${filesUrl}/${collection}/${id}/${filename}`
  },
  get: async (collection: string, filter?: string) => {
    const url = new URL(`${BASE_URL}/${collection}/records`)
    url.searchParams.set('perPage', '500')
    if (filter) url.searchParams.set('filter', filter)

    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json', ...getAuthHeaders() },
    })
    const data = await handleResponse(res)
    return data.items || data
  },
  create: async (collection: string, payload: any) => {
    const isFormData = payload instanceof FormData
    const headers: any = { Accept: 'application/json', ...getAuthHeaders() }
    if (!isFormData) headers['Content-Type'] = 'application/json'

    const res = await fetch(`${BASE_URL}/${collection}/records`, {
      method: 'POST',
      headers,
      body: isFormData ? payload : JSON.stringify(payload),
    })
    return await handleResponse(res)
  },
  update: async (collection: string, id: string, payload: any) => {
    const isFormData = payload instanceof FormData
    const headers: any = { Accept: 'application/json', ...getAuthHeaders() }
    if (!isFormData) headers['Content-Type'] = 'application/json'

    const res = await fetch(`${BASE_URL}/${collection}/records/${id}`, {
      method: 'PATCH',
      headers,
      body: isFormData ? payload : JSON.stringify(payload),
    })
    return await handleResponse(res)
  },
  delete: async (collection: string, id: string) => {
    const res = await fetch(`${BASE_URL}/${collection}/records/${id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json', ...getAuthHeaders() },
    })
    return await handleResponse(res)
  },
  authWithPassword: async (collection: string, identity: string, password: string) => {
    const res = await fetch(`${BASE_URL}/${collection}/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ identity, password }),
    })
    return await handleResponse(res)
  },
}
