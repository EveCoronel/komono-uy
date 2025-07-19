import Notification from "@/models/Notification";
import connectDB from "@/lib/db";
import { NextResponse } from 'next/server';
import { sendNotificationEmail } from "@/lib/serverUtils";

export async function POST(req) {
    const { user, content, title, order, type, isGlobal, link } = await req.json();
    await connectDB();
    let auxNotification = {
        title: title || "Nueva Notificación",
        message: content,
        type,
    };

    if (user) {
        auxNotification.user = user._id;
    }
    if (isGlobal) auxNotification.isGlobal = true;
    if (order) auxNotification.order = order._id;
    if (link) auxNotification.link = link;
    const notification = new Notification(auxNotification);
    await notification.save();

    // Enviar email si hay usuario y email disponible
    if (user?.email) {
        await sendNotificationEmail({
            email: user.email,
            type,
            message: content,
            order: order?.orderNumber
        });
    }

    return NextResponse.json(notification);
}

export async function PUT(req, { params }) {
    const { id, read } = await req.json();

    await connectDB();
    const notification = await Notification.findById(id);
    if (!notification) {
        return NextResponse.json({ error: "Notificación no encontrada" }, { status: 404 });
    }
    notification.read = read;
    notification.readAt = read ? new Date() : null;
    await notification.save();
    return NextResponse.json(notification);
}