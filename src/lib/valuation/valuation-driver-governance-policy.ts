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
      "PBI 14/15/PBI/2012 Article 46 allows up to 70% collateral recognition for recently appraised non-residential land/buildings, machinery unified with land, inventories, ships, aircraft, and warehouse receipts; use as a reviewable proxy, not a case-specific lender covenant.",
  },
} as const;
