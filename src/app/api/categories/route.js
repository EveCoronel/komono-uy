import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import Counter from '@/models/Counter';

export async function GET() {
    try {
        await connectDB();
        const categories = await Category.find({}).sort({ short_id: -1 });
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        await connectDB();

        let categoryNumber;
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'categoryNumber' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        categoryNumber = counter.seq

        const data = await request.json();
        data.short_id = categoryNumber;
        const category = await Category.create(data);
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
