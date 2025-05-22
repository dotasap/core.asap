
import { SuiTransactionBlockResponse } from "@mysten/sui/client";

export interface ObjectChange {
  type: 'created' | 'mutated' | 'deleted';
  objectType: string;
  objectId: string;
  owner: { AddressOwner?: string } | null;
  digest: string;
  version: string;
}

export interface TxInfo {
  sender: string;
  coinType: string;
  amount: number; // in UI units (like 0.42)
  memo: string;
  digest: string;
  objectId: string;
}

export interface MemoData {
  type: 'swap' | 'bridge' | 'offramp' | 'unknown';
  // swap
  tokenMint?: string;
  link?: string;
  slippage?: string;
  // bridge
  chain?: string;
  bridgeWallet?: string;
  saveDefault?: boolean;
  // offramp
  isOfframp?: boolean;
  // Validation
  valid?: boolean;
  validationErrors?: string[];
}


export interface SwapFields {
  inputCoin: string;
  outputCoin: string;
  amount: number;
  recipient: string;
  slippage: number;
}


export interface SwapResultSuccess {
  success: true;
  digest: string;
  balanceChanges: SuiTransactionBlockResponse["balanceChanges"];
  objectChanges: SuiTransactionBlockResponse["objectChanges"];
}

export interface SwapResultError {
  success: false;
  error: string;
}

export type SwapResult = SwapResultSuccess | SwapResultError;