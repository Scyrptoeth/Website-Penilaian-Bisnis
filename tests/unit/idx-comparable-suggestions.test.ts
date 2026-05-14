import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findIdxComparableByLabel,
  formatIdxComparableLabel,
  getIdxComparablesBySector,
  getIdxComparableDatasetResolution,
  getIdxComparableDatasetUseStatus,
  getSuggestedIdxComparables,
  idxComparableDatasetMetadata,
  idxComparableDatasetSnapshots,
} from "../../src/lib/valuation/idx-comparable-suggestions";

describe("idx comparable suggestions", () => {
  it("limits comparable options to the selected sector", () => {
    const basicMaterials = getIdxComparablesBySector("Basic Materials");

    assert.equal(basicMaterials.length > 0, true);
    assert.equal(basicMaterials.every((company) => company.sector === "Basic Materials"), true);
  });

  it("prioritizes ideal comparables before moderate comparables", () => {
    const suggestions = getSuggestedIdxComparables("Basic Materials");

    assert.equal(suggestions.length, 3);
    assert.equal(suggestions[0].quality, "Data Pembanding Bersifat Ideal");
    assert.equal(suggestions.slice(1).every((company) => company.quality === "Data Pembanding Bersifat Moderat"), true);
  });

  it("round-trips displayed names with quality suffixes", () => {
    const [company] = getSuggestedIdxComparables("Basic Materials");
    const label = formatIdxComparableLabel(company);

    assert.match(label, /\(Data Pembanding Bersifat Ideal\)$/);
    assert.deepEqual(findIdxComparableByLabel("Basic Materials", label), company);
  });

  it("exposes snapshot provenance for audit review", () => {
    assert.equal(idxComparableDatasetMetadata.asOfDate, "2026-05-01");
    assert.equal(idxComparableDatasetMetadata.rowCount, 719);
    assert.match(idxComparableDatasetMetadata.processedFile, /Sector_Comparison_Tolerance_20pct/);
    assert.deepEqual(
      idxComparableDatasetSnapshots.map((snapshot) => snapshot.metadata.id),
      [
        "idx-annual-peer-snapshot-2021-12-31",
        "idx-annual-peer-snapshot-2022-12-31",
        "idx-annual-peer-snapshot-2023-12-31",
        "idx-annual-peer-snapshot-2024-12-31",
        "idx-annual-peer-snapshot-2025-12-31",
        "idx-yahoo-peer-snapshot-2026-05-01",
      ],
    );
  });

  it("resolves annual IDX peer snapshots for 2021 through 2025", () => {
    for (const year of [2021, 2022, 2023, 2024, 2025]) {
      const resolution = getIdxComparableDatasetResolution(`${year}-12-31`);

      assert.equal(resolution.resolutionKind, "exact-snapshot");
      assert.equal(resolution.snapshot.metadata.asOfDate, `${year}-12-31`);
      assert.equal(resolution.snapshot.metadata.rowCount, 719);
      assert.equal(resolution.snapshot.companies.length, 719);
      assert.match(resolution.snapshot.metadata.metricBasis, /return bulanan/);
    }
  });

  it("warns when a valuation date predates the earliest IDX peer snapshot", () => {
    const status = getIdxComparableDatasetUseStatus("2020-12-31");
    const resolution = getIdxComparableDatasetResolution("2020-12-31");

    assert.equal(resolution.resolutionKind, "look-ahead-fallback");
    assert.equal(resolution.snapshot.metadata.asOfDate, "2021-12-31");
    assert.equal(status.level, "warning");
    assert.equal(status.label, "Potensi look-ahead bias");
    assert.match(status.message, /31 Des 2020/);
    assert.match(status.message, /31 Des 2021/);
    assert.match(status.message, /latest-available fallback/);
  });

  it("keeps missing valuation dates informational instead of blocking peer review", () => {
    const status = getIdxComparableDatasetUseStatus("");
    const resolution = getIdxComparableDatasetResolution("");

    assert.equal(resolution.resolutionKind, "missing-valuation-date");
    assert.equal(status.level, "info");
    assert.match(status.message, /Isi tanggal penilaian/);
  });

  it("resolves exact and nearest-prior snapshot states explicitly", () => {
    const exactResolution = getIdxComparableDatasetResolution("2026-05-01");
    const futureResolution = getIdxComparableDatasetResolution("2026-12-31");
    const futureStatus = getIdxComparableDatasetUseStatus("2026-12-31");

    assert.equal(exactResolution.resolutionKind, "exact-snapshot");
    assert.equal(futureResolution.resolutionKind, "nearest-prior");
    assert.equal(futureStatus.level, "warning");
    assert.equal(futureStatus.label, "Snapshot peer perlu pembaruan");
  });

  it("uses the selected snapshot contract when filtering sector comparables", () => {
    const withoutDate = getIdxComparablesBySector("Consumer Non-Cyclicals");
    const withHistoricalDate = getIdxComparablesBySector("Consumer Non-Cyclicals", { valuationDate: "2021-12-31" });
    const suggestions = getSuggestedIdxComparables("Consumer Non-Cyclicals", 3, { valuationDate: "2021-12-31" });

    assert.equal(withHistoricalDate.length, withoutDate.length);
    assert.equal(suggestions.length, 3);
    assert.equal(suggestions.every((company) => company.betaLevered !== null && company.betaLevered > 0), true);
    assert.equal(suggestions.every((company) => company.marketCap !== null && company.marketCap > 0), true);
    assert.equal(suggestions.every((company) => company.debt !== null && company.debt >= 0), true);
  });
});
