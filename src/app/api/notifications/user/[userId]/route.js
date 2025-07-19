import Notification from "@/models/Notification";
import connectDB from "@/lib/db";
import { NextResponse } from 'next/server';
import User from "@/models/User";
export async function GET(req, { params }) {
    const { userId } = await params;
    await connectDB();
    const notifications = await Notification.find({ user: userId })
        .populate("user", "name email")
        .sort({ createdAt: -1 }); // Más nuevas arriba
    return NextResponse.json(notifications);
}