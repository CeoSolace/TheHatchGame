export interface PublicUser {
  userId: string
  displayName: string
  avatarUrl: string
}

export function toPublicUser(user: any): PublicUser {
  if (!user) {
    return { userId: "", displayName: "Player", avatarUrl: "" }
  }
  return {
    userId: String(user._id),
    displayName: user.displayName || "Player",
    avatarUrl: user.avatarUrl || "",
  }
}
