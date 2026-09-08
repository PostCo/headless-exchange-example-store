export type Money = {
  amount: string;
  currencyCode: string;
};

export function formatPriceRange(min: Money, max: Money): string {
  if (min.amount === max.amount && min.currencyCode === max.currencyCode) {
    return formatMoney(min);
  }
  return `From ${formatMoney(min)}`;
}

export function formatMoney(money: Money): string {
  const amount = Number(money.amount);
  if (!Number.isFinite(amount)) {
    return `${money.amount} ${money.currencyCode}`;
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: money.currencyCode,
    }).format(amount);
  } catch {
    return `${money.amount} ${money.currencyCode}`;
  }
}
