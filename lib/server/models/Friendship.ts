import mongoose, { Schema } from "mongoose"

const FriendshipSchema = new Schema(
  {
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    toUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    status: { type: String, enum: ["pending", "accepted", "declined", "blocked"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { minimize: false }
)

FriendshipSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true })

export const Friendship =
  mongoose.models.Friendship || mongoose.model("Friendship", FriendshipSchema)