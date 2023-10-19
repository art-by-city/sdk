export function generateSlug(from: string, limit?: number) {
  return from
    .toLowerCase()
    .trim()
    .replace(/[\s]/g, '-')
    .replace(/[^a-z0-9_\-\.]/g, '')
    .substring(0, limit)
}
