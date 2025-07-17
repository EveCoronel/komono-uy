import connectDB from "@/lib/db";
import Review from "@/models/Review";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    await connectDB();
    const { id: userId } = await params;

    try {
        const reviews = await Review.find({ user: userId });
        return NextResponse.json(reviews);
    } catch (error) {
        return NextResponse.json({ error: "No se pudieron obtener las reseñas" }, { status: 500 });
    }
}