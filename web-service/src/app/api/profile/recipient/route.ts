import { NextResponse } from 'next/server';
import { UserProfile } from '@/models/UserProfile';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }
    const user = await UserProfile.findOne({ linkedWallets: wallet });
    if (!user || !user.bankDetails) {
      return NextResponse.json({ error: 'No bank details found for this wallet' }, { status: 404 });
    }
    return NextResponse.json({ bankDetails: user.bankDetails }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recipient' }, { status: 500 });
  }
} 