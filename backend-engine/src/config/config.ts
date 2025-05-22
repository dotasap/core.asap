import dotenv from 'dotenv';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Connection, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

dotenv.config();

export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}


// Transaction Configuration
export const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '3');
export const RETRY_DELAY_MS = parseInt(process.env.RETRY_DELAY_MS || '1000');

// Token Configuration
export const TOKEN_DECIMALS = 9;
export const TOKEN_SYMBOLS: Record<string, string> = {
  '0x2::sui::SUI': 'SUI',
  '0x2::usdc::USDC': 'USDC',
  '0x2::usdt::USDT': 'USDT',
};

export function getTokenSymbol(coinType: string): string {
  return TOKEN_SYMBOLS[coinType] || coinType.split('::')[2] || 'UNKNOWN';
}

// Server Configuration
export const PORT = parseInt(process.env.PORT || '3000');


// SUI Configs
export const SUI_MNEMONIC = process.env.SUI_MNEMONIC || '';

export const SUI_KEYPAIR = Ed25519Keypair.deriveKeypair(SUI_MNEMONIC);

export const SUI_ADDRESS = SUI_KEYPAIR.getPublicKey().toSuiAddress();

export const WEB_SERVICE_URL = process.env.WEB_SERVICE_URL || 'http://localhost:3000';

// Network Configuration
export const SUI_NETWORK = process.env.SUI_NETWORK || 'testnet';

// Wallet Configuration
export const WALLET_ADDRESS = getEnv('WALLET_ADDRESS');



//Solana Configs

export const SOLANA_CONNECTION = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
export const SOLANA_KEYPAIR = Keypair.fromSecretKey(bs58.decode(process.env.SOL_PRIVATE_KEY || ''));
export const BRIDGED_SUI_TOKEN_MINT = process.env.BRIDGED_SUI_TOKEN_MINT || '';
export const BRIDGED_SUI_TOKEN_DECIMALS = parseInt(process.env.BRIDGED_SUI_TOKEN_DECIMALS || '0');

