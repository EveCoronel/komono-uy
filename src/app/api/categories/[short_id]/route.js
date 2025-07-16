import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';

export async function GET(req, { params }) {
    const { short_id } = await params;

    try {
        await connectDB();

        const category = await Category.findOne({ short_id });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
