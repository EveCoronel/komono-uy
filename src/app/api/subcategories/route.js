import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Subcategory from '@/models/Subcategory';
import Counter from '@/models/Counter';

export async function GET() {
    try {
        await connectDB();
        const subcategories = await Subcategory.find({}).sort({ short_id: -1 });
        return NextResponse.json(subcategories);
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        await connectDB();
        const data = await request.json();

        let subcategoryNumber;
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'subcategoryNumber' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        subcategoryNumber = counter.seq;

        data.short_id = subcategoryNumber;
        const subcategory = await Subcategory.create(data);
        return NextResponse.json(subcategory, { status: 201 });
    } catch (error) {
        console.error('Error creating subcategory:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
