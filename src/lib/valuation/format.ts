export function formatIdr(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentFixed(value: number, fractionDigits = 2): string {
  return new Intl.NumberFormat("id-ID", {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatScore(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatInputNumber(value: number): string {
  return formatIntegerNumber(value);
}

export function formatRateInputNumber(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 8,
  }).format(value);
}

export function formatIntegerNumber(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
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

export function formatEditableInteger(input: string): string {
  const value = input.trim();

  if (!value) {
    return "";
  }

  const isNegative = value.startsWith("-");
  const withoutCurrency = value.replace(/\s/g, "").replace(/rp/gi, "");
  const normalizedSign = withoutCurrency.replace(/-/g, "");
  const commaIndex = normalizedSign.indexOf(",");
  const dotCount = normalizedSign.split(".").length - 1;
  const integerCandidate =
    commaIndex >= 0
      ? normalizedSign.slice(0, commaIndex)
      : dotCount === 1 && normalizedSign.split(".")[1]?.length !== 3
        ? normalizedSign.split(".")[0]
        : normalizedSign;
  const integerDigits = integerCandidate.replace(/\D/g, "");
  const groupedInteger = integerDigits ? formatIntegerNumber(Number(integerDigits)) : "";
  const sign = isNegative ? "-" : "";

  return groupedInteger ? `${sign}${groupedInteger}` : sign;
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
