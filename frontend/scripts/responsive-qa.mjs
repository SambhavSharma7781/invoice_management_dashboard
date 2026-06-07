/**
 * Responsive QA script — run with:
 * npx playwright install chromium && node scripts/responsive-qa.mjs
 *
 * Requires frontend dev server at http://localhost:5173
 * and backend at http://localhost:4000 for full page loads.
 */

import { chromium } from "playwright";

const WIDTHS = [320, 375, 390, 414, 768, 1024];
const BASE_URL = process.env.APP_URL || "http://localhost:5173";

const issues = [];
const tested = [];

function recordIssue(screen, detail) {
  issues.push({ screen, detail });
}

async function assertNoPageOverflow(page, label) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));

  if (metrics.scrollWidth > metrics.clientWidth + 1) {
    recordIssue(
      label,
      `Horizontal page overflow: scrollWidth=${metrics.scrollWidth}, clientWidth=${metrics.clientWidth}`
    );
  }
}

async function assertElementInViewport(page, selector, label) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) {
    recordIssue(label, `Element not found: ${selector}`);
    return;
  }

  const viewport = page.viewportSize();
  if (
    box.x < -1 ||
    box.y < -1 ||
    box.x + box.width > viewport.width + 1
  ) {
    recordIssue(
      label,
      `Element outside viewport: ${selector} (x=${box.x}, w=${box.width}, vw=${viewport.width})`
    );
  }
}

async function testDashboard(page, width) {
  const label = `Dashboard @ ${width}px`;
  tested.push(label);
  await page.setViewportSize({ width, height: 800 });
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await assertNoPageOverflow(page, label);

  for (const panel of ["Status", "Tax rate", "Date"]) {
    await page.getByRole("button", { name: panel, exact: true }).click();
    await page.waitForTimeout(250);

    const popover = page.locator("[data-floating-panel]").last();
    if (await popover.count()) {
      const box = await popover.boundingBox();
      const viewport = page.viewportSize();
      if (
        box &&
        (box.x < -1 ||
          box.y < -1 ||
          box.x + box.width > viewport.width + 1 ||
          box.y + box.height > viewport.height + 1)
      ) {
        recordIssue(label, `${panel} popover overflows viewport`);
      }
    }

    await assertNoPageOverflow(page, `${label} (${panel} open)`);

    const doneButton = page.getByRole("button", { name: "Done" });
    if (await doneButton.isVisible()) {
      await doneButton.click();
    } else {
      await page.keyboard.press("Escape");
    }

    await page.waitForTimeout(100);
  }

  const tableScroll = page.locator(".overflow-x-auto");
  if (await tableScroll.count()) {
    const scrollTarget = tableScroll.first();
    await scrollTarget.evaluate((el) => {
      el.scrollLeft = el.scrollWidth;
    });
    await page.waitForTimeout(100);

    const editBox = await page.getByRole("button", { name: "Edit" }).first().boundingBox();
    const containerBox = await scrollTarget.boundingBox();

    if (
      editBox &&
      containerBox &&
      (editBox.x + editBox.width > containerBox.x + containerBox.width + 1 ||
        editBox.x < containerBox.x - 1)
    ) {
      recordIssue(
        label,
        "Edit action not reachable after horizontal table scroll"
      );
    }
  }
}

async function testModal(page, width) {
  const label = `Create Invoice Modal @ ${width}px`;
  tested.push(label);
  await page.setViewportSize({ width, height: 700 });
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "New invoice" }).click();
  await page.waitForTimeout(300);

  await assertNoPageOverflow(page, label);
  await assertElementInViewport(page, "#dialog-title", label);
  await assertElementInViewport(page, 'button:has-text("Save invoice")', label);
  await assertElementInViewport(page, 'button:has-text("Cancel")', label);

  const dialog = page.locator('[role="dialog"]');
  const dialogBox = await dialog.boundingBox();
  const viewport = page.viewportSize();
  if (
    dialogBox &&
    (dialogBox.x < -1 ||
      dialogBox.y < -1 ||
      dialogBox.x + dialogBox.width > viewport.width + 1 ||
      dialogBox.y + dialogBox.height > viewport.height + 1)
  ) {
    recordIssue(label, "Modal dialog overflows viewport");
  }

  await page.keyboard.press("Escape");
}

async function testSummary(page, width) {
  const label = `Summary @ ${width}px`;
  tested.push(label);
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${BASE_URL}/summary`, { waitUntil: "networkidle" });
  await assertNoPageOverflow(page, label);
}

async function testCustomer(page, width) {
  const label = `Customer Profile @ ${width}px`;
  tested.push(label);
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

  const profileLink = page.getByRole("link", { name: "Profile" }).first();
  if (!(await profileLink.count())) {
    recordIssue(label, "No Profile link available to test customer page");
    return;
  }

  await profileLink.click();
  await page.waitForURL(/\/customers\//);
  await assertNoPageOverflow(page, label);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    for (const width of WIDTHS) {
      await testDashboard(page, width);
      await testModal(page, width);
      await testSummary(page, width);
      if (width <= 768) {
        await testCustomer(page, width);
      }
    }
  } catch (error) {
    recordIssue("Runner", error.message);
  } finally {
    await browser.close();
  }

  console.log("\n=== RESPONSIVE QA REPORT ===\n");
  console.log("Screens tested:");
  tested.forEach((item) => console.log(`  - ${item}`));

  if (issues.length === 0) {
    console.log("\nNo issues found.\n");
    process.exit(0);
  }

  console.log(`\nIssues found (${issues.length}):`);
  issues.forEach(({ screen, detail }) => {
    console.log(`  [${screen}] ${detail}`);
  });
  process.exit(1);
}

main();
