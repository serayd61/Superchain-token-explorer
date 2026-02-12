// lib/fetchTokens.ts

import { chainExplorers } from './chains'

export type TokenEntry = {
  chain: string
  block: number
  hash: string
  from: string
  timestamp: string
  lp_status: string
  price_chart: number[] | 'none'
  explorerUrl: string
}

export async function fetchTokens(): Promise<TokenEntry[]> {
  const res = await fetch('/base_tokenlar_lp.json')
  if (!res.ok) throw new Error('Veri alınamadı')
  const data: Omit<TokenEntry, 'explorerUrl'>[] = await res.json()
  return data.map((t) => ({
    ...t,
    explorerUrl: chainExplorers[t.chain] ?? ''
  }))
}
