export function parseCSVRaw(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '')
  if (lines.length === 0) return []

  const delimiter = lines[0].includes(';') ? ';' : ','
  const regex = new RegExp(`${delimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`)

  return lines.map((line) => line.split(regex).map((v) => v.trim().replace(/^"|"$/g, '')))
}

export function parseCSV(text: string): Record<string, string>[] {
  const raw = parseCSVRaw(text)
  if (raw.length < 2) return []

  const headers = raw[0].map((h) => h.replace(/^"|"$/g, '').trim())
  const result = []

  for (let i = 1; i < raw.length; i++) {
    const values = raw[i]
    if (values.length >= 1 && values.some((v) => v !== '')) {
      const obj: Record<string, string> = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || ''
      })
      result.push(obj)
    }
  }
  return result
}
