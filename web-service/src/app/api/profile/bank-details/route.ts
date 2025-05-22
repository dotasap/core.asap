import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserProfile } from '@/models/UserProfile';
import { getUserIdFromToken } from '@/app/api/utils';


export async function GET() {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const profile = await UserProfile.findById(userId);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (!profile.isVerified) {
      return NextResponse.json(
        { error: 'Only verified users can use this feature' },
        { status: 403 }
      );
    }

    return NextResponse.json({ bankDetails: profile.bankDetails });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const bankDetails = await request.json();
    await connectDB();

    const profile = await UserProfile.findById(userId);
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (!profile.isVerified) {
      return NextResponse.json(
        { error: 'Only verified users can use this feature' },
        { status: 403 }
      );
    }

    profile.bankDetails = bankDetails;
    await profile.save();

    return NextResponse.json({ bankDetails: profile.bankDetails });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 