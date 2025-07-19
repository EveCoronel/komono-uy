import { NextResponse } from 'next/server';
import connectDB from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";

export async function GET(req, { params }) {
    const { id } = await params;

    try {
        await connectDB();
        const user = await User.findById(id).populate('favorites');
        return NextResponse.json(user.favorites);
    } catch (error) {
        console.error('Error fetching user favorites:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(req, { params }) {
    try {
        const { id } = await params;
        const { productId } = await req.json();
        console.log('Adding favorite for user:', id, 'productId:', productId);
        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        await connectDB();
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Add product to favorites if not already present
        if (!user.favorites.includes(productId)) {
            user.favorites.push(productId);
            await user.save();
        }

        return NextResponse.json({ message: 'Product added to favorites' });
    } catch (error) {
        console.error('Error adding favorite:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function DELETE(req, { params }) { 
    try {
        const { id } = await params;
        const { productId } = await req.json();
        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        await connectDB();
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Remove product from favorites if present
        user.favorites = user.favorites.filter(id => id.toString() !== productId);
        await user.save();

        return NextResponse.json({ message: 'Product removed from favorites' });
    } catch (error) {
        console.error('Error removing favorite:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}