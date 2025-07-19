import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema({
    title: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    type: { type: String, required: true },
    message: { type: String, required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' }, 
    read: { type: Boolean, default: false },
    isGlobal: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    link: { type: String, default: null },
    readAt: { type: Date, default: null },
});

// Middleware para validar user si no es global
NotificationSchema.pre('save', function(next) {
    if (!this.isGlobal && !this.user) {
        return next(new Error('La notificación debe tener un usuario si no es global.'));
    }
    next();
});

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);