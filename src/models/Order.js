import mongoose from 'mongoose';
import addressSchema from './Address';

const { Schema } = mongoose;

const OrderSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: Number, unique: true, required: true },
    products: [
        {
            productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true, default: 1 },
        }
    ],
    total: { type: Number, required: true },
    deliveryType: { type: String, enum: ['pickup', 'delivery'], required: true },
    paymentMethod: { type: String },
    address: addressSchema, // Solo para delivery
    pickupPoint: { type: String }, // Solo para pickup
    status: {
        type: String,
        enum: ["pending_payment", "paid", "preparing", "ready_pickup", "shipped", "delivered", "cancelled"],
        default: "pending_payment",
    },
    createdAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
});

OrderSchema.pre('save', function (next) {
    this.lastUpdated = Date.now();
    next();
});

OrderSchema.pre('findOneAndUpdate', function (next) {
    this.set({ lastUpdated: Date.now() });
    next();
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default Order;