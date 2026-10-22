/**
 * Beta reports unlock failures as plain `detail` text, e.g.
 * "Coin amount mismatch. Place 'X' costs 12.00000000 coins to unlock. Provided: 10 coins, Expected: 12.00000000 coins."
 */
export function priceFromMismatch(message: string): number | null {
  const match = /Expected:\s*([\d.]+)/i.exec(message) ?? /costs\s+([\d.]+)\s+coins/i.exec(message);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function isPriceMismatch(message: string): boolean {
  return /mismatch|price/i.test(message) && priceFromMismatch(message) !== null;
}

export function isInsufficientCoins(message: string): boolean {
  return /insufficient|payment failed/i.test(message);
}
