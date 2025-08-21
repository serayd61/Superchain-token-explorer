import { saveTokenDeployment, saveScanHistory } from '@/lib/database';
import type { TokenContract } from './types';

export async function recordTokenDeployment(token: TokenContract): Promise<void> {
  try {
    await saveTokenDeployment(token);
    console.log(`✅ Saved to DB: ${token.metadata.symbol} at ${token.contract_address}`);
  } catch (dbError) {
    console.error('Database save error:', dbError);
  }
}

export async function recordScanHistory(history: {
  chain: string;
  blocks_scanned: number;
  total_contracts: number;
  lp_contracts: number;
  success_rate: number;
  scan_time: string;
  scan_duration_ms?: number;
  error_message?: string;
}): Promise<void> {
  try {
    await saveScanHistory(history);
    console.log(`📊 Saved scan history for ${history.chain}`);
  } catch (dbError) {
    console.error('Error saving scan history:', dbError);
  }
}
