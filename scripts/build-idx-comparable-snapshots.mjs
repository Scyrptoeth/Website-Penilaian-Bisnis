import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readXlsxFile from "read-excel-file/node";

const DEFAULT_YEARS = [2021, 2022, 2023, 2024, 2025];
const INDEX_SYMBOL = "^JKSE";
const TOLERANCE = 0.2;
const MIN_BETA_OBSERVATIONS = 24;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_OUTPUT_DIR = path.join(ROOT, "src/lib/valuation");
const DEFAULT_REPORT = path.join(ROOT, "scripts/idx-comparable-snapshot-build-report.json");

const args = parseArgs(process.argv.slice(2));
const sourceFile = args.source ?? process.env.PVB_IDX_SOURCE_XLSX;
const outputDir = path.resolve(args.out ?? DEFAULT_OUTPUT_DIR);
const reportFile = path.resolve(args.report ?? DEFAULT_REPORT);
const years = args.years ? args.years.split(",").map((year) => Number(year.trim())) : DEFAULT_YEARS;

if (!sourceFile) {
  throw new Error("Provide --source /path/to/Daftar_Saham_IDX_...xlsx or set PVB_IDX_SOURCE_XLSX.");
}

const sourcePath = path.resolve(sourceFile);
const sourceFileName = path.basename(sourcePath);
const sourceRows = await readSourceRows(sourcePath);
const indexSeries = await fetchYahooSeries(INDEX_SYMBOL);
const indexReturns = buildMonthlyReturns(indexSeries);

let completed = 0;
const enrichedRows = await mapLimit(sourceRows, Number(args.concurrency ?? 6), async (row) => {
  const [fundamentals, priceSeries] = await Promise.all([
    fetchFundamentals(row.code).catch((error) => ({ error: error instanceof Error ? error.message : String(error), years: {} })),
    fetchYahooSeries(`${row.code}.JK`).catch((error) => ({ error: error instanceof Error ? error.message : String(error), points: [] })),
  ]);

  completed += 1;
  if (completed % 25 === 0 || completed === sourceRows.length) {
    console.log(`Processed ${completed}/${sourceRows.length}`);
  }

  const stockReturns = "points" in priceSeries ? buildMonthlyReturns(priceSeries) : new Map();

  return {
    ...row,
    fundamentals,
    betaByYear: Object.fromEntries(years.map((year) => [year, calculateBeta(stockReturns, indexReturns, year)])),
  };
});

const snapshots = Object.fromEntries(
  years.map((year) => {
    const rows = enrichedRows.map((row) => {
      const yearFundamentals = row.fundamentals.years?.[year] ?? {};
      return {
        comparable: row.comparable,
        sector: row.sector,
        betaLevered: roundNullable(row.betaByYear[year], 3),
        marketCap: roundNullable(yearFundamentals.marketCap, 0),
        debt: roundNullable(sumNullable(yearFundamentals.shortTermBorrowing, yearFundamentals.longTermBorrowing), 0),
        quality: "Bisa Dipertimbangkan sebagai Data Pembanding",
      };
    });

    return [year, classifyRows(rows)];
  }),
);

await mkdir(outputDir, { recursive: true });
for (const year of years) {
  await writeFile(path.join(outputDir, `idx-comparables-${year}.json`), `${JSON.stringify(snapshots[year], null, 2)}\n`);
}

const report = {
  generatedAtWib: formatWibTimestamp(new Date()),
  sourceFile: sourceFileName,
  outputDir: path.relative(ROOT, outputDir),
  rowCount: sourceRows.length,
  years: Object.fromEntries(
    years.map((year) => {
      const rows = snapshots[year];
      return [
        year,
        {
          rowCount: rows.length,
          completeRows: rows.filter((row) => row.betaLevered !== null && row.marketCap !== null && row.debt !== null).length,
          missingBeta: rows.filter((row) => row.betaLevered === null).length,
          missingMarketCap: rows.filter((row) => row.marketCap === null).length,
          missingDebt: rows.filter((row) => row.debt === null).length,
          qualityCounts: countBy(rows, (row) => row.quality),
        },
      ];
    }),
  ),
  sourceNotes: [
    "IDX company universe, sector, and names come from the source XLSX.",
    "Market cap, short-term borrowing, and long-term borrowing come from IndoPremier annual fundamentals endpoint with quarter=4.",
    "Beta is calculated from monthly stock returns versus ^JKSE using Yahoo Finance chart data, trailing five years up to each snapshot year-end.",
    "Investing.com financial statement pages were used as a manual structure cross-check; automated Investing.com extraction was not used because regular requests are Cloudflare challenged.",
  ],
};

await writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

function parseArgs(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = values[index + 1];
    if (next && !next.startsWith("--")) {
      parsed[key] = next;
      index += 1;
    } else {
      parsed[key] = "true";
    }
  }
  return parsed;
}

async function readSourceRows(workbookPath) {
  const workbookRows = await readXlsxFile(workbookPath, { sheet: "Daftar Saham" });
  const rows = Array.isArray(workbookRows[0]) ? workbookRows : workbookRows[0]?.data;

  if (!Array.isArray(rows) || !Array.isArray(rows[0])) {
    throw new Error("Unable to read Daftar Saham rows from source XLSX.");
  }

  const headers = rows[0].map((value) => String(value ?? "").trim());
  const column = (name) => headers.indexOf(name);
  const codeIndex = column("Kode");
  const comparableIndex = column("Comparable") >= 0 ? column("Comparable") : column("Nama Perusahaan");
  const sectorIndex = column("Sektor");

  if (codeIndex < 0 || comparableIndex < 0 || sectorIndex < 0) {
    throw new Error("Source XLSX must include Kode, Comparable/Nama Perusahaan, and Sektor columns.");
  }

  return rows
    .slice(1)
    .map((row) => ({
      code: String(row[codeIndex] ?? "").trim(),
      comparable: String(row[comparableIndex] ?? "").trim(),
      sector: String(row[sectorIndex] ?? "").trim(),
    }))
    .filter((row) => row.code && row.comparable && row.sector);
}

