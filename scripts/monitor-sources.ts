import { processAllActiveSources } from "@/lib/automation/monitor";
import { logger } from "@/lib/logger";

processAllActiveSources()
  .then((results) => {
    logger.info("monitor_cli_finished", { results });
  })
  .catch((error) => {
    logger.error("monitor_cli_failed", { error: error instanceof Error ? error.message : String(error) });
    process.exitCode = 1;
  });
