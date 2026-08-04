export function formatResourceAmount(amount) {
  return Number(amount)
    .toFixed(2)
    .replace(/\.?0+$/, "");
}
