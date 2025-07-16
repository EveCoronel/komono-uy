import mongoose from 'mongoose';
import { hash } from 'bcryptjs';
import addressSchema from './Address';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, ingrese su nombre'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Por favor, ingrese un correo electrónico'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor, ingrese un correo electrónico válido'],
  },
  number: {
    type: String,
    trim: true,
    unique: false,
    sparse: true,
    match: [/^(5989\d{7}|09\d{7})$/, 'Por favor, ingrese un número de teléfono válido'],
  },
  password: {
    type: String,
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
  },
  addresses: [addressSchema], // Array de direcciones
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    }
  ],
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true,
});

// Hash password before saving, si es que el user está usando password (si no, lo ignora)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    this.password = await hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
