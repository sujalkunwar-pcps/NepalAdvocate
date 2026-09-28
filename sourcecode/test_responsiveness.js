const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\sujal\\.gemini\\antigravity-ide\\brain\\3aa8b08e-bc05-4973-9976-22956ca3175c';

const VIEWPORTS = [
  { name: 'iPhone_14', width: 390, height: 844 },
  { name: 'Pixel_7', width: 393, height: 851 },
  { name: 'Small_Mobile', width: 320, height: 568 },
  { name: 'Desktop_Web', width: 1280, height: 800 },
];

async function runTests() {
  console.log('🚀 Starting Playwright Responsiveness & Feature Verification Audit...');
  const browser = await chromium.launch({ headless: true });
  let hasErrors = false;

  for (const vp of VIEWPORTS) {
    console.log(`\n📱 Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // Listen for uncaught console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`  ⚠️ Console Error [${vp.name}]:`, msg.text());
      }
    });

    try {
      await page.goto('http://localhost:8081', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000); // Wait for Splash Screen transition

      // Check Horizontal Overflow
      const overflowInfo = await page.evaluate(() => {
        const bodyScroll = document.body.scrollWidth;
        const docScroll = document.documentElement.scrollWidth;
        const innerW = window.innerWidth;
        return {
          bodyScroll,
          docScroll,
          innerW,
          hasOverflow: bodyScroll > innerW || docScroll > innerW,
        };
      });

      console.log(`  🔍 Overflow Status:`, overflowInfo);
      if (overflowInfo.hasOverflow) {
        console.error(`  ❌ HORIZONTAL OVERFLOW DETECTED on ${vp.name}! ScrollWidth: ${overflowInfo.bodyScroll} > Viewport: ${overflowInfo.innerW}`);
        hasErrors = true;
      } else {
        console.log(`  ✅ Perfect Fit! Zero horizontal overflow on ${vp.name}.`);
      }

      // Capture Login Screen Screenshot
      const loginScreenshotPath = path.join(ARTIFACT_DIR, `login_${vp.name}.png`);
      await page.screenshot({ path: loginScreenshotPath });
      console.log(`  📸 Saved Screenshot: login_${vp.name}.png`);

      // Test Login Action
      const emailInput = page.locator('input[placeholder*="email"]').first();
      const passInput = page.locator('input[placeholder*="password"]').first();
      const signInBtn = page.locator('text=Sign In').first();

      if (await signInBtn.isVisible()) {
        await emailInput.fill('client@nepaladvocate.np');
        await passInput.fill('password123');
        await signInBtn.click();
        await page.waitForTimeout(1500);

        // Check Dashboard Overflow after login
        const dashboardOverflow = await page.evaluate(() => {
          return document.body.scrollWidth > window.innerWidth || document.documentElement.scrollWidth > window.innerWidth;
        });

        if (dashboardOverflow) {
          console.error(`  ❌ DASHBOARD OVERFLOW DETECTED on ${vp.name}!`);
          hasErrors = true;
        } else {
          console.log(`  ✅ Dashboard Perfect Fit on ${vp.name}.`);
        }

        // Capture Dashboard Screen Screenshot
        const dashboardScreenshotPath = path.join(ARTIFACT_DIR, `dashboard_${vp.name}.png`);
        await page.screenshot({ path: dashboardScreenshotPath });
        console.log(`  📸 Saved Screenshot: dashboard_${vp.name}.png`);

        // Test Tab Navigation: Lawyers, AI Chat, Vault, Profile
        const tabs = ['Lawyers', 'AI Chat', 'Vault', 'Profile', 'Home'];
        for (const tab of tabs) {
          const tabBtn = page.locator(`text=${tab}`).first();
          if (await tabBtn.isVisible()) {
            await tabBtn.click();
            await page.waitForTimeout(500);
          }
        }
      }

    } catch (err) {
      console.error(`  ❌ Error during test on ${vp.name}:`, err.message);
      hasErrors = true;
    } finally {
      await context.close();
    }
  }

  await browser.close();
  if (hasErrors) {
    console.log('\n⚠️ Audit finished with issues found.');
    process.exit(1);
  } else {
    console.log('\n🎉 AUDIT PASSED 100%! All viewports fit perfectly with zero horizontal overflow!');
    process.exit(0);
  }
}

runTests();
