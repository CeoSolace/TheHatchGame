import mongoose, { Schema } from "mongoose"

const UserSchema = new Schema(
  {
    email: { type: String, unique: true, sparse: true, index: true },
    passwordHash: { type: String },
    displayName: { type: String, default: "Player" },
    avatarUrl: { type: String, default: "" },
    friendCode: { type: String, unique: true, index: true },
    role: { type: String, default: "user" }, // user | teamOwner | admin
    createdAt: { type: Date, default: Date.now },

    // anti-abuse identifiers
    deviceIds: { type: [String], default: [] }, // per-install IDs
    ipHashes: { type: [String], default: [] }, // hashed IPs, not raw
    banned: { type: Boolean, default: false },
    banReason: { type: String, default: "" },
    banExpiresAt: { type: Date, default: null },
  },
  { minimize: false }
)

export const User = mongoose.models.User || mongoose.model("User", UserSchema)