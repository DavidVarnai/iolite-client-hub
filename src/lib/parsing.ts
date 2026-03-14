/**
 * Parsing utilities — standardized input parsing for currency, numbers, and percentages.
 */

/** Parse a currency string (e.g. "$1,234.56") into a number. Returns 0 for invalid input. */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9.\-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/** Parse a numeric input string, returning a fallback for invalid input. */
export function parseNumericInput(value: string, fallback = 0): number {
  const num = parseFloat(value);
  return isNaN(num) ? fallback : num;
}

/** Parse a percentage string (e.g. "12.5%") into a decimal (0.125). Returns 0 for invalid input. */
export function parsePercentage(value: string): number {
  const cleaned = value.replace(/[^0-9.\-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num / 100;
}

/** Format a number as USD currency (no decimals). */
export function formatCurrency(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
}
