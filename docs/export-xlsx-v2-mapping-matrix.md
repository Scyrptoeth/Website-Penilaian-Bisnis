# Export XLSX V2 Mapping Matrix

Scope: V2 is the primary XLSX export. It clones `public/templates/kkp-saham-final-account-category-review-update.xlsx`, patches selected input/anchor cells from active workbench state, preserves template formulas where practical, and appends `PVB_EXPORT_V2_AUDIT`.

`Data Awal` in the web workflow maps to the template `HOME` sheet because the reference workbook has no sheet named `Data Awal`.

Patch status:

- `mapped`: value written to a non-formula template cell.
- `formula-neutralized`: value written to a cell that previously contained a formula; the previous formula is recorded in the audit sheet.
- `formula-corrected`: formula intentionally replaced or added with a web-state cached value.
- `cached-formula`: formula preserved while cached value is refreshed from the web calculation engine.
- `deferred`: value is not patched because there is no safe template destination or source state is missing.

## Current Mapped Cells

| Area | Template cells | Source | Treatment |
| --- | --- | --- | --- |
| HOME / Data Awal | `HOME!B4:B7`, `B9:B12`, `B14:B16`, `B19`, `B22` | `caseProfile` | Mapped case identity, company type, ownership, transfer type, capital base, transaction year, valuation object. |
| Fixed Asset Schedule labels | `FIXED ASSET!B8:B13`, `B17:B22`, `B26:B31`, `B36:B41`, `B45:B50`, `B54:B59`, `B63:B68` for matched classes | `fixedAssetSchedule.rows` matched by asset class keyword | Mapped labels for land, building, equipment, vehicle, office inventory, electrical. |
| Fixed Asset Schedule values | `FIXED ASSET!C:E` on rows `8:13`, `17:22`, `36:41`, `45:50` | `fixedAssetSchedule.amounts` for year offsets `-2`, `-1`, `0` | Beginning values are patched only for `Tahun Y-2`; additions/depreciation additions are patched for `C:D:E`. |
| Balance Sheet | `BALANCE SHEET!C:E` rows `8:13`, `22:23`, `30:33`, `37:38`, `42:43`, `45` | Aggregated `mappedRows` by valuation category | Mapped values by period for cash, bank, receivable, inventory, other assets, liabilities, equity, retained earnings. |
| Income Statement | `INCOME STATEMENT!C:E` rows `6:7`, `12:13`, `26:27`, `30`, `33` | Aggregated `mappedRows` by valuation category | Mapped revenue, COGS, operating expenses, G&A, interest income/expense, non-operating income, corporate tax. |
| Key Drivers | `KEY DRIVERS!C11`, `D:J28`, `D:J29`, `D:J30` | `snapshot.taxRate`, AR/inventory/AP days | Mapped tax rate and working-capital driver rows. |
| Key Drivers revenue growth | `KEY DRIVERS!E:J15`, `E:J18` | `snapshot.revenueGrowth` | Revenue growth mapped to sales-volume increment; sales-price increment neutralized to `0` to avoid double count. |
| WACC inputs | `WACC!B4:B6`, `A:D11`, `A:D12`, `A:D13`, `B27:B29`, `E22` | `resolvedAssumptions`, `snapshot.wacc` | Mapped market assumptions, comparable inputs, bank loan rates, and active WACC. |
| DLOM | `DLOM!F7`, `F9`, `F11`, `F13`, `F15`, `F17`, `F19`, `F21`, `F23`, `F25`, `C30:C31` | `dlomCalculation`, `caseProfile` | Mapped questionnaire answers plus company/interest basis. |
| DLOC/PFC | `DLOC(PFC)!E7`, `E9`, `E11`, `E13`, `E15`, `B20:B21` | `dlocPfcCalculation`, `caseProfile` | Mapped questionnaire answers and ownership basis; `B20` is formula-corrected with `LOWER(HOME!B7)`. |
| Tax Simulation | `SIMULASI POTENSI PAJAK!C1`, optional `E14` | `taxSimulation` | Mapped primary method and reported transfer value when explicitly entered. |
| STAT assumptions | `STAT_ASSUMPTIONS!B5:B6`, `B8:B10` | `snapshot.taxRate`, `snapshot.wacc`, `snapshot.terminalGrowth`, `snapshot.revenueGrowth`, `snapshot.requiredReturnOnNta` | High-impact formula anchors for EEM/DCF are patched; `B6` points to `WACC!E22`. |
| AAM adjustments | `AAM!D9:D14`, `D20:D21`, `D23`, `D28:D31`, `D35:D36` | `aamAdjustmentModel` | Fair-value adjustments are mapped to the closest template adjustment rows. Related subcategories combine into template aggregate rows. |
| Formula cached outputs | `AAM!E53`, `EEM!D34`, `DCF!C33`, `STAT_EEM!B22`, `STAT_DCF!B39`, selected `SIMULASI POTENSI PAJAK!E` outputs | Web valuation and tax engines | Template formulas are preserved and cached values are refreshed so downloaded files are more useful before Excel recalculates. |

## Deferred Or Risky Fields

| Field | Reason | Current handling |
| --- | --- | --- |
| Fixed asset class outside template taxonomy | Template only has six recognizable rows. | Logged as unmapped in `PVB_EXPORT_V2_AUDIT`. |
| Direct fixed asset net value without schedule inputs | Template expects acquisition/depreciation roll-forward components. | Logged as deferred when schedule is empty but net fixed asset value exists. |
| Periods outside year offsets `-2`, `-1`, `0` | Historical template cells only support three historical periods. | Not patched. Forecast periods stay formula-driven in projection sheets. |
| Other payable days | `KEY DRIVERS` has AR, inventory, AP days but no dedicated other payable days row. | Logged as unmapped when non-zero. |
| Sales price growth | Web state has one revenue growth driver, while template splits sales volume and price. | Revenue growth is mapped once to volume; price increment is neutralized to zero. |
| WACC granular reconciliation to `DISCOUNT RATE` | Web WACC model and template `DISCOUNT RATE` have different structures and legacy formulas. | V2 patches `WACC` and `STAT_ASSUMPTIONS` anchors, but does not fully rebuild `DISCOUNT RATE`. |
| Full AAM row-level parity | Web AAM has a cleaner adjustment model than the workbook row structure. | Main adjustment rows are mapped; bridge rows remain deferred. |
| Full tax regime output | Template tax simulation is a compact value bridge, while web tax simulation includes Pasal 17/Badan tax regime rows. | Main template bridge cells are cached; detailed tax regime remains in web state and audit warnings. |
| Excel recalculation engine | Browser `xlsx` writes formulas but does not calculate them, and the generated file should not be assumed to preserve the template `calcPr`/`calcChain` metadata. | Formula cells are preserved and key cached values are refreshed; authoritative recalculation still requires opening the workbook in Excel or another spreadsheet engine. |
