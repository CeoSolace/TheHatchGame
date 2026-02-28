export interface Report {
  id: string
  reportedUserId: string
  category: string
  text: string
  roomId: string
  events: any[]
  createdAt: number
  reviewed: boolean
}

declare global {
  // eslint-disable-next-line no-var
  var __HATCH_REPORTS__: Report[] | undefined
}

// Persist across hot reloads / Next dev workers
const store = globalThis.__HATCH_REPORTS__ ?? []
globalThis.__HATCH_REPORTS__ = store

export function addReport(report: Report) {
  store.push(report)
}

export function listReports() {
  return store
}

export function getReport(id: string) {
  return store.find((r) => r.id === id)
}

export function markReviewed(id: string) {
  const r = getReport(id)
  if (r) r.reviewed = true
  return r
}

export function dismiss(id: string) {
  const r = getReport(id)
  if (r) r.reviewed = true
  return r
}