async function fetchFundamentals(code) {
  const url = `https://www.indopremier.com/module/saham/include/fundamental.php?code=${encodeURIComponent(code)}&quarter=4`;
  const html = await fetchText(url);
  const table = html.match(/<table[\s\S]*?<\/table>/i)?.[0];

  if (!table) {
    throw new Error(`No fundamental table for ${code}`);
  }

  const headerCells = extractCells(table, "th");
  const dataHeaders = headerCells.slice(2);
  const bodyRows = [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((match) => extractCells(match[1], "td"))
    .filter((cells) => cells.length > 1);

  const rowMap = new Map(bodyRows.map((cells) => [cells[0], cells.slice(1)]));
  const years = {};

  for (const year of years) {
    const headerIndex = dataHeaders.findIndex((header) => new RegExp(`(?:\\[)?12M\\]?\\s+${year}\\b`).test(header));

    if (headerIndex < 0) {
      years[year] = {};
      continue;
    }

    years[year] = {
      periodLabel: dataHeaders[headerIndex],
      marketCap: parseFinancialNumber(rowMap.get("Market Cap")?.[headerIndex]),
      shortTermBorrowing: parseFinancialNumber(rowMap.get("S.T.Borrowing")?.[headerIndex]),
      longTermBorrowing: parseFinancialNumber(rowMap.get("L.T.Borrowing")?.[headerIndex]),
      revenue: parseFinancialNumber(rowMap.get("Revenue")?.[headerIndex]),
      netProfit: parseFinancialNumber(rowMap.get("Net.Profit")?.[headerIndex]),
    };
  }

  return { url, years };
}

async function fetchYahooSeries(symbol) {
  const period1 = unixDate("2015-12-01");
  const period2 = unixDate("2026-02-01");
  const encodedSymbol = encodeURIComponent(symbol);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodedSymbol}?period1=${period1}&period2=${period2}&interval=1mo&events=history&includeAdjustedClose=true`;
  const json = await fetchJson(url);
  const result = json.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const adjclose = result?.indicators?.adjclose?.[0]?.adjclose ?? result?.indicators?.quote?.[0]?.close ?? [];

  return {
    url,
    points: timestamps
      .map((timestamp, index) => ({
        month: new Date(timestamp * 1000).toISOString().slice(0, 7),
        close: typeof adjclose[index] === "number" && Number.isFinite(adjclose[index]) ? adjclose[index] : null,
      }))
      .filter((point) => point.close !== null),
  };
}

async function fetchText(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      if (attempt === retries) throw error;
      await delay(500 * attempt);
    }
  }

  throw new Error(`Unable to fetch ${url}`);
}

async function fetchJson(url) {
  return JSON.parse(await fetchText(url));
}

function extractCells(markup, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  return [...markup.matchAll(regex)].map((match) => cleanHtml(match[1]));
}

function cleanHtml(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFinancialNumber(value) {
  if (!value || value === "-" || value === "N/A") return null;

  const normalized = value.replace(/\s+/g, "").replace(/,/g, "");
  const match = normalized.match(/^(-?\d+(?:\.\d+)?)([KMBT])?$/i);

  if (!match) return null;

  const amount = Number(match[1]);
  const multiplier = { K: 1_000, M: 1_000_000, B: 1_000_000_000, T: 1_000_000_000_000 }[match[2]?.toUpperCase()] ?? 1;

  return Number.isFinite(amount) ? amount * multiplier : null;
}

function buildMonthlyReturns(series) {
  const ordered = [...series.points].sort((first, second) => first.month.localeCompare(second.month));
  const returns = new Map();

  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1].close;
    const current = ordered[index].close;

    if (previous > 0 && current > 0) {
      returns.set(ordered[index].month, current / previous - 1);
    }
  }

  return returns;
}

function calculateBeta(stockReturns, indexReturns, year) {
  const start = `${year - 4}-01`;
  const end = `${year}-12`;
  const pairs = [...stockReturns.entries()]
    .filter(([month]) => month >= start && month <= end && indexReturns.has(month))
    .map(([month, stockReturn]) => [stockReturn, indexReturns.get(month)]);

  if (pairs.length < MIN_BETA_OBSERVATIONS) return null;

  const stockMean = average(pairs.map(([stockReturn]) => stockReturn));
  const indexMean = average(pairs.map(([, indexReturn]) => indexReturn));
  const covariance = average(pairs.map(([stockReturn, indexReturn]) => (stockReturn - stockMean) * (indexReturn - indexMean)));
  const variance = average(pairs.map(([, indexReturn]) => (indexReturn - indexMean) ** 2));

  return variance > 0 ? covariance / variance : null;
}

function classifyRows(rows) {
  const sectorRows = groupBy(rows, (row) => row.sector);
  const averagesBySector = new Map(
    [...sectorRows.entries()].map(([sector, sectorCompanies]) => [
      sector,
      {
        beta: average(sectorCompanies.map((row) => row.betaLevered).filter(isNumber)),
        marketCap: average(sectorCompanies.map((row) => row.marketCap).filter(isNumber)),
        debt: average(sectorCompanies.map((row) => row.debt).filter(isNumber)),
      },
    ]),
  );

  return rows.map((row) => {
    const averages = averagesBySector.get(row.sector);
    const positions = [
      metricPosition(row.betaLevered, averages?.beta),
      metricPosition(row.marketCap, averages?.marketCap),
      metricPosition(row.debt, averages?.debt),
    ];
    const sameCount = positions.filter((position) => position === "same").length;
    const hasMissing = positions.includes("missing");

    return {
      ...row,
      quality: hasMissing
        ? "Bisa Dipertimbangkan sebagai Data Pembanding"
        : sameCount >= 2
          ? "Data Pembanding Bersifat Ideal"
          : sameCount === 1
            ? "Data Pembanding Bersifat Moderat"
            : positions.every((position) => position === "above")
              ? "Data Pembanding Diatas Rata-Rata Sektor"
              : positions.every((position) => position === "below")
                ? "Data Pembanding Dibawah Rata-Rata Sektor"
                : "Bisa Dipertimbangkan sebagai Data Pembanding",
    };
  });
}

function metricPosition(value, averageValue) {
  if (!isNumber(value) || !isNumber(averageValue)) return "missing";
  if (value < averageValue * (1 - TOLERANCE)) return "below";
  if (value > averageValue * (1 + TOLERANCE)) return "above";
  return "same";
}

async function mapLimit(values, limit, mapper) {
  const results = new Array(values.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < values.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(values[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, () => worker()));

  return results;
}

function countBy(values, keyFn) {
  return values.reduce((counts, value) => {
    const key = keyFn(value);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function groupBy(values, keyFn) {
  const groups = new Map();

  for (const value of values) {
    const key = keyFn(value);
    const group = groups.get(key) ?? [];
    group.push(value);
    groups.set(key, group);
  }

  return groups;
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function sumNullable(...values) {
  const validValues = values.filter(isNumber);
  return validValues.length ? validValues.reduce((sum, value) => sum + value, 0) : null;
}

function roundNullable(value, decimals) {
  if (!isNumber(value)) return null;
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

function isNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function unixDate(value) {
  return Math.floor(new Date(`${value}T00:00:00Z`).getTime() / 1000);
}

function formatWibTimestamp(value) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(value);
  const part = (type) => parts.find((item) => item.type === type)?.value ?? "";

  return `${part("day")}/${part("month")}/${part("year")}, ${part("hour")}:${part("minute")}:${part("second")}`;
}

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
