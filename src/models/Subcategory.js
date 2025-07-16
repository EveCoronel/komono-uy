import mongoose from 'mongoose';

const SubcategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    short_id: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Subcategory = mongoose.models.Subcategory || mongoose.model("Subcategory", SubcategorySchema);
export default Subcategory;