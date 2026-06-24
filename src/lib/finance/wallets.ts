import type { SupabaseClient } from "@supabase/supabase-js";
import type { FinanceTransaction, Wallet } from "@/types/database";

export function transactionWalletDelta(
  tx: Pick<FinanceTransaction, "type" | "amount">,
  reverse = false
): number {
  const amount = Number(tx.amount);
  const delta = tx.type === "income" ? amount : -amount;
  return reverse ? -delta : delta;
}

export function totalWalletBalance(wallets: Wallet[]): number {
  return wallets.reduce((sum, wallet) => sum + Number(wallet.balance), 0);
}

export async function adjustWalletBalance(
  supabase: SupabaseClient,
  walletId: string,
  delta: number
): Promise<number | null> {
  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("id", walletId)
    .single();

  if (!wallet) return null;

  const nextBalance = Number(wallet.balance) + delta;
  await supabase.from("wallets").update({ balance: nextBalance }).eq("id", walletId);
  return nextBalance;
}

export function applyWalletDeltaLocally(
  wallets: Wallet[],
  walletId: string,
  delta: number
): Wallet[] {
  return wallets.map((wallet) =>
    wallet.id === walletId
      ? { ...wallet, balance: Number(wallet.balance) + delta }
      : wallet
  );
}

export async function syncWalletForTransaction(
  supabase: SupabaseClient,
  tx: Pick<FinanceTransaction, "wallet_id" | "type" | "amount">,
  reverse = false
): Promise<number | null> {
  if (!tx.wallet_id) return null;
  return adjustWalletBalance(supabase, tx.wallet_id, transactionWalletDelta(tx, reverse));
}
