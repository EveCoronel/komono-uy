import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product"; // ✅ Importar para registrar el schema
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { id } = params;
    try {
        await connectDB();
        const orders = await Order.find({ user: id })
            .populate('products.productId') // <- esto requiere que Product esté registrado
            .sort({ createdAt: -1 });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
