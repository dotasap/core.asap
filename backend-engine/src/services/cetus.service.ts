
import { AggregatorClient, Env, Router } from "@cetusprotocol/aggregator-sdk";
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { BN } from "bn.js";
import { SwapResult, SwapFields } from '../types/Index';
import { SUI_KEYPAIR } from '../config/config';


const OVERLAY_FEE_RECEIVER = "0x629eb095cec6387d7ac7a7a01be1ab608bb974789632ea022440bd0caf1c39d0";


export class CetusService {
  private client: SuiClient;
  private keypair: Ed25519Keypair;

  constructor() {
    this.client = new SuiClient({ url: "https://fullnode.mainnet.sui.io" });
    this.keypair = SUI_KEYPAIR;
  }

  async swapTokensAndSendToUser({
    inputCoin,
    outputCoin,
    amount,
    recipient,
    slippage
  }: SwapFields): Promise<SwapResult> {
    try {
      const amountInAtomic = new BN(amount.toString());

      const aggregator = new AggregatorClient({
        client: this.client,
        signer: this.keypair.toSuiAddress(),
        env: Env.Mainnet,
        overlayFeeRate: 0.01,
        overlayFeeReceiver: OVERLAY_FEE_RECEIVER,
      });

      console.log("Finding route for:", inputCoin, outputCoin, amountInAtomic.toString());

      const routers = await aggregator.findRouters({
        from: inputCoin,
        target: outputCoin,
        amount: amountInAtomic,
        byAmountIn: true,
      });

      if (!routers || routers.routes.length === 0) {
        return { success: false, error: "No route found" };
      }

      const txb = new Transaction();

      const [coin] = txb.splitCoins(txb.gas, [amountInAtomic.toString()]);

      const targetCoin = await aggregator.routerSwap({
        routers,
        byAmountIn: true,
        txb,
        inputCoin: coin,
        slippage: 0.01,
      });

      txb.transferObjects([targetCoin], txb.pure.address(recipient));

      const response = await this.client.signAndExecuteTransaction({
        signer: this.keypair,
        transaction: txb,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showBalanceChanges: true,
        },
      });

      return {
        success: true,
        digest: response.digest,
        balanceChanges: response.balanceChanges,
        objectChanges: response.objectChanges,
      };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err) };
    }
  }
}