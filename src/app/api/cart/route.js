import Cart from "@/models/Cart";
import connectDB from "@/lib/db";
import { NextResponse } from "next/server";
import Product from "@/models/Product";

export async function POST(req) {
  await connectDB();
  const { userId, items } = await req.json();
  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { items, updatedAt: new Date() },
    { upsert: true, new: true }
  );
  return NextResponse.json(cart);
}

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ items: [] }); // Siempre devuelve JSON
  }
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    return NextResponse.json({ items: [] }); // Siempre devuelve JSON
  }
  return NextResponse.json(cart);
}