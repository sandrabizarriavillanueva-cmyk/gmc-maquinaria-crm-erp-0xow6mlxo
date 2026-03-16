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

    if (res.status === 403 || res.status === 401) {
      throw new Error(
        `Error de permisos (API Rules): No tienes autorización para ${action} en la colección '${collection}'. Por favor, verifica las reglas de acceso en el panel de backend.`,
      )
    } else if (res.status === 405) {
      throw new Error(
        `Método no permitido (405) al ${action} en '${collection}'. Verifica la ruta o el verbo HTTP.`,
      )
    } else if (res.status === 400) {
      throw new Error(`Datos inválidos (400) al ${action} en '${collection}': ${errorMsg}`)
    } else if (res.status === 404) {
      throw new Error(`Registro no encontrado (404) en '${collection}'.`)
    } else {
      throw new Error(
        `Error del servidor (${res.status}) al ${action} en '${collection}': ${errorMsg}`,
      )
    }
  }
  return action === 'eliminar' ? true : res.json()
}

export const pb = {
  getFileUrl: (collection: string, id: string, filename: string) => {
    if (!filename) return ''
    if (filename.startsWith('http') || filename.startsWith('data:')) return filename
    const filesUrl = BASE_URL.replace('/collections', '/files')
    return `${filesUrl}/${collection}/${id}/${filename}`
  },
  get: async (collection: string) => {
    try {
      const res = await fetch(`${BASE_URL}/${collection}/records?perPage=500`, {
        headers: { Accept: 'application/json' },
      })
      const data = await handleResponse(res, collection, 'leer')
      return data.items || data
    } catch (e: any) {
      if (e.message?.includes('fetch'))
        throw new Error('Error de red o timeout al intentar conectar con el servidor.')
      throw e
    }
  },
  create: async (collection: string, payload: any) => {
    try {
      const isFormData = payload instanceof FormData
      const res = await fetch(`${BASE_URL}/${collection}/records`, {
        method: 'POST',
        headers: isFormData
          ? { Accept: 'application/json' }
          : { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: isFormData ? payload : JSON.stringify(payload),
      })
      return await handleResponse(res, collection, 'crear')
    } catch (e: any) {
      if (e.name === 'TypeError' || e.message?.includes('fetch'))
        throw new Error('Error de conexión o timeout con el servidor.')
      throw e
    }
  },
  update: async (collection: string, id: string, payload: any) => {
    try {
      const isFormData = payload instanceof FormData
      const res = await fetch(`${BASE_URL}/${collection}/records/${id}`, {
        method: 'PATCH',
        headers: isFormData
          ? { Accept: 'application/json' }
          : { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: isFormData ? payload : JSON.stringify(payload),
      })
      return await handleResponse(res, collection, 'actualizar')
    } catch (e: any) {
      if (e.name === 'TypeError' || e.message?.includes('fetch'))
        throw new Error('Error de conexión o timeout con el servidor.')
      throw e
    }
  },
  delete: async (collection: string, id: string) => {
    try {
      const res = await fetch(`${BASE_URL}/${collection}/records/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      })
      return await handleResponse(res, collection, 'eliminar')
    } catch (e: any) {
      if (e.name === 'TypeError' || e.message?.includes('fetch'))
        throw new Error('Error de conexión o timeout con el servidor.')
      throw e
    }
  },
}
