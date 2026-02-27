import { randomBytes } from 'crypto'

export interface Invite {
  id: string
  token: string
  slug?: string
  createdAt: number
  revoked: boolean
}

const invites: Invite[] = []

export function createInvite(slug?: string): Invite {
  const token = randomBytes(32).toString('hex')
  const invite: Invite = {
    id: String(Date.now()),
    token,
    slug,
    createdAt: Date.now(),
    revoked: false,
  }
  invites.push(invite)
  return invite
}

export function revokeInvite(token: string) {
  const invite = invites.find((i) => i.token === token)
  if (invite) invite.revoked = true
}

export function listInvites() {
  return invites
}