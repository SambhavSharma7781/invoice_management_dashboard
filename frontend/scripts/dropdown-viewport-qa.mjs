/**
 * Dropdown viewport QA — run with:
 * npx playwright install chromium && node scripts/dropdown-viewport-qa.mjs
 *
 * Requires frontend dev server at http://localhost:5173
 */

import { chromium } from "playwright";

const WIDTHS = [320, 375, 390, 768, 1024, 1440];
const BASE_URL = process.env.APP_URL || "http://localhost:5173";

const issues = [];
const tested = [];

function recordIssue(screen, detail) {
  issues.push({ screen, detail });
}

function assertInViewport(box, viewport, label, detail) {
  if (!box) {
    recordIssue(label, `${detail}: element not found`);
    return;
  }

  const overflows =
    box.x < -1 ||
    box.y < -1 ||
    box.x + box.width > viewport.width + 1 ||
    box.y + box.height > viewport.height + 1;

  if (overflows) {
    recordIssue(
      label,
      `${detail} outside viewport (x=${Math.round(box.x)}, y=${Math.round(box.y)}, w=${Math.round(box.width)}, h=${Math.round(box.height)}, vw=${viewport.width}, vh=${viewport.height})`
    );
  }
}

async function assertFloatingPanel(page, label, detail) {
  const panel = page.locator("[data-floating-panel]").last();
  await panel.waitFor({ state: "visible", timeout: 3000 });
  const box = await panel.boundingBox();
  assertInViewport(box, page.viewportSize(), label, detail);

  const position = await panel.evaluate((el) => window.getComputedStyle(el).position);
  if (position === "fixed") {
    recordIssue(label, `${detail}: uses fixed positioning (must be anchored)`);
  }
}

async function assertViewportDropdown(page, label, detail) {
  const menu = page.locator("[data-viewport-dropdown]").last();
  await menu.waitFor({ state: "visible", timeout: 3000 });
  const box = await menu.boundingBox();
  assertInViewport(box, page.viewportSize(), label, detail);

  const position = await menu.evaluate((el) => window.getComputedStyle(el).position);
  if (position === "fixed") {
    recordIssue(label, `${detail}: uses fixed positioning (must be anchored)`);
  }

  const scrollable = menu.locator("div").first();
  const overflowY = await scrollable.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return style.overflowY;
  });

  if (overflowY !== "auto" && overflowY !== "scroll") {
    recordIssue(label, `${detail}: menu is not vertically scrollable`);
  }
}

async function closeFloatingPanel(page) {
  const doneButton = page.getByRole("button", { name: "Done" });
  if (await doneButton.isVisible()) {
    await doneButton.click();
    return;
  }

  await page.keyboard.press("Escape");
}

async function testDashboardFilters(page, width) {
  const label = `Dashboard filters @ ${width}px`;
  await page.setViewportSize({ width, height: 800 });
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

  for (const panel of [
    { name: "Status", detail: "Status filter panel" },
    { name: "Tax rate", detail: "Tax rate filter panel" },
    { name: "Date", detail: "Date filter panel" },
  ]) {
    tested.push(`${label} — ${panel.detail}`);
    await closeFloatingPanel(page);
    await page.getByRole("button", { name: panel.name, exact: true }).click();
    await page.waitForTimeout(250);
    await assertFloatingPanel(page, label, panel.detail);
    await closeFloatingPanel(page);
    await page.waitForTimeout(100);
  }
}

async function testModalDropdowns(page, width) {
  const label = `Modal dropdowns @ ${width}px`;
  const height = width <= 390 ? 700 : 800;
  await page.setViewportSize({ width, height });
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "New invoice" }).click();
  await page.waitForTimeout(300);

  const triggers = page.locator("[data-viewport-select-trigger]");
  const count = await triggers.count();

  if (count === 0 && width >= 640) {
    recordIssue(label, "No viewport select triggers found on desktop modal");
  }

  for (let index = 0; index < count; index += 1) {
    const trigger = triggers.nth(index);
    const triggerBox = await trigger.boundingBox();
    tested.push(`${label} — select #${index + 1}`);

    await trigger.click();
    await page.waitForTimeout(250);
    await assertViewportDropdown(page, label, `Modal select #${index + 1}`);

    if (triggerBox) {
      await page.mouse.click(triggerBox.x + 10, triggerBox.y - 40);
    } else {
      await page.keyboard.press("Escape");
    }

    await page.waitForTimeout(100);
  }

  await page.keyboard.press("Escape");
}

