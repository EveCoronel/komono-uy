import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET(req, { params }) {
  const { id } = await params;        
  try {
    await connectDB();
    const products = await Product.find({ category: id }).sort({ createdAt: -1 });
    if (!products) {
      return NextResponse.json({ error: 'Products not found' }, { status: 404 });
    }
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}