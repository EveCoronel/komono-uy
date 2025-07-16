import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  streetName: { type: String },
  streetNumber: { type: String },
  apartment: { type: String },
  crossStreets: { type: String }, 
  city: { type: String },
  deliveryCost: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

export default addressSchema;