async function testScrollAnchoring(page, width) {
  if (width < 768) {
    return;
  }

  const label = `Scroll anchoring @ ${width}px`;
  tested.push(label);

  await page.setViewportSize({ width, height: 600 });
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.minHeight = "1800px";
  });

  const statusButton = page.getByRole("button", { name: "Status", exact: true });
  await statusButton.click();
  await page.waitForTimeout(200);

  const panel = page.locator("[data-floating-panel]").last();
  await panel.waitFor({ state: "visible", timeout: 3000 });

  await page.evaluate(() => window.scrollBy(0, 240));
  await page.waitForTimeout(200);

  if (width < 640) {
    if (await panel.isVisible()) {
      recordIssue(
        label,
        "Mobile filter panel stayed open after page scroll (must close)"
      );
    }
  } else if (await panel.isVisible()) {
    const triggerBoxAfter = await statusButton.boundingBox();
    const panelBoxAfter = await panel.boundingBox();

    if (
      triggerBoxAfter &&
      panelBoxAfter &&
      panelBoxAfter.y < triggerBoxAfter.y + triggerBoxAfter.height - 4
    ) {
      recordIssue(label, "Desktop filter panel detached from trigger after scroll");
    }
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "New invoice" }).click();
  await page.waitForTimeout(300);

  const trigger = page.locator("[data-viewport-select-trigger]").first();
  if (await trigger.count()) {
    await trigger.click();
    await page.waitForTimeout(200);

    const menu = page.locator("[data-viewport-dropdown]").last();
    await menu.waitFor({ state: "visible", timeout: 3000 });

    const dialog = page.locator('[role="dialog"] [class*="overflow-y-auto"]').first();
    if (await dialog.count()) {
      await dialog.evaluate((el) => {
        el.scrollTop = 120;
      });
      await page.waitForTimeout(200);
    }

    if (await menu.isVisible()) {
      recordIssue(
        label,
        "Modal select menu stayed open after dialog scroll (must close automatically)"
      );
    }
  }

  await page.keyboard.press("Escape");
}

async function testSummary(page, width) {
  const label = `Summary @ ${width}px`;
  tested.push(label);
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${BASE_URL}/summary`, { waitUntil: "networkidle" });
}

async function testCustomerProfile(page, width) {
  const label = `Customer Profile @ ${width}px`;
  tested.push(label);
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

  const profileLink = page.getByRole("link", { name: "Profile" }).first();
  if (!(await profileLink.count())) {
    recordIssue(label, "No Profile link available");
    return;
  }

  await profileLink.click();
  await page.waitForURL(/\/customers\//);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    for (const width of WIDTHS) {
      await testDashboardFilters(page, width);
      await testModalDropdowns(page, width);
      await testScrollAnchoring(page, width);
      await testSummary(page, width);
      if (width <= 768) {
        await testCustomerProfile(page, width);
      }
    }
  } catch (error) {
    recordIssue("Runner", error.message);
  } finally {
    await browser.close();
  }

  console.log("\n=== DROPDOWN VIEWPORT QA REPORT ===\n");
  console.log("Checks run:");
  tested.forEach((item) => console.log(`  - ${item}`));

  if (issues.length === 0) {
    console.log("\nAll dropdowns fully visible in viewport.\n");
    process.exit(0);
  }

  console.log(`\nIssues found (${issues.length}):`);
  issues.forEach(({ screen, detail }) => {
    console.log(`  [${screen}] ${detail}`);
  });
  process.exit(1);
}

main();
