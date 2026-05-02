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
    inventoryCapacityProxy: 0,
    fixedAssetCapacityProxy: 0.7,
  },
} as const;
