export function toCurrencyString(amountInCents) {
  return (amountInCents / 100).toFixed(2);
}
