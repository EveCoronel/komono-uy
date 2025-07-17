import connectDB from "@/lib/db";
import Review from "@/models/Review";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
    await connectDB();
    const { id: productId } = await params;
    const { userId, rating, comment, orderId } = await req.json();

    if (!userId || !rating || !productId) {
        return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    try {
        const review = await Review.create({
            product: productId,
            user: userId,
            rating,
            comment,
            order: orderId,
        });
        return NextResponse.json({ ok: true, review });
    } catch (error) {
        return NextResponse.json({ error: "No se pudo crear la reseña" }, { status: 500 });
    }
}