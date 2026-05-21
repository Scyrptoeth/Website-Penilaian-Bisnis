export const valuationDriverGovernancePolicy = {
  wacc: {
    minimumReviewableRate: 0.08,
    lowBetaThreshold: 0.5,
    smartSuggestionBetaFloor: 1,
  },
  terminalGrowth: {
    minimumCapitalizationSpread: 0.075,
  },
  revenueGrowth: {
    highAutoGrowthThreshold: 0.2,
    extremeOverrideGrowthThreshold: 0.3,
  },
  dcf: {
    highTerminalValueWeightThreshold: 0.8,
  },
  requiredReturnOnNta: {
    receivablesCapacityProxy: 1,
    inventoryCapacityProxy: 1,
    fixedAssetCapacityProxy: 0.7,
    fixedAssetCapacityReference:
      "POJK No. 40/POJK.03/2019 Article 48 allows up to 70% collateral recognition for non-residential land/buildings, machinery attached to land, vehicles, inventories, and warehouse receipts when appraisal-age conditions are met; use as a reviewable proxy, not a case-specific lender covenant.",
  },
} as const;
