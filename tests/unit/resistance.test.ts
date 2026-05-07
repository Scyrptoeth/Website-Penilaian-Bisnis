import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifyRangePositionStatus,
  classifyTaxpayerResistanceByRangePosition,
  combineTaxpayerResistanceByMatrix,
} from "../../src/lib/valuation/resistance";

describe("taxpayer resistance classification", () => {
  it("classifies range position with 32% and 64% thresholds", () => {
    assert.equal(classifyTaxpayerResistanceByRangePosition(0, 0, 1), "Tinggi");
    assert.equal(classifyRangePositionStatus(0.32, 0, 1), "Rendah");
    assert.equal(classifyTaxpayerResistanceByRangePosition(0.32, 0, 1), "Tinggi");

    assert.equal(classifyRangePositionStatus(0.33, 0, 1), "Moderat");
    assert.equal(classifyTaxpayerResistanceByRangePosition(0.33, 0, 1), "Moderat");
    assert.equal(classifyRangePositionStatus(0.3201, 0, 1), "Moderat");
    assert.equal(classifyTaxpayerResistanceByRangePosition(0.3201, 0, 1), "Moderat");

    assert.equal(classifyRangePositionStatus(0.64, 0, 1), "Moderat");
    assert.equal(classifyTaxpayerResistanceByRangePosition(0.64, 0, 1), "Moderat");

    assert.equal(classifyRangePositionStatus(0.65, 0, 1), "Tinggi");
    assert.equal(classifyTaxpayerResistanceByRangePosition(0.65, 0, 1), "Rendah");
    assert.equal(classifyRangePositionStatus(0.6401, 0, 1), "Tinggi");
    assert.equal(classifyTaxpayerResistanceByRangePosition(0.6401, 0, 1), "Rendah");
    assert.equal(classifyTaxpayerResistanceByRangePosition(1, 0, 1), "Rendah");
  });

  it("normalizes object rate inside the lower and upper range", () => {
    assert.equal(classifyTaxpayerResistanceByRangePosition(0.2, 0.3, 0.7), "Tinggi");
    assert.equal(classifyTaxpayerResistanceByRangePosition(0.39, 0.3, 0.5), "Moderat");
    assert.equal(classifyTaxpayerResistanceByRangePosition(0.42, 0.3, 0.7), "Tinggi");
    assert.equal(classifyTaxpayerResistanceByRangePosition(0.8, 0.3, 0.7), "Rendah");
    assert.equal(classifyTaxpayerResistanceByRangePosition(0.3, 0.3, 0.3), "Tinggi");
    assert.equal(classifyTaxpayerResistanceByRangePosition(0.31, 0.3, 0.3), "Rendah");
  });

  it("combines DLOM and DLOC/PFC resistance by the approved matrix", () => {
    assert.equal(combineTaxpayerResistanceByMatrix("Rendah", "Rendah"), "Rendah");
    assert.equal(combineTaxpayerResistanceByMatrix("Rendah", "Moderat"), "Rendah");
    assert.equal(combineTaxpayerResistanceByMatrix("Rendah", "Tinggi"), "Moderat");
    assert.equal(combineTaxpayerResistanceByMatrix("Moderat", "Rendah"), "Rendah");
    assert.equal(combineTaxpayerResistanceByMatrix("Moderat", "Moderat"), "Moderat");
    assert.equal(combineTaxpayerResistanceByMatrix("Moderat", "Tinggi"), "Tinggi");
    assert.equal(combineTaxpayerResistanceByMatrix("Tinggi", "Rendah"), "Moderat");
    assert.equal(combineTaxpayerResistanceByMatrix("Tinggi", "Moderat"), "Tinggi");
    assert.equal(combineTaxpayerResistanceByMatrix("Tinggi", "Tinggi"), "Tinggi");
    assert.equal(combineTaxpayerResistanceByMatrix("Belum lengkap", "Tinggi"), "Belum lengkap");
  });
});
