import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findIdxComparableByLabel,
  formatIdxComparableLabel,
  getIdxComparablesBySector,
  getIdxComparableDatasetUseStatus,
  getSuggestedIdxComparables,
  idxComparableDatasetMetadata,
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
  });

  it("warns when a valuation date predates the IDX peer snapshot", () => {
    const status = getIdxComparableDatasetUseStatus("2023-12-31");

    assert.equal(status.level, "warning");
    assert.equal(status.label, "Potensi look-ahead bias");
    assert.match(status.message, /31 Des 2023/);
    assert.match(status.message, /1 Mei 2026/);
  });

  it("keeps missing valuation dates informational instead of blocking peer review", () => {
    const status = getIdxComparableDatasetUseStatus("");

    assert.equal(status.level, "info");
    assert.match(status.message, /Isi tanggal penilaian/);
  });
});
