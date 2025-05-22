import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserProfile } from '@/models/UserProfile';
import bcrypt from 'bcryptjs';
import { getUserIdFromToken } from '@/app/api/utils';

export async function PUT(request: Request) {
  try {
    await connectDB();
    
    const userId = await getUserIdFromToken();
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    const user = await UserProfile.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    if (error instanceof Error && error.message === 'No token found') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
} 