import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserProfile } from '@/models/UserProfile';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    const userId = payload.userId as string;

    await connectDB();
    const user = await UserProfile.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Profile verified successfully',
      user: {
        email: user.email,
        telegramUsername: user.telegramUsername,
        isVerified: user.isVerified,
        linkedWallets: user.linkedWallets
      }
    });
  } catch (error) {
    console.error('Error verifying profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 