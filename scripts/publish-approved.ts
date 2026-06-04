import { publishApprovedPosts, retryFailedPosts, cleanupDatabase } from "@/lib/automation/publish";
import { logger } from "@/lib/logger";

async function main() {
  const [published, retried] = await Promise.all([publishApprovedPosts(), retryFailedPosts()]);
  await cleanupDatabase();
  logger.info("publish_cli_finished", { published, retried });
}

main().catch((error) => {
  logger.error("publish_cli_failed", { error: error instanceof Error ? error.message : String(error) });
  process.exitCode = 1;
});
