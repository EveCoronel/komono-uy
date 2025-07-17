import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request) {
  try {
    // Get token from cookies
    const token = request.headers.get('cookie')?.split(';')
      .find(c => c.trim().startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verify(token, JWT_SECRET);
    
    await connectDB();
    
    // Get user data
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }
}


export async function PUT(request) {
  try {
    const token = request.headers.get('cookie')?.split(';')
      .find(c => c.trim().startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verify(token, JWT_SECRET);
    await connectDB();

    const userData = await request.json();

    // Si viene currentPassword y newPassword, procesar cambio de contraseña
    if (userData.currentPassword && userData.newPassword) {
      const user = await User.findById(decoded.userId);
      const valid = await bcrypt.compare(userData.currentPassword, user.password);
      if (!valid) {
        return NextResponse.json(
          { error: 'Contraseña actual incorrecta' },
          { status: 400 }
        );
      }
      user.password = userData.newPassword;
      await user.save();
      return NextResponse.json({ message: "Contraseña actualizada" });
    }

    // Actualización general (sin contraseña)
    const fieldsToUpdate = { ...userData };
    delete fieldsToUpdate.currentPassword;
    delete fieldsToUpdate.newPassword;
    delete fieldsToUpdate.password; // nunca actualizar password así

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      fieldsToUpdate,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Error updating user' },
      { status: 500 }
    );
  }
}