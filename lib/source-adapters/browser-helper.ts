import { chromium, type Browser } from "playwright";

let activeBrowser: Browser | null = null;
let isPersistentConnection = false;

async function createPersistentSession(): Promise<string | null> {
  const wsEndpoint = process.env.PLAYWRIGHT_WS_ENDPOINT;
  if (!wsEndpoint) return null;

  try {
    const url = new URL(wsEndpoint);
    const token = url.searchParams.get("token");
    if (!token) return null;

    const apiHost = url.host;
    const sessionApiUrl = `https://${apiHost}/session?token=${token}`;

    const response = await fetch(sessionApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ttl: 300000 }), // 5 minutes TTL
    });

    if (!response.ok) {
      throw new Error(`Browserless API returned status ${response.status}: ${await response.text()}`);
    }

    const data = (await response.json()) as { connect: string };
    return data.connect;
  } catch (err) {
    console.warn("Failed to create Browserless persistent session, falling back to standard connect:", err);
    return null;
  }
}

export async function withBrowser<T>(operation: (browser: Browser) => Promise<T>): Promise<T> {
  const wsEndpoint = process.env.PLAYWRIGHT_WS_ENDPOINT;
  
  // Reuse existing browser if active and connected
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
      // Attempt to create a persistent session first
      const persistentUrl = await createPersistentSession();
      if (persistentUrl) {
        try {
          // Playwright must connect using connectOverCDP for persistent session URLs
          browser = await chromium.connectOverCDP(persistentUrl, { timeout: 15000 });
          isPersistentConnection = true;
          activeBrowser = browser;
          isShared = true;
        } catch (cdpError) {
          console.warn("Failed to connect via CDP to persistent session, trying standard connect:", cdpError);
          browser = await chromium.connect(wsEndpoint, { timeout: 15000 });
          isPersistentConnection = false;
          activeBrowser = browser;
          isShared = true;
        }
      } else {
        browser = await chromium.connect(wsEndpoint, { timeout: 15000 });
        isPersistentConnection = false;
        activeBrowser = browser;
        isShared = true;
      }
    } catch (error) {
      console.warn("Browserless connection failed, falling back to local chromium launch:", error);
      browser = await chromium.launch({
        headless: true,
        args: ["--disable-dev-shm-usage", "--no-sandbox"],
      });
      isPersistentConnection = false;
      activeBrowser = null;
      isShared = false;
    }
  } else {
    browser = await chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage", "--no-sandbox"],
    });
    isPersistentConnection = false;
    activeBrowser = null;
    isShared = false;
  }

  const beforePages = browser.contexts().flatMap((c) => c.pages());
  try {
    return await operation(browser);
  } finally {
    if (isShared) {
      // If shared, do not close the browser context/connection, just clean up pages
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
      // Otherwise, close the browser normally (local chromium)
      await browser.close();
    }
  }
}

// Auto-cleanup hook when Node.js process exits normally
if (typeof process !== "undefined") {
  const cleanup = async () => {
    if (activeBrowser) {
      try {
        if (!isPersistentConnection) {
          await activeBrowser.close();
        }
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
