import cron from "node-cron";
import db from "../db.server";
import { syncPosToShopify } from "./shopify-sync.server";
import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import { unauthenticated } from "../shopify.server";

// Store scheduled tasks
const scheduledTasks: Map<string, cron.ScheduledTask> = new Map();

/**
 * Get cron expression based on sync frequency
 */
function getCronExpression(frequency: string): string {
  switch (frequency) {
    case "hourly":
      return "0 * * * *"; // Every hour
    case "6hours":
      return "0 */6 * * *"; // Every 6 hours
    case "12hours":
      return "0 */12 * * *"; // Every 12 hours
    case "daily":
    default:
      return "0 0 * * *"; // Daily at midnight
  }
}

/**
 * Schedule sync for a specific shop
 */
export function scheduleShopSync(
  shopDomain: string,
  frequency: string
): void {
  // Cancel existing task if any
  cancelShopSync(shopDomain);

  const cronExpression = getCronExpression(frequency);

  console.log(
    `[Scheduler] Scheduling sync for ${shopDomain} with frequency: ${frequency} (${cronExpression})`
  );

  const task = cron.schedule(cronExpression, async () => {
    console.log(`[Scheduler] Running scheduled sync for ${shopDomain}`);
    await runSyncForShop(shopDomain);
  });

  scheduledTasks.set(shopDomain, task);
}

/**
 * Cancel scheduled sync for a shop
 */
export function cancelShopSync(shopDomain: string): void {
  const existingTask = scheduledTasks.get(shopDomain);
  if (existingTask) {
    existingTask.stop();
    scheduledTasks.delete(shopDomain);
    console.log(`[Scheduler] Cancelled sync for ${shopDomain}`);
  }
}

/**
 * Run sync for a specific shop
 */
async function runSyncForShop(shopDomain: string): Promise<void> {
  try {
    // Get shop settings
    const shop = await db.shop.findUnique({
      where: { shopDomain },
    });

    if (!shop || !shop.baseUrl || !shop.encryptionKey || !shop.iv) {
      console.error(`[Scheduler] Shop ${shopDomain} not configured properly`);
      return;
    }

    // Get admin API context using offline session
    const { admin } = await unauthenticated.admin(shopDomain);

    // Run the sync
    const result = await syncPosToShopify(admin, shopDomain, {
      baseUrl: shop.baseUrl,
      username: shop.username || "",
      password: shop.password || "",
      encryptionKey: shop.encryptionKey,
      iv: shop.iv,
    });

    console.log(
      `[Scheduler] Sync completed for ${shopDomain}:`,
      result.success ? "success" : "failed",
      `- ${result.categoriesSync} categories, ${result.productsSync} products`
    );
  } catch (error) {
    console.error(`[Scheduler] Sync failed for ${shopDomain}:`, error);
  }
}

/**
 * Initialize scheduler on app startup
 */
export async function initializeScheduler(): Promise<void> {
  console.log("[Scheduler] Initializing scheduler...");

  try {
    // Get all shops with valid settings
    const shops = await db.shop.findMany({
      where: {
        baseUrl: { not: null },
        encryptionKey: { not: null },
        iv: { not: null },
      },
    });

    for (const shop of shops) {
      scheduleShopSync(shop.shopDomain, shop.syncFrequency);
    }

    console.log(`[Scheduler] Initialized ${shops.length} shop schedules`);
  } catch (error) {
    console.error("[Scheduler] Failed to initialize:", error);
  }
}

/**
 * Get the status of all scheduled tasks
 */
export function getSchedulerStatus(): {
  shopDomain: string;
  isActive: boolean;
}[] {
  const status: { shopDomain: string; isActive: boolean }[] = [];

  scheduledTasks.forEach((task, shopDomain) => {
    status.push({
      shopDomain,
      isActive: true,
    });
  });

  return status;
}

/**
 * Trigger an immediate sync for a shop
 */
export async function triggerImmediateSync(
  admin: AdminApiContext["admin"],
  shopDomain: string
): Promise<{
  success: boolean;
  categoriesSync: number;
  productsSync: number;
  errors: string[];
}> {
  try {
    const shop = await db.shop.findUnique({
      where: { shopDomain },
    });

    if (!shop || !shop.baseUrl || !shop.encryptionKey || !shop.iv) {
      return {
        success: false,
        categoriesSync: 0,
        productsSync: 0,
        errors: ["Shop not configured. Please configure POS API settings first."],
      };
    }

    return await syncPosToShopify(admin, shopDomain, {
      baseUrl: shop.baseUrl,
      username: shop.username || "",
      password: shop.password || "",
      encryptionKey: shop.encryptionKey,
      iv: shop.iv,
    });
  } catch (error) {
    return {
      success: false,
      categoriesSync: 0,
      productsSync: 0,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

// Initialize scheduler when module loads (works in all environments)
// Only initializes if we're in a server context (not during build/test)
if (typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
  // Use setImmediate to ensure database is ready
  setImmediate(() => {
    initializeScheduler().catch((error) => {
      console.error("[Scheduler] Failed to auto-initialize:", error);
      // Don't throw - allow app to continue even if scheduler init fails
    });
  });
}
