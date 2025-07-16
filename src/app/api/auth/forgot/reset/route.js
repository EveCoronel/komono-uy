import { NextResponse } from 'next/server';
import connectDB from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request) {
  await connectDB();
  const { token, nuevaPassword } = await request.json();
  console.log("Token recibido:", token);
  if (!token || !nuevaPassword) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  try {
    // Verifica el token y extrae el userId
    const decoded = jwt.verify(token, JWT_SECRET);

    // Busca el usuario con ese token y que no haya expirado
    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 });
    }
    user.password = nuevaPassword, 12
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 });
  }
}