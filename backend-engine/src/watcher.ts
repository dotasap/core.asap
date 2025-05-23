import { getClientForEnvironment } from './config/client';
import { WALLET_ADDRESS } from './config/config';
import { TxProcessor } from './txProcessor';
import { logs } from './utils/txParser';
import { loadProcessedDigests, isDigestProcessed, markDigestAsProcessed } from './utils/processedDigests';

const txProcessor = new TxProcessor();

export async function startTransactionMonitoring() {
    loadProcessedDigests();
    const client = await getClientForEnvironment();
    let cursor: string | null = null;

    try {
        while (true) {
            const { data: txs, nextCursor, hasNextPage } = await client.queryTransactionBlocks({
                filter: { ToAddress: WALLET_ADDRESS },
                options: {
                    showInput: true,
                    showObjectChanges: true,
                    showEvents: true,
                },
                cursor,
                limit: 50,
                order: 'descending',
            });
            if (!txs || txs.length === 0) break;

            for (const tx of txs) {
                const digest = tx.digest;

                if (isDigestProcessed(digest)) {
                    break; // assume everything older is also processed
                }

                //new tx
                const txInfo = logs(tx);
                if (txInfo) {
                    await txProcessor.processTransaction(txInfo);
                }
                markDigestAsProcessed(digest);
            }

            if (!hasNextPage || !nextCursor) break;
            cursor = nextCursor;
        }
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('Polling error:', err);
    } finally {
        setTimeout(startTransactionMonitoring, 5000);
    }
}
