import { randomBytes } from 'crypto'

interface Session {
  token: string
  expires: number
}

const sessions: Map<string, Session> = new Map()

export function createSession(): Session {
  const token = randomBytes(32).toString('hex')
  const expires = Date.now() + 8 * 60 * 60 * 1000 // 8 hours
  const session: Session = { token, expires }
  sessions.set(token, session)
  return session
}

export function getSession(token: string | undefined): Session | undefined {
  if (!token) return undefined
  const session = sessions.get(token)
  if (session && session.expires > Date.now()) return session
  if (session) sessions.delete(token)
  return undefined
}

export function clearSession(token: string) {
  sessions.delete(token)
}