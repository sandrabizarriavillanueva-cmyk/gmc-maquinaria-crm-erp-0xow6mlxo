const getBaseUrl = () => {
  if (typeof window === 'undefined') return '/api/collections'
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'https://gmc-maquinaria-crmerp-f8291.goskip.app/api/collections'
  }
  return '/api/collections'
}

const BASE_URL = getBaseUrl()

export const pb = {
  get: async (collection: string) => {
    const res = await fetch(`${BASE_URL}/${collection}/records?perPage=500`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`Error fetching ${collection}`)
    const data = await res.json()
    return data.items
  },
  create: async (collection: string, payload: any) => {
    const res = await fetch(`${BASE_URL}/${collection}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`Error creating in ${collection}`)
    return res.json()
  },
  update: async (collection: string, id: string, payload: any) => {
    const res = await fetch(`${BASE_URL}/${collection}/records/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`Error updating in ${collection}`)
    return res.json()
  },
  delete: async (collection: string, id: string) => {
    const res = await fetch(`${BASE_URL}/${collection}/records/${id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`Error deleting in ${collection}`)
    return true
  },
}
