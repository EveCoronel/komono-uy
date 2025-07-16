import connectDB from "@/lib/db";
import Category from "@/models/Category";


export async function getAllCategories() {
    await connectDB();
    return await Category.find().sort({ short_id: 1 }).lean();
}
