import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserProfile } from '@/models/UserProfile';
import { cookies } from 'next/headers';
import * as jose from 'jose';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = payload.userId as string;

    await connectDB();
    
    const user = await UserProfile.findById(userId).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
        linkedWallets: user.linkedWallets,
        bankDetails: user.bankDetails,
      },
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 