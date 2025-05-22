import {
  Chain,
  Network,
  Wormhole,
  amount,
  wormhole,
  TokenId,
  TokenTransfer,
} from '@wormhole-foundation/sdk';
import solana from '@wormhole-foundation/sdk/solana';
import sui from '@wormhole-foundation/sdk/sui';
import { SignerStuff, getSigner, getTokenDecimals } from '../utils/bridgeHelpers';
import { SOLANA_CONNECTION, SOLANA_KEYPAIR, BRIDGED_SUI_TOKEN_DECIMALS, BRIDGED_SUI_TOKEN_MINT } from '../config/config';


import { PublicKey, Keypair, sendAndConfirmTransaction, Connection } from '@solana/web3.js'
import { Transaction as SolanaTransaction } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token'
import { createMemoInstruction } from '@solana/spl-memo';



export class WormholeService {
  
  async initiateBridge(
    fromChain: "Sui" | "Solana",
    toChain: "Sui" | "Solana",
    amountStr: string,
    recipient: string
  ): Promise<string> {
    const wh = await wormhole('Testnet', [sui, solana]);
    const sendChain = wh.getChain(fromChain);
    const rcvChain = wh.getChain(toChain);
    const source = await getSigner(sendChain);
    const destination = await getSigner(rcvChain);
    const tokenId = Wormhole.tokenId(sendChain.chain, 'native');
    const amt = amountStr;
    const automatic = false;
    const decimals = await getTokenDecimals(wh, tokenId, sendChain);

    // Perform the token transfer if no recovery transaction ID is provided

    const txids = await this.tokenTransfer(wh, {
      token: tokenId,
      amount: amount.units(amount.parse(amt, decimals)),
      source,
      destination,
      automatic,
    });

    console.log(txids);
    const signature = await this.transferBridgedSolToken(
      SOLANA_CONNECTION,
      SOLANA_KEYPAIR,
      recipient,
      Number(amountStr),
    );

    return signature;
  }

  private async tokenTransfer<N extends Network>(
    wh: Wormhole<N>,
    route: {
      token: TokenId;
      amount: bigint;
      source: SignerStuff<N, Chain>;
      destination: SignerStuff<N, Chain>;
      automatic: boolean;
      payload?: Uint8Array;
    }
  ): Promise<string[]> {
    const xfer = await wh.tokenTransfer(
      route.token,
      route.amount,
      route.source.address,
      route.destination.address,
      route.automatic ?? false,
      route.payload
    );
    const quote = await TokenTransfer.quoteTransfer(
      wh,
      route.source.chain,
      route.destination.chain,
      xfer.transfer
    );
    if (xfer.transfer.automatic && quote.destinationToken.amount < 0)
      throw 'The amount requested is too low to cover the fee and any native gas requested.';
    
    // Submit the transactions to the source chain, passing a signer to sign any txns
    console.log('Starting transfer');
    const srcTxids = await xfer.initiateTransfer(route.source.signer);
    console.log(`Source Trasaction ID: ${srcTxids[0]}`);
    console.log(`Wormhole Trasaction ID: ${srcTxids[1] ?? srcTxids[0]}`);
    // Wait for the VAA to be signed and ready (not required for auto transfer)
    console.log('Getting Attestation');
    await xfer.fetchAttestation(60_000);
    // Redeem the VAA on the dest chain
    console.log('Completing Transfer');
    const destTxids = await xfer.completeTransfer(route.destination.signer);
    console.log(`Completed Transfer: `, destTxids);
    return destTxids;
  }

  
  async getBridgeStatus(id: string): Promise<{ status: string, details?: any }> {
    // TODO: Implement status check
    return { status: 'pending' };
  }


  
  private async transferBridgedSolToken(
    connection: Connection,
    keypair: Keypair,
    recipient: string,
    amount: number
  ): Promise<string> {
    
    const recipientPubkey = new PublicKey(recipient)
    const mintPubkey: PublicKey = new PublicKey(BRIDGED_SUI_TOKEN_MINT)
    const fromTokenAccount = await getAssociatedTokenAddress(mintPubkey, keypair.publicKey)
    const toTokenAccount = await getAssociatedTokenAddress(mintPubkey, recipientPubkey)
    const tx = new SolanaTransaction().add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        keypair.publicKey,
        amount * Math.pow(10, BRIDGED_SUI_TOKEN_DECIMALS),
        [],
        TOKEN_PROGRAM_ID
      )
    )
    tx.add(createMemoInstruction("Bridged with love from dotASAP", [keypair.publicKey]))
    const signature = await sendAndConfirmTransaction(connection, tx, [keypair])
    return signature
  }
} 