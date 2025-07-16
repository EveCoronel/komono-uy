import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 100 },
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);
export default Counter;