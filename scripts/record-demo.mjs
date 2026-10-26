import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "demo-output");
const base = process.env.CORISE_DEMO_URL || "http://localhost:3004";

fs.mkdirSync(outDir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function scrollPage(page, steps = 4) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, 450);
    await sleep(700);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: outDir,
      size: { width: 1280, height: 720 },
    },
  });
  const page = await context.newPage();

  // Clear any prior demo session so marketing pages stay visible
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    try {
      sessionStorage.clear();
    } catch {}
  });

  // 1. Landing
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await sleep(1600);
  await scrollPage(page, 5);
  await sleep(800);

  // 2. How it works
  await page.goto(`${base}/#how-it-works`, { waitUntil: "networkidle" });
  await sleep(1600);

  // 3. Pricing
  await page.goto(`${base}/pricing`, { waitUntil: "networkidle" });
  await sleep(1400);
  await scrollPage(page, 2);
  await sleep(700);

  // 4. Signup free — fill fields by placeholder/role
  await page.goto(`${base}/signup?plan=free`, { waitUntil: "networkidle" });
  await sleep(1400);
  const inputs = page.locator('input[type="text"], input:not([type]), input[type="email"]');
  const count = await inputs.count();
  if (count >= 1) {
    await inputs.nth(0).fill("Asha Menon");
    await sleep(350);
  }
  if (count >= 2) {
    await inputs.nth(1).fill("asha@greensteps.demo");
    await sleep(350);
  }
  if (count >= 3) {
    await inputs.nth(2).fill("GreenSteps Community Foundation");
    await sleep(500);
  }
  await sleep(900);

  // 5. Login role select (do not submit — stay on marketing)
  await page.goto(`${base}/login`, { waitUntil: "networkidle" });
  await sleep(1400);
  // Clear session again in case hydration restored prior state
  await page.evaluate(() => {
    try {
      sessionStorage.clear();
    } catch {}
  });
  await page.reload({ waitUntil: "networkidle" });
  await sleep(1200);
  const campaignRole = page.getByText("Campaign Manager", { exact: true }).first();
  if (await campaignRole.isVisible().catch(() => false)) {
    await campaignRole.click();
    await sleep(800);
  }
  const websiteRole = page.getByText("Website Manager", { exact: true }).first();
  if (await websiteRole.isVisible().catch(() => false)) {
    await websiteRole.click();
    await sleep(900);
  }
  await sleep(700);

  // 6. Public organization website
  await page.goto(`${base}/org/greensteps`, { waitUntil: "networkidle" });
  await sleep(2000);
  await scrollPage(page, 4);
  await sleep(700);

  // 7. Public campaign page
  await page.goto(`${base}/campaign/plant-1000-trees`, { waitUntil: "networkidle" });
  await sleep(2000);
  await scrollPage(page, 4);
  await sleep(900);

  // 8. Checkout / payment placeholder
  await page.goto(`${base}/checkout?plan=pro&role=website_manager`, {
    waitUntil: "networkidle",
  });
  await sleep(2200);

  // 9. Return to landing
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await sleep(1600);

  const videoPath = await page.video()?.path();
  await context.close();
  await browser.close();

  if (videoPath && fs.existsSync(videoPath)) {
    const dest = path.join(outDir, "corise-silent-demo.webm");
    fs.renameSync(videoPath, dest);
    console.log(`VIDEO_OK:${dest}`);
  } else {
    console.error("VIDEO_MISSING");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
