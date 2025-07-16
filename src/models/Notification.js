import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, // ej: 'order_status', 'promo', etc.
    message: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' }, // opcional, si aplica
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);