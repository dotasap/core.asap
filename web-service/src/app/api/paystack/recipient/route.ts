import axios from 'axios';
import { NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/app/api/utils';
import { UserProfile } from '@/models/UserProfile';

export async function POST(request: Request) {
  try {
    const { accountName, accountNumber, bankCode, bankName } = await request.json();
    console.log('Received bank details:', { accountName, accountNumber, bankCode, bankName });
    
    const userId = await getUserIdFromToken();
    const user = await UserProfile.findById(userId);
    if (!user || !user.isVerified) {
      return NextResponse.json({ error: 'User not verified' }, { status: 403 });
    }
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    const BASE_URL = process.env.PAYSTACK_BASE_URL;
    const headers = {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    };
    const body = {
      type: 'nuban',
      name: accountName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: 'NGN',
    };
    const response = await axios.post(`${BASE_URL}/transferrecipient`, body, { headers });
    const recipientCode = response.data.data.recipient_code;
    
    // Save bank details to user profile alongside the recipient code needed for transfers
    const bankDetails = {
      accountName,
      accountNumber,
      bankCode,
      bankName,
      recipientCode,
    };
    console.log('Saving bank details to user:', bankDetails);
    
    // First, unset the existing bankDetails to ensure a clean update
    await UserProfile.findByIdAndUpdate(
      userId,
      { $unset: { bankDetails: 1 } }
    );
    
    // Then set the new bankDetails
    const updatedUser = await UserProfile.findByIdAndUpdate(
      userId,
      { $set: { bankDetails } },
      { new: true, runValidators: true }
    );
    
    console.log('Saved user bank details:', updatedUser.bankDetails);
    return NextResponse.json({ recipientCode }, { status: 200 });
  } catch (error) {
    console.error('Error in recipient route:', error);
    return NextResponse.json({ error: 'Failed to create recipient' }, { status: 500 });
  }
} 