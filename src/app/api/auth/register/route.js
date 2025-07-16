import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import { sendNewAccountEmail } from '@/lib/serverUtils';

export async function POST(request) {
    try {
        await connectDB();

        const { name, email, password } = await request.json();

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
        });

        // Send welcome email
        await sendNewAccountEmail(email, name);

        // Remove password from response
        const userWithoutPassword = {
            _id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
        console.log('Registration error:', error);
        try {
            if (error.errors.password) {
                return NextResponse.json(
                    { error: error.errors.password.message || 'Invalid password' },
                    { status: 400 }
                );
            } else {
                return NextResponse.json(
                    { error: 'Ocurrió un error, intente más tarde.' },
                    { status: 500 }
                );
            }
        } catch (e) {
            return NextResponse.json(
                { error: 'Ocurrió un error, intente más tarde.' },
                { status: 500 }
            );
        }
    }
}
