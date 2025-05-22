import { MemoService } from './services/memo.service';
import { MemoData, SwapFields, TxInfo } from './types/Index';
import { WormholeService } from './services/wormhole.service';
import { CetusService } from './services/cetus.service';
import { PaystackService } from './services/paystack.service';
import { refundTransaction } from './utils/refund';
import { SUI_KEYPAIR } from './config/config';
import { mistToSui } from './utils/txParser';

export class TxProcessor {
  private memoService: MemoService;
  private wormholeService: WormholeService;
  private cetusService: CetusService;
  private paystackService: PaystackService;
  
  private processedRefunds: Set<string>;
  
  constructor() {
    this.memoService = new MemoService();
    this.wormholeService = new WormholeService();
    this.cetusService = new CetusService();
    this.paystackService = new PaystackService();
    this.processedRefunds = new Set();
  }

  async processTransaction(txInfo: any) {
    if (this.processedRefunds.has(txInfo.digest)) {
      console.log(`Transaction ${txInfo.digest} has already been refunded, skipping`);
      return;
    }

    const memo = txInfo.memo;
    console.log(memo);
    if (!memo) {
      await this.handleRefund(txInfo, 'No memo provided');
      return;
    }

    const memoData: MemoData = await this.memoService.parseMemo(txInfo.sender, memo);
    console.log(memoData);
    if (!memoData.valid) {
      await this.handleRefund(txInfo, `Invalid memo: ${memoData.validationErrors?.join(', ')}`);
      return;
    }

    try {
      switch (memoData.type) {
        case 'swap':
          await this.processSwap(memoData, txInfo);
          break;
        case 'bridge':
          await this.processBridge(memoData, txInfo);
          break;
        case 'offramp':
          await this.processOfframp(memoData, txInfo);
          break;
        case 'unknown':
        default:
          await this.handleRefund(txInfo, 'Unknown memo type');
          break;
      }
    } catch (error) {
      console.error(`Error processing transaction ${txInfo.digest}:`, error);
      await this.handleRefund(txInfo, `Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleRefund(txInfo: TxInfo, reason: string) {
    if (this.processedRefunds.has(txInfo.digest)) {
      console.log(`Transaction ${txInfo.digest} has already been refunded, skipping`);
      return;
    }
    
    try {
      console.log(`Initiating refund for tx ${txInfo.digest}: ${reason}`);
      const signature = await refundTransaction({
        recipient: txInfo.sender,
        amount: txInfo.amount,
        coinType: txInfo.coinType,
        digest: txInfo.digest,
        reason,
        signer: SUI_KEYPAIR
      });
      
      // Mark as refunded
      this.processedRefunds.add(txInfo.digest);
      console.log(`Refund successful: ${signature}`);
    } catch (error) {
      console.error(`Failed to process refund for tx ${txInfo.digest}:`, error);
    }
  }

  private async processSwap(memoData: MemoData, txInfo: TxInfo): Promise<void> {
    console.log(`Processing swap transaction: ${txInfo.digest}`);
    const swapFields: SwapFields = {
      inputCoin: txInfo.coinType,
      outputCoin: memoData.tokenMint!,
      amount: txInfo.amount,
      recipient: txInfo.sender,
      slippage: parseFloat(memoData.slippage!),
    };
    await this.cetusService.swapTokensAndSendToUser(swapFields);
  }

  private async processBridge(memoData: MemoData, txInfo: TxInfo): Promise<void> {
    if (!memoData.bridgeWallet) {
      throw new Error('No bridge wallet found');
    }
    if (memoData.chain !== 'sol' && memoData.chain !== 'solana') {
      throw new Error('Bridge service for this chain not yet available');
    }

    const txSignature = await this.wormholeService.initiateBridge(
      "Sui",
      "Solana",
      mistToSui(txInfo.amount),
      memoData.bridgeWallet
    );

    console.log(`Bridge transaction successful: ${txSignature}`);
    return;
  }

  private async processOfframp(memoData: MemoData, txInfo: TxInfo): Promise<void> {
    console.log(`Processing offramp transaction: ${txInfo.digest}`);
    
    try {
      //Assuming here that 1 sui == 1 naira
      //We are converting the amount to kobo which is == 0.01 naira
      const amountInKobo = Math.floor(Number(mistToSui(txInfo.amount)) * 100);
      
      const result = await this.paystackService.processOfframpTransfer(
        txInfo.sender,
        amountInKobo
      );

      console.log(`Offramp transfer completed:`, {
        reference: result.reference,
        status: result.status,
        amount: txInfo.amount
      });
    } catch (error) {
      console.error('Error processing offramp:', error);
    }
  }
} 