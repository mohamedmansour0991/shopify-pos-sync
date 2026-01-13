import db from "../db.server";

export interface ShopSettings {
  shopDomain: string;
  accessToken: string;
  baseUrl?: string | null;
  username?: string | null;
  password?: string | null;
  encryptionKey?: string | null;
  iv?: string | null;
  syncFrequency?: string;
  lastSync?: Date | null;
}

export async function getShopSettings(shopDomain: string) {
  return db.shop.findUnique({
    where: { shopDomain },
  });
}

export async function upsertShopSettings(settings: ShopSettings) {
  return db.shop.upsert({
    where: { shopDomain: settings.shopDomain },
    create: {
      shopDomain: settings.shopDomain,
      accessToken: settings.accessToken,
      baseUrl: settings.baseUrl,
      username: settings.username,
      password: settings.password,
      encryptionKey: settings.encryptionKey,
      iv: settings.iv,
      syncFrequency: settings.syncFrequency || "daily",
    },
    update: {
      accessToken: settings.accessToken,
      baseUrl: settings.baseUrl,
      username: settings.username,
      password: settings.password,
      encryptionKey: settings.encryptionKey,
      iv: settings.iv,
      syncFrequency: settings.syncFrequency,
    },
  });
}

export async function updateLastSync(shopDomain: string) {
  return db.shop.update({
    where: { shopDomain },
    data: { lastSync: new Date() },
  });
}

export async function createSyncLog(log: {
  shopDomain: string;
  status: string;
  productsSync?: number;
  categoriesSync?: number;
  errors?: string | null;
}) {
  return db.syncLog.create({
    data: {
      shopDomain: log.shopDomain,
      status: log.status,
      productsSync: log.productsSync || 0,
      categoriesSync: log.categoriesSync || 0,
      errors: log.errors,
    },
  });
}

export async function getSyncLogs(shopDomain: string, limit = 50) {
  return db.syncLog.findMany({
    where: { shopDomain },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAllShopsWithSettings() {
  return db.shop.findMany({
    where: {
      baseUrl: { not: null },
      encryptionKey: { not: null },
    },
  });
}
