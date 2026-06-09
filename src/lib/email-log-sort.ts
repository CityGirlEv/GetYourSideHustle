export type EmailLogSortKey =
  | 'created_at'
  | 'template_name'
  | 'recipient_email'
  | 'status'
  | 'error_message'

export type SortDir = 'asc' | 'desc'

export interface EmailLogRow {
  id: string
  message_id: string | null
  template_name: string
  recipient_email: string
  status: string
  error_message: string | null
  created_at: string
}

export function sortEmailLog(
  rows: EmailLogRow[],
  key: EmailLogSortKey,
  dir: SortDir,
): EmailLogRow[] {
  const cmp = dir === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    if (key === 'created_at') {
      const da = new Date(a.created_at).getTime()
      const db = new Date(b.created_at).getTime()
      return (da - db) * cmp
    }
    const av = (a[key] ?? '').toString().toLowerCase()
    const bv = (b[key] ?? '').toString().toLowerCase()
    if (av < bv) return -1 * cmp
    if (av > bv) return 1 * cmp
    return 0
  })
}
