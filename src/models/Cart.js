import mongoose, { Schema } from "mongoose";

const CartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
    }
  ],
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);