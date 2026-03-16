export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '')
  if (lines.length === 0) return []

  const delimiter = lines[0].includes(';') ? ';' : ','
  const regex = new RegExp(`${delimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`)

  const headers = lines[0].split(regex).map((h) => h.trim().replace(/^"|"$/g, ''))
  const result = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(regex).map((v) => v.trim().replace(/^"|"$/g, ''))
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
