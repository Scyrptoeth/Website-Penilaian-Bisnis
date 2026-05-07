import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPdfExportFilename } from "../../src/lib/valuation/pdf-export";

describe("PDF export filenames", () => {
  it("builds method-scoped filenames from taxpayer, scope, and browser-local date", () => {
    const localDate = new Date(2026, 4, 7, 23, 30, 0);

    assert.equal(
      buildPdfExportFilename("Makmur Jaya Sejati Raya", "aam", localDate),
      "penilaian-bisnis-makmur-jaya-sejati-raya-aam-2026-05-07.pdf",
    );
    assert.equal(
      buildPdfExportFilename("Makmur Jaya Sejati Raya", "eem", localDate),
      "penilaian-bisnis-makmur-jaya-sejati-raya-eem-2026-05-07.pdf",
    );
    assert.equal(
      buildPdfExportFilename("Makmur Jaya Sejati Raya", "dcf", localDate),
      "penilaian-bisnis-makmur-jaya-sejati-raya-dcf-2026-05-07.pdf",
    );
  });

  it("uses the combined scope slug for all-method reports", () => {
    assert.equal(
      buildPdfExportFilename("Makmur Jaya Sejati Raya", "all", new Date(2026, 4, 7)),
      "penilaian-bisnis-makmur-jaya-sejati-raya-aam-eem-dcf-2026-05-07.pdf",
    );
  });
});
