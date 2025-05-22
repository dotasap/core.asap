import { decodeMemoMessage, parseMemoFromTx } from 'memo-protocol-sdk'
import { ObjectChange } from "../types/Index";
  
function receivedToken(objectChanges: ObjectChange[]): {
  objectId: string;
  coinType: string;
  recipient: string;
  digest: string;
  version: string;
}[] {
  if (!Array.isArray(objectChanges)) return [];
  return objectChanges
    .filter(
      (entry) =>
        entry.type === 'created' &&
        entry.owner &&
        'AddressOwner' in entry.owner &&
        typeof entry.owner.AddressOwner === 'string' &&
        entry.objectType.startsWith('0x2::coin::Coin<')
      )
    .map((entry) => ({
      objectId: entry.objectId,
      coinType: entry.objectType.slice('0x2::coin::Coin<'.length, -1),
      recipient: entry.owner!.AddressOwner!,
      digest: entry.digest,
      version: entry.version,
    }));
}
  
export function logs(tx: any) {
  const memos = parseMemoFromTx(tx);
  console.log(memos);
  const decodedMessages = memos.map(decodeMemoMessage);
  console.log(decodedMessages);
  const txnData = tx.transaction?.data?.transaction;
  
  if (txnData?.kind !== 'ProgrammableTransaction') return;
  
  const inputs = txnData.inputs ?? [];
  
  const amountInput = inputs.find((i: any) => i.valueType === 'u64');
  const amount = amountInput?.value ?? 'unknown';
  const sender = tx.transaction?.data?.sender;

  const digest = tx.digest;
  if (!tx.objectChanges) {
    return;
  }
  
  const coins = receivedToken(tx.objectChanges);
  if (coins.length === 0) return;
  
  for (const coin of coins) {
    return {
      sender,
      amount,
      coinType: coin.coinType,
      objectId: coin.objectId,
      memo: decodedMessages[0] || '',
      digest,
    };
  }
}
  


export function mistToSui(amount: string | number | bigint): string {
  const big = BigInt(amount);
  const sui = Number(big) / 1_000_000_000;
  return sui.toString();
}
