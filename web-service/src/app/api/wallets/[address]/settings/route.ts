import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { WalletSettings } from '@/models/WalletSettings';
import { isValidSuiAddress } from '@mysten/sui/utils';



async function verifyWalletOwnership(address: string) {
  // Ownership signature verification, assumed cunnect wallet is owned for now
  return true;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    await connectDB();
    const { address } = await params;

    const settings = await WalletSettings.findOne({ walletAddress: address });
    
    if (!settings) {
      return NextResponse.json({ settings: { slippage: '0.5', bridgeAddresses: [] } });
    }
    
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching wallet settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet settings' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    await connectDB();
    const { address } = await params;

    const { slippage, bridgeAddresses } = await request.json();

    // Validate bridge addresses
    if (bridgeAddresses && Array.isArray(bridgeAddresses)) {
      for (const { chainId, address } of bridgeAddresses) {
        if (chainId === 'sui') {
          if (typeof address !== 'string' || !isValidSuiAddress(address as string)) {
            return NextResponse.json({ error: `Invalid Sui address: ${address}` }, { status: 400 });
          }
        } else if (chainId === '1' || chainId === '56') { // Checks for Ethereum (1) and BSC (56)
          if (typeof address !== 'string' || !address.startsWith('0x') || address.length !== 42) {
            return NextResponse.json({ error: `Invalid EVM address for ${chainId}: ${address}` }, { status: 400 });
          }
        }
      }
    }
    
    // Convert bridgeAddresses array to the format expected by the model
    const bridgeAddressesMap = bridgeAddresses.reduce((acc: { [key: string]: string }, curr: { chainId: string, address: string }) => {
      if (curr.chainId && curr.address) {
        acc[curr.chainId] = curr.address;
      }
      return acc;
    }, {});

    const settings = await WalletSettings.findOneAndUpdate(
      { walletAddress: address },
      { 
        walletAddress: address,
        swapSlippage: slippage,
        bridgeAddresses: bridgeAddressesMap
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error updating wallet settings:', error);
    if (error instanceof Error && error.message === 'No token found') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    if (error instanceof Error && error.message === 'Wallet not linked to user') {
      return NextResponse.json(
        { error: 'Wallet not linked to user' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update wallet settings' },
      { status: 500 }
    );
  }
} 