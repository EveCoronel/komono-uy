import connectDB from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { NextResponse } from 'next/server';
import Product from "@/models/Product";

export async function PUT(req, { params }) {
    const { id } = await params;
    const { status } = await req.json();

    try {
        await connectDB();
        const order = await Order.findById(id);
        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }
        // Check if the user is authorized to update the order status
        const user = await User.findById(order.user);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        } else if (user.role !== 'admin' && user._id.toString() !== order.user.toString()) {
            return NextResponse.json(
                { error: 'Not authorized to update this order' },
                { status: 403 }
            );
        }
        if (status === "cancelled" && order.status !== "cancelled") {
            // Devolver stock de cada producto
            for (const item of order.products) {
                await Product.findByIdAndUpdate(
                    item.productId._id,
                    { $inc: { stock: item.quantity } }
                );
            }
        }
        // Update the order status
        order.status = status;

        await order.save();

        return NextResponse.json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

