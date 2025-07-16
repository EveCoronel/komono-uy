import mongoose from 'mongoose';

const { Schema } = mongoose;

const CategorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    short_id: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
});

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

export default Category;