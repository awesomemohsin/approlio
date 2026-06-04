import { chromium, type Browser } from "playwright";

export async function withBrowser<T>(operation: (browser: Browser) => Promise<T>): Promise<T> {
  const wsEndpoint = process.env.PLAYWRIGHT_WS_ENDPOINT;
  let browser: Browser;

  if (wsEndpoint) {
    try {
      browser = await chromium.connect(wsEndpoint, { timeout: 10000 });
    } catch (error) {
      console.warn("Browserless connection failed, falling back to local chromium launch:", error);
      browser = await chromium.launch({
        headless: true,
        args: ["--disable-dev-shm-usage", "--no-sandbox"],
      });
    }
  } else {
    browser = await chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage", "--no-sandbox"],
    });
  }

  try {
    return await operation(browser);
  } finally {
    await browser.close();
  }
}
