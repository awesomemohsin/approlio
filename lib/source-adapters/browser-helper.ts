import { chromium, type Browser } from "playwright";

export async function withBrowser<T>(operation: (browser: Browser) => Promise<T>): Promise<T> {
  const wsEndpoint = process.env.PLAYWRIGHT_WS_ENDPOINT;
  const browser = wsEndpoint
    ? await chromium.connect(wsEndpoint)
    : await chromium.launch({
        headless: true,
        args: ["--disable-dev-shm-usage", "--no-sandbox"],
      });

  try {
    return await operation(browser);
  } finally {
    await browser.close();
  }
}
