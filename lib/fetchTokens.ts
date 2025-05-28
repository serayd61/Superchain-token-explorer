// lib/fetchTokens.ts

export type TokenEntry = {
  chain: string
  block: number
  hash: string
  from: string
  timestamp: string
  lp_status: string
}

export async function fetchTokens(): Promise<TokenEntry[]> {
  const res = await fetch("/base_tokenlar_lp.json")
  if (!res.ok) throw new Error("Veri alınamadı")
  return res.json()
}
