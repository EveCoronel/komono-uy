import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor proporciona un nombre para el producto'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Por favor proporciona una descripción del producto'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'El precio del producto es obligatorio'],
    min: [0, 'El precio no puede ser negativo'],
  },
  category: {
    type: String,
    required: [true, 'Por favor proporciona una categoría para el producto'],
  },
  subcategory: {
    type: String,
    required: [true, 'Por favor proporciona una subcategoría para el producto']
  },
  sale_price: {
    type: Number,
    min: [0, 'El precio de oferta no puede ser negativo'],
    validate: {
      validator: function (v) {
        return v === null || v < this.price;
      },
      message: 'El precio de oferta debe ser menor que el precio regular',
    },
  },
  sale_effective_period: {
    start: { type: Date },
    end: { type: Date },
  },
  stock: {
    type: Number,
    required: [true, 'Por favor proporciona la cantidad de stock del producto'],
    min: [0, 'El stock no puede ser negativo'],
  },
  images: {
    type: [String],
    required: true,
    validate: [(val) => val.length > 0, 'Debe tener al menos una imagen']
  }
}, {
  timestamps: true,
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
