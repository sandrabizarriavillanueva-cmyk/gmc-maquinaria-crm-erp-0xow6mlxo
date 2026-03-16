export const formatCLP = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatRUT = (rut: string) => {
  const clean = rut.replace(/[^0-9kK]/g, '')
  if (clean.length < 2) return clean
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1).toUpperCase()
  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`
}

export const validateRUT = (rut: string) => {
  const clean = rut.replace(/[^0-9kK]/g, '')
  if (clean.length < 2) return false
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1).toUpperCase()
  let sum = 0
  let multiplier = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  const expectedDv = 11 - (sum % 11)
  const calculatedDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString()
  return dv === calculatedDv
}

export const getEquipmentBadgeClass = (status: string) => {
  switch (status) {
    case 'Disponible':
      return 'bg-emerald-500 text-white border-transparent hover:bg-emerald-600'
    case 'Arrendado':
      return 'bg-blue-500 text-white border-transparent hover:bg-blue-600'
    case 'En Mantención':
      return 'bg-orange-500 text-white animate-pulse border-transparent hover:bg-orange-600'
    case 'Inactivo':
      return 'bg-red-500 text-white border-transparent hover:bg-red-600'
    default:
      return 'bg-gray-500 text-white border-transparent'
  }
}

export const getInvoiceBadgeClass = (status: string) => {
  switch (status) {
    case 'Pagada':
      return 'bg-emerald-500 text-white border-transparent hover:bg-emerald-600'
    case 'Pendiente':
      return 'bg-yellow-500 text-white border-transparent hover:bg-yellow-600'
    case 'Vencida':
      return 'bg-red-500 text-white border-transparent hover:bg-red-600'
    default:
      return 'bg-gray-500 text-white border-transparent'
  }
}
