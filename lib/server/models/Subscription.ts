import mongoose, { Schema } from "mongoose"

const SubscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    stripeCustomerId: { type: String, index: true },
    stripeSubscriptionId: { type: String, index: true },
    status: { type: String, default: "inactive" }, // active, canceled, past_due
    priceId: { type: String, default: "" },
    currentPeriodEnd: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { minimize: false }
)

export const Subscription =
  mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema)