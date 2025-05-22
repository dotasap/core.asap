import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserProfile } from '@/models/UserProfile';
import { getUserIdFromToken } from '@/app/api/utils';


export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { address } = await request.json();

    await connectDB();
    
    // for now we only check if wallet is already linked to any profile
    const existingProfile = await UserProfile.findOne({ 
      linkedWallets: address 
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Wallet already linked to another profile' },
        { status: 400 }
      );
    }

    // Add wallet to user's profile
    const profile = await UserProfile.findByIdAndUpdate(
      userId,
      { $addToSet: { linkedWallets: address } },
      { new: true }
    );

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Wallet connected successfully',
      linkedWallets: profile.linkedWallets 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { walletAddress } = await request.json();
    
    
    await connectDB();
    
    const profile = await UserProfile.findByIdAndUpdate(
      userId,
      { $pull: { linkedWallets: walletAddress } },
      { new: true }
    );

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Wallet disconnected successfully',
      linkedWallets: profile.linkedWallets 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 