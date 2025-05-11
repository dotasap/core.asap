import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateMnemonic } from 'bip39';

export function generatePhrase(): string {
  return generateMnemonic();
}

export function keypairFromPhrase(phrase: string): Ed25519Keypair {
  return Ed25519Keypair.deriveKeypair(phrase);
}

export function getAddress(keypair: Ed25519Keypair): string {
  return keypair.getPublicKey().toSuiAddress();
}
