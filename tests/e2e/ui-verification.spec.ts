import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

test.describe("Phase 6: Mobile-First Arabic (RTL) & English (LTR) UI Verification", () => {
  const screenshotsDir = path.join(process.cwd(), "test-results", "screenshots");

  test.beforeAll(() => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test("verifies Landing Page RTL layout, hero slider, and language toggle", async ({ page }) => {
    await page.goto("/");

    // Verify Arabic default
    const htmlDir = await page.locator("div[dir]").first().getAttribute("dir");
    expect(htmlDir).toBe("rtl");

    // Verify Brand Name and UAE Souk references
    await expect(page.locator("h1")).toContainText("صورة واحدة بالهاتف");

    // Verify Before/After slider is mounted and has interactive handle
    const slider = page.locator(".cursor-ew-resize").first();
    await expect(slider).toBeVisible();

    // Take Arabic RTL Landing Page Screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, `landing-arabic-rtl-${page.viewportSize()?.width || "desktop"}.png`),
      fullPage: false,
    });

    // Toggle to English
    const langBtn = page.getByRole("button", { name: /English/i });
    if (await langBtn.isVisible()) {
      await langBtn.click();
      const updatedDir = await page.locator("div[dir]").first().getAttribute("dir");
      expect(updatedDir).toBe("ltr");
      await expect(page.locator("h1")).toContainText("One phone photo in");

      // Take English LTR Screenshot
      await page.screenshot({
        path: path.join(screenshotsDir, `landing-english-ltr-${page.viewportSize()?.width || "desktop"}.png`),
        fullPage: false,
      });
    }
  });

  test("verifies Studio Generator options (Piece Type, Karat, Style Packs, Spec Badge)", async ({ page }) => {
    await page.goto("/studio");

    // Verify Title
    await expect(page.locator("h1")).toContainText("استوديو المجوهرات الذكي");

    // Verify Piece types
    await expect(page.getByRole("button", { name: "عقد / قلادة" })).toBeVisible();
    await expect(page.getByRole("button", { name: "خاتم / دبلة" })).toBeVisible();

    // Verify 21K & 22K Karat buttons
    await expect(page.getByRole("button", { name: /ذهب عيار 22 خليجي/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /ذهب عيار 21 خليجي/ })).toBeVisible();

    // Verify Style Packs
    await expect(page.getByText("كلاسيك الذهب الخليجي")).toBeVisible();
    await expect(page.getByText("أطقم العرائس الملكية")).toBeVisible();

    // Verify Spec badge inputs
    const specCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(specCheckbox).toBeChecked();

    // Screenshot Studio
    await page.screenshot({
      path: path.join(screenshotsDir, `studio-${page.viewportSize()?.width || "desktop"}.png`),
      fullPage: false,
    });
  });

  test("verifies Catalog Gallery and 200% Zoom Compare Modal", async ({ page }) => {
    await page.goto("/catalog");

    await expect(page.locator("h1")).toContainText("كتالوج المجوهرات الخاص بك");

    // Check ratio cards (1:1, 4:5, 9:16)
    await expect(page.getByText("كتالوج واتساب (1:1)").first()).toBeVisible();
    await expect(page.getByText("خلاصة انستغرام (4:5)").first()).toBeVisible();
    await expect(page.getByText("قصص ستوري (9:16)").first()).toBeVisible();

    // Click 200% zoom compare button
    const compareBtn = page.getByRole("button", { name: /فحص 200% قبل \/ بعد/ }).first();
    await compareBtn.click();

    // Modal should be visible
    await expect(page.getByText("مقارنة دقة القطعة وتفاصيل العيار")).toBeVisible();

    // Close modal via close button
    const closeBtn = page.getByRole("button", { name: "إغلاق" });
    await closeBtn.click({ force: true });
    await expect(page.getByText("مقارنة دقة القطعة وتفاصيل العيار")).not.toBeVisible();
  });

  test("verifies Account and Tax Invoice Generator View", async ({ page }) => {
    await page.goto("/account");

    await expect(page.locator("h1")).toContainText("إدارة الحساب والرصيد والفواتير");
    await expect(page.getByText("سجل الفواتير الضريبية")).toBeVisible();
    await expect(page.getByText("599.00 AED").first()).toBeVisible();
  });

  test("verifies Admin Dashboard quality review queue", async ({ page }) => {
    await page.goto("/admin");

    await expect(page.locator("h1")).toContainText("إدارة استوديو المجوهرات وجودة الكتالوج");
    await expect(page.getByText("طابور المراجعة")).toBeVisible();
  });
});
