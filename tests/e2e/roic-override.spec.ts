import { expect, test, type Page } from "@playwright/test";

async function loadSampleWorkbook(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() =>
        Boolean((window as Window & { __PVB_TEST_HOOKS__?: { loadSampleWorkbook: () => void } }).__PVB_TEST_HOOKS__?.loadSampleWorkbook),
      ),
    )
    .toBe(true);
  await page.evaluate(() =>
    (window as Window & { __PVB_TEST_HOOKS__?: { loadSampleWorkbook: () => void } }).__PVB_TEST_HOOKS__?.loadSampleWorkbook(),
  );
}

function workflowNav(page: Page) {
  return page.getByRole("navigation", { name: "Bagian model" });
}

async function openWorkflowTab(page: Page, name: string) {
  await workflowNav(page).getByRole("button", { name, exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("valuation-workbench")).toBeVisible();
});

test("ROIC comparative override inputs keep typed values immediately", async ({ page }) => {
  await loadSampleWorkbook(page);
  await openWorkflowTab(page, "ROIC");
  await expect(page.getByText("Bridge efisiensi modal")).toBeVisible();

  const roicPanel = page.locator(".roic-table-panel");
  const roicRow = roicPanel.locator("tbody tr").filter({ hasText: "ROIC" }).first();
  const roicOverride = roicRow.getByRole("textbox", { name: "Override ROIC 2019" });
  await expect(roicOverride).toBeVisible();
  await roicOverride.fill("4,5");
  await expect(roicOverride).toHaveValue("4,5");

  const investedCapitalBeginningRow = roicPanel.locator("tbody tr").filter({ hasText: "Invested capital awal tahun" }).first();
  const investedCapitalBeginningOverride = investedCapitalBeginningRow.getByRole("textbox", {
    name: "Override Invested capital awal tahun 2019",
  });
  await expect(investedCapitalBeginningOverride).toBeVisible();
  await investedCapitalBeginningOverride.fill("10000000000");
  await expect(investedCapitalBeginningOverride).toHaveValue("10.000.000.000");
});
