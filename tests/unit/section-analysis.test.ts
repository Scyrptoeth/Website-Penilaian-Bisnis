import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizedNoplat } from "../../src/lib/valuation/calculations";
import {
  buildSampleAssumptions,
  buildSamplePeriods,
  buildSampleRows,
  buildSnapshot,
  type AccountRow,
  type DebtScheduleInputState,
} from "../../src/lib/valuation/case-model";
import {
  buildAnalysisValueOverrideKey,
  buildCashFlowWorkingCapitalAccountCandidates,
  buildSectionAnalysis,
} from "../../src/lib/valuation/section-analysis";
import { assertAlmostEqual } from "./test-utils";

const periods = buildSamplePeriods();
const rows = buildSampleRows();
const assumptions = buildSampleAssumptions();
const analysis = buildSectionAnalysis(periods, rows, assumptions);
const snapshot = buildSnapshot(periods, "p2021", rows, assumptions);

describe("section analysis", () => {
  it("builds corrected NOPLAT rows from commercial EBIT and income statement corporate tax", () => {
    const taxOnEbit = analysis.noplatRows.find((row) => row.key === "tax-on-ebit");
    const noplat = analysis.noplatRows.find((row) => row.key === "noplat");

    assert.ok(taxOnEbit);
    assert.ok(noplat);
    assert.equal(taxOnEbit.label, "Pajak penghasilan badan");
    assert.equal(taxOnEbit.source, "Read only Laba Rugi");
    assertAlmostEqual(Number(taxOnEbit.values.p2021), Math.abs(snapshot.corporateTax), 0.01);
    assertAlmostEqual(Number(noplat.values.p2021), normalizedNoplat(snapshot), 0.01);
    assertAlmostEqual(Number(noplat.values.p2021), snapshot.ebit - Math.abs(snapshot.corporateTax), 0.01);
    assert.equal(analysis.noplatRows.find((row) => row.key === "tax-shields-excluded")?.values.p2021, 0);
  });

  it("builds FCF from NOPLAT, depreciation, operating WC movement, and capex", () => {
    const periodAnalysis = analysis.periodAnalyses.find((item) => item.period.id === "p2021");
    const fcf = analysis.fcfRows.find((row) => row.key === "fcf");

    assert.ok(periodAnalysis);
    assert.ok(fcf);
    assertAlmostEqual(Number(fcf.values.p2021), periodAnalysis.freeCashFlow, 0.01);
    assert.equal(fcf.values.p2019, null);
  });

  it("keeps payables and cash-flow movement formula-derived instead of workbook-ending-balance driven", () => {
    const accountPayable = analysis.payablesRows.find((row) => row.key === "account-payable");
    const shortTermDebtEnding = analysis.payablesRows.find((row) => row.key === "short-ending");
    const equityInjectionMovement = analysis.cashFlowRows.find((row) => row.key === "equity-injection");

    assert.ok(accountPayable);
    assert.ok(shortTermDebtEnding);
    assert.ok(equityInjectionMovement);
    assert.equal(accountPayable.values.p2021, 1_823_364_600);
    assert.equal(shortTermDebtEnding.values.p2021, 0);
    assert.equal(equityInjectionMovement.values.p2021, -3_150_000_000);
  });

  it("marks only workbook-designated debt schedule rows as editable and flows manual debt schedule into debt bridge", () => {
    const rowsWithDebt: AccountRow[] = [
      ...rows,
      {
        id: "short-debt",
        statement: "balance_sheet",
        accountName: "Bank Loan-Short Term",
        categoryOverride: "BANK_LOAN_SHORT_TERM",
        balanceSheetClassification: "",
        labelOverrides: [],
        values: { p2019: "100.000.000", p2020: "150.000.000", p2021: "200.000.000" },
      },
    ];
    const debtScheduleInputs: DebtScheduleInputState = {
      p2019: {
        shortTermLoanRate: "0,13",
        shortTermRepayment: "-10.000.000",
        longTermBeginning: "25.000.000",
        longTermAddition: "5.000.000",
        longTermRepayment: "-2.000.000",
      },
      p2020: {
        longTermAddition: "3.000.000",
      },
      p2021: {
        shortTermInterestPayable: "1.000.000",
        longTermInterestPayable: "2.000.000",
      },
    };
    const analysisWithSchedule = buildSectionAnalysis(periods, rowsWithDebt, assumptions, [], {}, debtScheduleInputs);
    const snapshotWithSchedule = buildSnapshot(periods, "p2021", rowsWithDebt, assumptions, [], { debtScheduleInputs });
    const shortRate = analysisWithSchedule.payablesRows.find((row) => row.key === "short-rate");
    const shortBeginning = analysisWithSchedule.payablesRows.find((row) => row.key === "short-beginning");
    const shortAddition = analysisWithSchedule.payablesRows.find((row) => row.key === "short-addition");
    const longBeginning = analysisWithSchedule.payablesRows.find((row) => row.key === "long-beginning");
    const shortEnding = analysisWithSchedule.payablesRows.find((row) => row.key === "short-ending");
    const longEnding = analysisWithSchedule.payablesRows.find((row) => row.key === "long-ending");
    const interestPayable = analysisWithSchedule.payablesRows.find((row) => row.key === "interest-payable");

    assert.equal(shortRate?.editableInputKey, "shortTermLoanRate");
    assert.equal(shortRate?.valueFormat, "percent");
    assert.equal(shortBeginning?.editableInputKey, undefined);
    assert.equal(shortBeginning?.sourceType, "formula");
    assert.equal(shortAddition?.editableInputKey, undefined);
    assert.equal(shortAddition?.sourceType, "interoperable");
    assert.deepEqual(longBeginning?.editablePeriodIds, ["p2019"]);
    assert.equal(shortEnding?.values.p2021, 190_000_000);
    assert.equal(longEnding?.values.p2021, 31_000_000);
    assert.equal(interestPayable?.values.p2021, 3_000_000);
    assert.equal(snapshotWithSchedule.bankLoanShortTerm, 190_000_000);
    assert.equal(snapshotWithSchedule.bankLoanLongTerm, 31_000_000);
    assert.equal(snapshotWithSchedule.interestPayable, 3_000_000);
  });

  it("builds detailed cash-flow statement rows with workbook trace metadata", () => {
    const cfo = analysis.cashFlowStatementRows.find((row) => row.key === "cfo");
    const equityInjection = analysis.cashFlowStatementRows.find((row) => row.key === "equity-injection");

    assert.ok(cfo);
    assert.ok(equityInjection);
    assert.equal(cfo.workbookReference, "CFS!11");
    assert.equal(equityInjection.isOverridable, true);
    assert.equal(equityInjection.workbookReference, "CFS!22; BALANCE SHEET!42,43");
    assert.equal(equityInjection.values.p2021, -3_150_000_000);
  });

  it("applies cash-flow comparative seeds only when prior-period data is missing", () => {
    const withOverride = buildSectionAnalysis(periods, rows, assumptions, [], {
      "oca-change": {
        p2019: { value: "100.000.000", reason: "", updatedAt: "2026-05-05T00:00:00.000Z" },
        p2021: { value: "250.000.000", reason: "", updatedAt: "2026-05-05T00:00:00.000Z" },
      },
      "ocl-change": {
        p2019: { value: "200.000.000", reason: "", updatedAt: "2026-05-05T00:00:00.000Z" },
      },
    });
    const oca = withOverride.cashFlowStatementRows.find((row) => row.key === "oca-change");
    const ocl = withOverride.cashFlowStatementRows.find((row) => row.key === "ocl-change");
    const workingCapitalEffect = withOverride.cashFlowStatementRows.find((row) => row.key === "working-capital-effect");

    assert.ok(oca);
    assert.ok(ocl);
    assert.ok(workingCapitalEffect);
    assert.equal(oca.overrideAllowedByPeriod.p2019, true);
    assert.equal(oca.overrideStatuses.p2019, "applied");
    assert.equal(oca.values.p2019, 100_000_000);
    assert.equal(ocl.values.p2019, 200_000_000);
    assert.equal(workingCapitalEffect.values.p2019, 300_000_000);
    assert.equal(oca.overrideAllowedByPeriod.p2021, false);
    assert.equal(oca.overrideStatuses.p2021, "not_allowed");
    assert.notEqual(oca.values.p2021, 250_000_000);
  });

  it("flows comparative Cash Flow Statement working-capital seeds into FCF", () => {
    const withOverride = buildSectionAnalysis(periods, rows, assumptions, [], {
      "oca-change": {
        p2019: { value: "-250.000.000", reason: "", updatedAt: "2026-05-21T00:00:00.000Z" },
      },
    });
    const fcfOca = withOverride.fcfRows.find((row) => row.key === "oca-change");
    const fcfOcl = withOverride.fcfRows.find((row) => row.key === "ocl-change");
    const fcfGrossCashFlow = withOverride.fcfRows.find((row) => row.key === "gross-cash-flow");
    const fcfGrossInvestment = withOverride.fcfRows.find((row) => row.key === "gross-investment");
    const fcf = withOverride.fcfRows.find((row) => row.key === "fcf");
    const capex = withOverride.fcfRows.find((row) => row.key === "capex");

    assert.ok(fcfOca);
    assert.ok(fcfOcl);
    assert.ok(fcfGrossCashFlow);
    assert.ok(fcfGrossInvestment);
    assert.ok(fcf);
    assert.ok(capex);
    assert.equal(fcfOca.sourceType, "manual");
    assert.equal(fcfOca.values.p2019, -250_000_000);
    assert.equal(fcfOca.values.p2021, withOverride.cashFlowStatementRows.find((row) => row.key === "oca-change")?.calculatedValues.p2021);
    assertAlmostEqual(
      Number(fcfGrossInvestment.values.p2021),
      Number(fcfOca.values.p2021) + Number(fcfOcl.values.p2021) + Number(capex.values.p2021),
      0.01,
    );
    assertAlmostEqual(
      Number(fcf.values.p2021),
      Number(fcfGrossCashFlow.values.p2021) + Number(fcfGrossInvestment.values.p2021),
      0.01,
    );
  });

  it("recomputes cash-flow working-capital rows from selected balance-sheet accounts", () => {
    const withCashAndTax = buildSectionAnalysis(periods, rows, assumptions, [], {}, {}, {
      "oca-change": {
        "sample-cash-hand": true,
        "sample-cash-bank": true,
      },
      "ocl-change": {
        "sample-tax": true,
      },
    });
    const candidates = buildCashFlowWorkingCapitalAccountCandidates(rows, {
      "oca-change": {
        "sample-cash-hand": true,
        "sample-cash-bank": true,
      },
      "ocl-change": {
        "sample-tax": true,
      },
    });
    const baseOca = Number(analysis.cashFlowStatementRows.find((row) => row.key === "oca-change")?.values.p2021);
    const baseOcl = Number(analysis.cashFlowStatementRows.find((row) => row.key === "ocl-change")?.values.p2021);
    const oca = withCashAndTax.cashFlowStatementRows.find((row) => row.key === "oca-change");
    const ocl = withCashAndTax.cashFlowStatementRows.find((row) => row.key === "ocl-change");
    const cfo = withCashAndTax.cashFlowStatementRows.find((row) => row.key === "cfo");
    const expectedCashEffect =
      -(
        snapshot.cashOnHand +
        snapshot.cashOnBankDeposit -
        (buildSnapshot(periods, "p2020", rows, assumptions).cashOnHand + buildSnapshot(periods, "p2020", rows, assumptions).cashOnBankDeposit)
      );
    const expectedTaxPayableEffect = snapshot.taxPayable - buildSnapshot(periods, "p2020", rows, assumptions).taxPayable;

    assert.ok(oca);
    assert.ok(ocl);
    assert.ok(cfo);
    assert.equal(candidates["oca-change"].find((candidate) => candidate.rowId === "sample-cash-hand")?.included, true);
    assert.equal(candidates["ocl-change"].find((candidate) => candidate.rowId === "sample-tax")?.included, true);
    assertAlmostEqual(Number(oca.values.p2021), baseOca + expectedCashEffect, 0.01);
    assertAlmostEqual(Number(ocl.values.p2021), baseOcl + expectedTaxPayableEffect, 0.01);
    assertAlmostEqual(
      Number(cfo.values.p2021),
      Number(withCashAndTax.cashFlowStatementRows.find((row) => row.key === "ebitda")?.values.p2021) +
        Number(withCashAndTax.cashFlowStatementRows.find((row) => row.key === "operating-tax")?.values.p2021) +
        Number(oca.values.p2021) +
        Number(ocl.values.p2021),
      0.01,
    );
  });

  it("computes ROIC from NOPLAT over beginning corrected invested capital", () => {
    const roic = analysis.roicRows.find((row) => row.key === "roic");
    const periodAnalysis = analysis.periodAnalyses.find((item) => item.period.id === "p2021");

    assert.ok(roic);
    assert.ok(periodAnalysis);
    assert.equal(roic.values.p2019, null);
    assertAlmostEqual(Number(roic.values.p2021), periodAnalysis.roic ?? 0, 1e-12);
  });

  it("applies comparative overrides only to Financial Ratio and ROIC cells missing prior-period data", () => {
    const withOverrides = buildSectionAnalysis(periods, rows, assumptions, [], {}, {}, {}, {
      [buildAnalysisValueOverrideKey("ratio", "ocf-sales")]: {
        p2019: { value: "12,5", reason: "", updatedAt: "2026-05-22T00:00:00.000Z" },
        p2021: { value: "99", reason: "", updatedAt: "2026-05-22T00:00:00.000Z" },
      },
      [buildAnalysisValueOverrideKey("roic", "invested-capital-beginning")]: {
        p2019: { value: "10.000.000.000", reason: "", updatedAt: "2026-05-22T00:00:00.000Z" },
      },
    });
    const ocfSales = withOverrides.ratioRows.find((row) => row.key === "ocf-sales");
    const investedBeginning = withOverrides.roicRows.find((row) => row.key === "invested-capital-beginning");
    const roic = withOverrides.roicRows.find((row) => row.key === "roic");
    const p2019Noplat = withOverrides.periodAnalyses.find((item) => item.period.id === "p2019")?.normalizedNoplat ?? 0;

    assert.ok(ocfSales);
    assert.ok(investedBeginning);
    assert.ok(roic);
    assert.equal(ocfSales.overrideAllowedByPeriod?.p2019, true);
    assert.equal(ocfSales.overrideStatuses?.p2019, "applied");
    assert.equal(ocfSales.values.p2019, 0.125);
    assert.equal(ocfSales.overrideAllowedByPeriod?.p2021, false);
    assert.notEqual(ocfSales.values.p2021, 0.99);
    assert.equal(investedBeginning.values.p2019, 10_000_000_000);
    assertAlmostEqual(Number(roic.values.p2019), p2019Noplat / 10_000_000_000, 1e-12);
  });

  it("adds workbook-referenced cash flow indicator ratios with formula trace", () => {
    const rowsWithShortTermDebt: AccountRow[] = [
      ...rows,
      {
        id: "sample-short-term-bank-loan",
        statement: "balance_sheet",
        accountName: "Bank Loan-Short Term",
        categoryOverride: "BANK_LOAN_SHORT_TERM",
        balanceSheetClassification: "",
        labelOverrides: [],
        values: { p2019: "500.000.000", p2020: "750.000.000", p2021: "1.000.000.000" },
      },
      {
        id: "sample-capex-coverage-denominator",
        statement: "fixed_asset",
        accountName: "Test capex denominator",
        categoryOverride: "FIXED_ASSET",
        balanceSheetClassification: "",
        labelOverrides: [],
        values: { p2019: "0", p2020: "0", p2021: "250.000.000" },
      },
    ];
    const analysisWithDebt = buildSectionAnalysis(periods, rowsWithShortTermDebt, assumptions);
    const periodAnalysis = analysisWithDebt.periodAnalyses.find((item) => item.period.id === "p2021");
    const fcfOperatingCash = analysisWithDebt.ratioRows.find((row) => row.key === "fcf-ocf");
    const shortTermDebtCoverage = analysisWithDebt.ratioRows.find((row) => row.key === "short-term-debt-coverage");
    const capexCoverage = analysisWithDebt.ratioRows.find((row) => row.key === "capex-coverage");

    assert.ok(periodAnalysis);
    assert.ok(fcfOperatingCash);
    assert.ok(shortTermDebtCoverage);
    assert.ok(capexCoverage);
    assert.equal(fcfOperatingCash.formula, "FCF / operating cash flow");
    assert.equal(shortTermDebtCoverage.formula, "Operating cash flow / bank loan short term");
    assert.equal(capexCoverage.formula, "Operating cash flow / capex");
    assertAlmostEqual(Number(fcfOperatingCash.values.p2021), periodAnalysis.freeCashFlow / periodAnalysis.cashFlowFromOperations, 1e-12);
    assertAlmostEqual(Number(shortTermDebtCoverage.values.p2021), periodAnalysis.cashFlowFromOperations / periodAnalysis.snapshot.bankLoanShortTerm, 1e-12);
    assertAlmostEqual(Number(capexCoverage.values.p2021), periodAnalysis.cashFlowFromOperations / periodAnalysis.capitalExpenditure, 1e-12);
  });
});
