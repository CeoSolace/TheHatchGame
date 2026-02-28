import { User } from "@/lib/server/models/User"

export interface PublicUser {
  userId: string
  displayName: string
  avatarUrl: string
}

export function toPublicUser(user: any): PublicUser {
  return {
    userId: String(user._id),
    displayName: user.displayName || "Player",
    avatarUrl: user.avatarUrl || "",
  }
}
