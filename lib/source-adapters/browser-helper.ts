import { chromium, type Browser } from "playwright";

let activeBrowser: Browser | null = null;

export async function withBrowser<T>(operation: (browser: Browser) => Promise<T>): Promise<T> {
  const wsEndpoint = process.env.PLAYWRIGHT_WS_ENDPOINT;
  
  // Reuse existing browser if active and connected within the current process
  if (activeBrowser && activeBrowser.isConnected()) {
    const beforePages = activeBrowser.contexts().flatMap((c) => c.pages());
    try {
      return await operation(activeBrowser);
    } finally {
      // Close pages opened in this operation to prevent resource leaks
      const afterPages = activeBrowser.contexts().flatMap((c) => c.pages());
      for (const page of afterPages) {
        if (!beforePages.includes(page)) {
          try {
            await page.close();
          } catch (e) {
            // Ignore error closing pages
          }
        }
      }
    }
  }

  let browser: Browser;
  let isShared = false;

  if (wsEndpoint) {
    try {
      // Ensure the endpoint has the correct Playwright WebSocket path (/chromium/playwright)
      let connectUrl = wsEndpoint;
      try {
        const parsedUrl = new URL(wsEndpoint);
        if (parsedUrl.pathname === "/" || parsedUrl.pathname === "" || parsedUrl.pathname === "/playwright") {
          parsedUrl.pathname = "/chromium/playwright";
          connectUrl = parsedUrl.toString();
        }
      } catch (urlError) {
        // Ignore URL parsing errors and fall back to raw endpoint
      }

      // Direct WebSocket connect. Browserless automatically spins up the browser
      // and shuts it down instantly once the connection is closed.
      browser = await chromium.connect(connectUrl, { timeout: 15000 });
      activeBrowser = browser;
      isShared = true;
    } catch (error) {
      console.warn("Browserless connection failed, falling back to local chromium launch:", error);
      browser = await chromium.launch({
        headless: true,
        args: ["--disable-dev-shm-usage", "--no-sandbox"],
      });
      activeBrowser = null;
      isShared = false;
    }
  } else {
    browser = await chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage", "--no-sandbox"],
    });
    activeBrowser = null;
    isShared = false;
  }

  const beforePages = browser.contexts().flatMap((c) => c.pages());
  try {
    return await operation(browser);
  } finally {
    if (isShared) {
      // Clean up pages within the current process
      const afterPages = browser.contexts().flatMap((c) => c.pages());
      for (const page of afterPages) {
        if (!beforePages.includes(page)) {
          try {
            await page.close();
          } catch (e) {
            // Ignore
          }
        }
      }
    } else {
      // Close local chromium
      await browser.close();
    }
  }
}

// Auto-cleanup hook when Node.js process exits normally
if (typeof process !== "undefined") {
  const cleanup = async () => {
    if (activeBrowser) {
      try {
        await activeBrowser.close(); // Cleanly close connection so Browserless stops billing immediately
      } catch (e) {
        // Ignore
      }
      activeBrowser = null;
    }
  };
  process.on("beforeExit", cleanup);
  process.on("SIGINT", async () => {
    await cleanup();
    process.exit(0);
  });
  process.on("SIGTERM", async () => {
    await cleanup();
    process.exit(0);
  });
}
