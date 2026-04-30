export function formatIdr(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatScore(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatInputNumber(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 8,
  }).format(value);
}

export function formatEditableNumber(input: string): string {
  const value = input.trim();

  if (!value) {
    return "";
  }

  const isNegative = value.startsWith("-");
  const withoutCurrency = value.replace(/\s/g, "").replace(/rp/gi, "");
  const normalizedSign = withoutCurrency.replace(/-/g, "");
  const [integerPart = "", ...decimalParts] = normalizedSign.split(",");
  const integerDigits = integerPart.replace(/\D/g, "");
  const decimalDigits = decimalParts.join("").replace(/\D/g, "");
  const hasDecimalSeparator = normalizedSign.includes(",");
  const groupedInteger = integerDigits ? new Intl.NumberFormat("id-ID").format(Number(integerDigits)) : "";
  const sign = isNegative ? "-" : "";

  if (!groupedInteger && !hasDecimalSeparator) {
    return sign;
  }

  return `${sign}${groupedInteger || "0"}${hasDecimalSeparator ? `,${decimalDigits}` : ""}`;
}

export function formatDisplayDate(value: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}
