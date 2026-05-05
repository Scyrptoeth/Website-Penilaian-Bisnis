import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getKluSectorRecord, normalizeKluCode, searchKluSectorRecords } from "../../src/lib/valuation/klu-sector";

describe("KLU sector mapping", () => {
  it("normalizes numeric user input and resolves the sector from the KBLI mapping", () => {
    assert.equal(normalizeKluCode("46.100 abc"), "46100");

    const record = getKluSectorRecord("46100");

    assert.equal(record?.title, "PERDAGANGAN BESAR ATAS DASAR BALAS JASA (FEE) ATAU KONTRAK");
    assert.equal(record?.sector, "Industrials");
    assert.equal(record?.confidence, "Low");
  });

  it("prioritizes exact and prefix code suggestions over broad title matches", () => {
    const suggestions = searchKluSectorRecords("451", 3);

    assert.deepEqual(
      suggestions.map((record) => record.code),
      ["45101", "45102", "45103"],
    );
    assert.equal(suggestions[0].sector, "Consumer Cyclicals");
  });
});
