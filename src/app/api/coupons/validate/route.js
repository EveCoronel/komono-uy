import Order from "@/models/Order";
import connectDB from "@/lib/db";
import { NextResponse } from "next/server";
import User from "@/models/User";

export async function POST(req) {
    try {
        await connectDB();
        let { couponCode, userId, email } = await req.json();

        // Validar el cupón
        if (couponCode.toLowerCase() === "komono10") {
            if (email) {
                // Si el usuario no está logueado, verificar si ya tiene órdenes
                const user = await User.findOne({ email });
                if (user) {
                    userId = user._id;
                }
            }
            if (userId) {
                let userOrders = await Order.find({ user: userId });
                if (userOrders?.length > 0) {
                    return NextResponse.json({ valid: false, error: "Cupón válido únicamente para la primera compra." }, { status: 400 });
                }
            }
            return NextResponse.json({ valid: true, discount: 0.10 });
        } else {
            return NextResponse.json({ valid: false, error: "Cupón no válido" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error validating coupon:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}