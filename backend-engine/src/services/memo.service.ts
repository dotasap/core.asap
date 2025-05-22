import { PublicKey } from '@solana/web3.js';
import Web3 from 'web3';
import { getEnv } from '../config/config';
import { MemoData } from '../types/Index';
import { getClientForEnvironment } from '../config/client';

const web3 = new Web3();

//Support for other chains TBD
const CHAINS = new Set([
    'solana',
    'sol',
    //'bsc'
  ]);

export class MemoService {
  private readonly SERVICE_TOKEN: string;

  constructor() {
    this.SERVICE_TOKEN = getEnv('SERVICE_TOKEN') || '';
  }

  private get webServiceHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-service-token': this.SERVICE_TOKEN
    };
  }


  private async isValidTokenMint(tokenType: string): Promise<boolean> {
    const isWellFormed = /^0x[a-fA-F0-9]{1,64}::[a-zA-Z_][\w]*::[a-zA-Z_][\w]*$/.test(tokenType);
    if (!isWellFormed) return false;
  
    try {
      const client = await getClientForEnvironment();
      const metadata = await client.getCoinMetadata({ coinType: tokenType });
      return !!metadata?.symbol;
    } catch {
      return false;
    }
  }
  

  private isValidChain(memoSplitChunk: string): boolean {
    return typeof memoSplitChunk === 'string' && CHAINS.has(memoSplitChunk.toLowerCase());
  }

  private async getSavedBridgeAddress(walletAddress: string, chain: string): Promise<string | null> {
    const res = await fetch(`${getEnv('WEB_SERVICE_URL')}/api/wallets/${walletAddress}/settings`, {
      headers: this.webServiceHeaders
    });
    
    if (!res.ok) return null;
    const data = (await res.json().catch(() => ({}))) as { settings?: { bridgeAddresses?: Record<string, string> } };
    return data.settings?.bridgeAddresses?.[chain] || null;
  }

  private async getSavedSlippage(walletAddress: string): Promise<string | null> {
    const res = await fetch(`${getEnv('WEB_SERVICE_URL')}/api/wallets/${walletAddress}/settings`, {
      headers: this.webServiceHeaders
    });
    if (!res.ok) return null;
    const data = (await res.json().catch(() => ({}))) as { settings?: { swapSlippage?: string } };
    return data.settings?.swapSlippage || null;
  }

  
  private isValidWalletAddress(address: string, chain: string): boolean {
    if (!address || !chain) return false;

    if (chain.toLowerCase() === 'bsc') {
      return web3.utils.isAddress(address);
    }

    if (chain.toLowerCase() === 'sol' || chain.toLowerCase() === 'solana') {
      try {
        new PublicKey(address);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }
  
  private normalizeTokenKeyword(keyword: string): string | null {
    if (keyword.toLowerCase() == 'sui') {
      return '0x2::sui::SUI';
    }
    return null;
  }
  

  private parseOfframp(memoSplitChunks: string[], lowercaseMemoSplitChunks: string[]): MemoData | null {
    if (lowercaseMemoSplitChunks.includes('offramp')) {
      return { type: 'offramp', isOfframp: true, valid: true };
    }
    return null;
  }

  
  private async parseBridge(sender: string, memoSplitChunks: string[], lowercaseMemoSplitChunks: string[]): Promise<MemoData | null> {
    let foundChain: string | undefined;
    let saveDefault = false;
    let bridgeChunks = [...memoSplitChunks];
    let bridgeChunksLowercase = [...lowercaseMemoSplitChunks];

    // find chain
    for (let i = 0; i < bridgeChunksLowercase.length; i++) {
      if (this.isValidChain(bridgeChunks[i])) {
        foundChain = bridgeChunksLowercase[i];
        bridgeChunks.splice(i, 1);
        bridgeChunksLowercase.splice(i, 1);
        break;
      }
    }
    if (foundChain) {
      const savedBridgeAddressForFoundChain = await this.getSavedBridgeAddress(sender, foundChain);

      // Check for 'save'
      const saveIdx = bridgeChunksLowercase.findIndex(chunk => chunk === 'save');
      if (saveIdx !== -1) {
        saveDefault = true;
        bridgeChunks.splice(saveIdx, 1);
        bridgeChunksLowercase.splice(saveIdx, 1);
      }
      // It should remain just one chunk afteer the chain and save has been removed
      const possibleAddr = bridgeChunks.find(chunk => this.isValidWalletAddress(chunk, foundChain!));
      if (possibleAddr) {
        if (saveDefault) {
          await this.saveBridgeAddress(sender, foundChain, possibleAddr);
        }
        return {
          type: 'bridge',
          chain: foundChain,
          bridgeWallet: possibleAddr,
          saveDefault,
          valid: true,
          validationErrors: [],
        };
      } else if (savedBridgeAddressForFoundChain) {
        // No address provided, expect to use saved address for chain
        return {
          type: 'bridge',
          chain: foundChain,
          bridgeWallet: savedBridgeAddressForFoundChain,
          saveDefault,
          valid: true,
          validationErrors: []
        };
      } else {
        //Mo valid address found, and no saved address
        return null;
      }
    }
    return null;
  }

  private async parseSwap(sender: string, memoSplitChunks: string[], lowercaseMemoSplitChunks: string[]): Promise<MemoData | null> {
    let link: string | undefined;
    let tokenMint: string | undefined;
    let slippage: string | undefined;
    let saveDefault = false;
  
    for (let i = 0; i < memoSplitChunks.length; i++) {
      const chunk = memoSplitChunks[i];
      const lcChunk = lowercaseMemoSplitChunks[i];
  
      // slippage=0.5
      if (!slippage && lcChunk.startsWith('slippage=')) {
        slippage = chunk.split('=')[1];
        // "save" flag
        if (lcChunk === 'save') {
          saveDefault = true;
          await this.saveSlippage(sender, slippage);
        }
      }
  
      // Normalize known keywords (sol, solana, etc.)
      if (!tokenMint) {
        const normalized = this.normalizeTokenKeyword(lcChunk);
        if (normalized) {
          tokenMint = normalized;
          continue;
        }
      }
  
      if (!tokenMint && await this.isValidTokenMint(chunk)) {
        tokenMint = chunk;
      }
    }
    
    if (!tokenMint) return null;

    if (!slippage) {
      const savedSlippage = await this.getSavedSlippage(sender);
      if (savedSlippage) {
        slippage = savedSlippage;
      }
    }

    return {
      type: 'swap',
      tokenMint,
      link,
      slippage,
      saveDefault,
      valid: true,
      validationErrors: [],
    };
  }
  





  
  //parse memo string for MemoData
  async parseMemo(sender: string, memo: string): Promise<MemoData> {
    const memoSplitChunks = memo.trim().split(/\s+/);
    const lowercaseMemoSplitChunks = memoSplitChunks.map(chunk => chunk.toLowerCase());
    const offramp = this.parseOfframp(memoSplitChunks, lowercaseMemoSplitChunks);
    if (offramp) return offramp;
    const bridge = await this.parseBridge(sender, memoSplitChunks, lowercaseMemoSplitChunks);
    if (bridge) return bridge;
    const swap = await this.parseSwap(sender, memoSplitChunks, lowercaseMemoSplitChunks);
    if (swap) return swap;
    // Unknown
    return {
      type: 'unknown',
      valid: false,
      validationErrors: ['Unknown memo format', `Input chunks: ${JSON.stringify(memoSplitChunks)}`],
    };
  }



  async saveBridgeAddress(walletAddress: string, chain: string, address: string): Promise<void> {
    // Call the web-service API to update bridge addresses
    const res = await fetch(`${getEnv('WEB_SERVICE_URL')}/api/wallets/${walletAddress}/settings`, {
      method: 'PUT',
      headers: this.webServiceHeaders,
      body: JSON.stringify({ bridgeAddresses: { [chain]: address } }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error || 'Failed to save bridge address');
    }
  }
  

  async saveSlippage(walletAddress: string, slippage: string): Promise<void> {
    const res = await fetch(`${getEnv('WEB_SERVICE_URL')}/api/wallets/${walletAddress}/settings`, {
      method: 'PUT',
      headers: this.webServiceHeaders,
      body: JSON.stringify({ slippage }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error || 'Failed to save slippage');
    }
  }


  async recordTransaction(address: string, memoData: MemoData, amount: number, signature: string): Promise<void> {
    // Record transaction TBD, this would be done as a notificatoin service
  }
}