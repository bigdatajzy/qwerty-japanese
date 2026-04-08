export type SessionType = 'kana' | 'word' | 'article'

export interface PracticeSession {
  id: string
  type: SessionType
  sourceId: string
  sourceName: string
  startedAt: number
  endedAt: number
  durationSec: number
  unitsTotal: number
  unitsCorrect: number
  unitsError: number
  accuracy: number
  wpm: number
}

interface DailyStats {
  date: string
  sessionCount: number
  durationSec: number
  unitsTotal: number
  unitsCorrect: number
  unitsError: number
  wpmSum: number
}

interface DbOverview {
  sessionCount: number
  durationSec: number
  unitsTotal: number
  unitsCorrect: number
  unitsError: number
  avgWpm: number
  avgAccuracy: number
}

const DB_NAME = 'qj_stats_db'
const DB_VERSION = 1
const STORE_SESSIONS = 'sessions'
const STORE_DAILY = 'daily_stats'
const STORE_SETTINGS = 'settings'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        const s = db.createObjectStore(STORE_SESSIONS, { keyPath: 'id' })
        s.createIndex('endedAt', 'endedAt', { unique: false })
      }
      if (!db.objectStoreNames.contains(STORE_DAILY)) {
        db.createObjectStore(STORE_DAILY, { keyPath: 'date' })
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
  })
}

function requestToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function todayKey(ts = Date.now()): string {
  return new Date(ts).toISOString().slice(0, 10)
}

function newSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function recordPracticeSession(
  payload: Omit<PracticeSession, 'id' | 'endedAt'> & { endedAt?: number },
): Promise<void> {
  const endedAt = payload.endedAt ?? Date.now()
  const session: PracticeSession = {
    id: newSessionId(),
    endedAt,
    ...payload,
  }
  const day = todayKey(endedAt)
  const db = await openDb()
  const tx = db.transaction([STORE_SESSIONS, STORE_DAILY], 'readwrite')
  const sessionStore = tx.objectStore(STORE_SESSIONS)
  const dailyStore = tx.objectStore(STORE_DAILY)
  await requestToPromise(sessionStore.add(session))

  const current = (await requestToPromise(dailyStore.get(day))) as DailyStats | undefined
  const next: DailyStats = {
    date: day,
    sessionCount: (current?.sessionCount ?? 0) + 1,
    durationSec: (current?.durationSec ?? 0) + session.durationSec,
    unitsTotal: (current?.unitsTotal ?? 0) + session.unitsTotal,
    unitsCorrect: (current?.unitsCorrect ?? 0) + session.unitsCorrect,
    unitsError: (current?.unitsError ?? 0) + session.unitsError,
    wpmSum: (current?.wpmSum ?? 0) + session.wpm,
  }
  await requestToPromise(dailyStore.put(next))

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
  db.close()
}

export async function getTodayStats(): Promise<DbOverview> {
  const db = await openDb()
  const tx = db.transaction(STORE_DAILY, 'readonly')
  const store = tx.objectStore(STORE_DAILY)
  const day = todayKey()
  const rec = (await requestToPromise(store.get(day))) as DailyStats | undefined
  db.close()
  const c = rec?.sessionCount ?? 0
  const acc = (rec?.unitsTotal ?? 0) > 0 ? Math.round(((rec?.unitsCorrect ?? 0) / (rec?.unitsTotal ?? 0)) * 100) : 0
  return {
    sessionCount: c,
    durationSec: rec?.durationSec ?? 0,
    unitsTotal: rec?.unitsTotal ?? 0,
    unitsCorrect: rec?.unitsCorrect ?? 0,
    unitsError: rec?.unitsError ?? 0,
    avgWpm: c > 0 ? Math.round((rec?.wpmSum ?? 0) / c) : 0,
    avgAccuracy: acc,
  }
}

export async function getOverviewStats(): Promise<DbOverview> {
  const db = await openDb()
  const tx = db.transaction(STORE_SESSIONS, 'readonly')
  const store = tx.objectStore(STORE_SESSIONS)
  const sessions = (await requestToPromise(store.getAll())) as PracticeSession[]
  db.close()

  const totals = sessions.reduce(
    (acc, s) => {
      acc.sessionCount += 1
      acc.durationSec += s.durationSec
      acc.unitsTotal += s.unitsTotal
      acc.unitsCorrect += s.unitsCorrect
      acc.unitsError += s.unitsError
      acc.wpmSum += s.wpm
      return acc
    },
    { sessionCount: 0, durationSec: 0, unitsTotal: 0, unitsCorrect: 0, unitsError: 0, wpmSum: 0 },
  )
  return {
    sessionCount: totals.sessionCount,
    durationSec: totals.durationSec,
    unitsTotal: totals.unitsTotal,
    unitsCorrect: totals.unitsCorrect,
    unitsError: totals.unitsError,
    avgWpm: totals.sessionCount > 0 ? Math.round(totals.wpmSum / totals.sessionCount) : 0,
    avgAccuracy: totals.unitsTotal > 0 ? Math.round((totals.unitsCorrect / totals.unitsTotal) * 100) : 0,
  }
}

export async function getRecentSessions(limit = 10): Promise<PracticeSession[]> {
  const db = await openDb()
  const tx = db.transaction(STORE_SESSIONS, 'readonly')
  const store = tx.objectStore(STORE_SESSIONS)
  const all = (await requestToPromise(store.getAll())) as PracticeSession[]
  db.close()
  return all.sort((a, b) => b.endedAt - a.endedAt).slice(0, limit)
}

export async function clearPracticeStats(): Promise<void> {
  const db = await openDb()
  const tx = db.transaction([STORE_SESSIONS, STORE_DAILY, STORE_SETTINGS], 'readwrite')
  await requestToPromise(tx.objectStore(STORE_SESSIONS).clear())
  await requestToPromise(tx.objectStore(STORE_DAILY).clear())
  await requestToPromise(tx.objectStore(STORE_SETTINGS).clear())
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
  db.close()
}
