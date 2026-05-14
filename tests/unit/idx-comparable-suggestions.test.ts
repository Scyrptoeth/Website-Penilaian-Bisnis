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
    assert.match(idxComparableDatasetMetadata.coverageNote, /2020-2025 belum tersedia/);
    assert.deepEqual(
      idxComparableDatasetSnapshots.map((snapshot) => snapshot.metadata.id),
      ["idx-yahoo-peer-snapshot-2026-05-01"],
    );
  });

  it("warns when a valuation date predates the IDX peer snapshot", () => {
    const status = getIdxComparableDatasetUseStatus("2023-12-31");
    const resolution = getIdxComparableDatasetResolution("2023-12-31");

    assert.equal(resolution.resolutionKind, "look-ahead-fallback");
    assert.equal(resolution.snapshot.metadata.asOfDate, "2026-05-01");
    assert.equal(status.level, "warning");
    assert.equal(status.label, "Potensi look-ahead bias");
    assert.match(status.message, /31 Des 2023/);
    assert.match(status.message, /1 Mei 2026/);
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
    assert.equal(suggestions.every((company) => company.quality === "Data Pembanding Bersifat Moderat"), true);
  });
});
