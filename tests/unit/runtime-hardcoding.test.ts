import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { valuationDriverGovernancePolicy } from "../../src/lib/valuation/valuation-driver-governance-policy";

describe("runtime hardcoding guard", () => {
  it("keeps workbook audit targets and local source paths out of production source", () => {
    const runtimeSource = collectRuntimeSource(path.join(process.cwd(), "src"));
    const forbiddenFragments = [
      "KKP Saham Baru Edit",
      "/Users/persiapantubel/Desktop/codex/penilaian-bisnis",
      "13_701_055_249",
      "19_886_438_291",
      "34_009_467_930",
      "35_961_239_620",
      "136_826_441_989",
      "workbookAuditFixture",
      "DISCOUNT RATE!",
      "WACC!",
      "STAT_ASSUMPTIONS",
    ];

    for (const fragment of forbiddenFragments) {
      assert.equal(runtimeSource.includes(fragment), false, `Production source must not include ${fragment}`);
    }
  });

  it("centralizes case-neutral smart-driver governance policy", () => {
    assert.equal(valuationDriverGovernancePolicy.wacc.minimumReviewableRate, 0.08);
    assert.equal(valuationDriverGovernancePolicy.revenueGrowth.highAutoGrowthThreshold, 0.2);
    assert.equal(valuationDriverGovernancePolicy.requiredReturnOnNta.fixedAssetCapacityProxy, 0.7);
  });
});

function collectRuntimeSource(directory: string): string {
  return readdirSync(directory)
    .flatMap((entry) => {
      const fullPath = path.join(directory, entry);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        return collectRuntimeSource(fullPath);
      }

      if (!/\.(ts|tsx|json)$/.test(entry)) {
        return "";
      }

      return readFileSync(fullPath, "utf8");
    })
    .join("\n");
}
