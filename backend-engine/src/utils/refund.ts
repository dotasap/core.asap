import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { getClientForEnvironment } from '../config/client';
import { attachMemo } from 'memo-protocol-sdk';

interface RefundInput {
  recipient: string;
  amount: number;
  coinType: string;
  digest: string;
  reason?: string;
  signer: Ed25519Keypair;
}

export async function refundTransaction(input: RefundInput): Promise<string> {
  const client = await getClientForEnvironment();
  const sender = input.signer.toSuiAddress();
  //const amount = BigInt(Math.floor(input.amount * 1_000_000_000));
  const isSui = !input.coinType || input.coinType === '0x2::sui::SUI';

  try {
    // Find coins for transfer
    const coins = await client.getCoins({ owner: sender, coinType: input.coinType });
    if (coins.data.length === 0) {
      throw new Error(`No ${isSui ? 'SUI' : input.coinType} coins found for refund`);
    }

    // Find a coin with sufficient balance
    const transferCoin = coins.data.find(c => BigInt(c.balance) >= input.amount);
    if (!transferCoin) {
      throw new Error('Insufficient balance for refund');
    }

    // Create transaction
    const txb = new Transaction();

    if (isSui) {
      txb.setGasPayment([{
        objectId: transferCoin.coinObjectId,
        version: transferCoin.version,
        digest: transferCoin.digest,
      }]);

      const [coinToTransfer] = txb.splitCoins(txb.gas, [input.amount]);
      txb.transferObjects([coinToTransfer], input.recipient);
    } else {
      const suiCoins = await client.getCoins({ 
        owner: sender, 
        coinType: '0x2::sui::SUI' 
      });
      
      if (suiCoins.data.length === 0) {
        throw new Error('No SUI found to pay gas for refund');
      }
      
      const gasCoin = suiCoins.data[0];
      txb.setGasPayment([{
        objectId: gasCoin.coinObjectId,
        version: gasCoin.version,
        digest: gasCoin.digest,
      }]);

      const [coinToTransfer] = txb.splitCoins(
        txb.object(transferCoin.coinObjectId),
        [input.amount]
      );
      txb.transferObjects([coinToTransfer], input.recipient);
    }

    // Add memo with refund reason
    attachMemo(txb, `Refund for tx ${input.digest}: ${input?.reason || ''}`);

    txb.setSender(sender);

    // Dry run first
    const sim = await client.devInspectTransactionBlock({
      sender,
      transactionBlock: txb,
    });

    if (sim.effects.status.status !== 'success') {
      throw new Error(sim.effects.status.error || 'Refund simulation failed');
    }

    // Execute transaction
    const result = await client.signAndExecuteTransaction({
      signer: input.signer,
      transaction: txb,
    });

    console.log(`Refund successful for tx ${input.digest}:`);
    console.log(`Amount: ${input.amount} ${isSui ? 'SUI' : 'tokens'}`);
    console.log(`To: ${input.recipient}`);
    if (input.reason) {
      console.log(`Reason: ${input.reason}`);
    }

    return result.digest;
  } catch (error) {
    console.error(`Refund failed for tx ${input.digest}:`, error);
    throw error;
  }
} 