import { NextResponse } from 'next/server';
import connectDB from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from '@/lib/serverUtils';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request) {
  await connectDB();
  const { email } = await request.json();

  const user = await User.findOne({ email });
  if (!user) {
    // No revelar si el usuario existe o no
    return NextResponse.json({ message: "No encontramos una cuenta asociada a ese correo." });
  }

  // Generar token con expiración (ej: 1 hora)
  const token = jwt.sign(
    { userId: user._id },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Guarda el token y expiración en el usuario (opcional, para invalidar luego)
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
  await user.save();

  // Aquí deberías enviar el email con el link:
  // https://tusitio.com/reset-password?token=TOKEN
  // Por ahora solo lo devolvemos para pruebas:
  const resetLink = `${process.env.DOMAIN_URL}/login/forgot-password/reset?token=${token}`;
  await sendPasswordResetEmail(email, resetLink);
  return NextResponse.json({ message: "Si el email existe, recibirás un correo", token });
}