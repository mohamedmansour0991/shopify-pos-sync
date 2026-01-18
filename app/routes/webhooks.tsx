import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * Webhook handler for Shopify webhooks
 * 
 * This handles the mandatory compliance webhooks required by Shopify:
 * - customers/data_request: When a customer requests their data
 * - customers/redact: When a customer requests deletion of their data
 * - shop/redact: When a shop owner requests deletion of shop data
 * 
 * Also handles:
 * - app/uninstalled: When the app is uninstalled from a shop
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, admin, payload } =
    await authenticate.webhook(request);

  console.log(`[Webhook] Received webhook: ${topic} from ${shop}`);

  // For compliance webhooks, we don't need admin access
  // They are sent even after the app is uninstalled
  const complianceTopics = ["CUSTOMERS_DATA_REQUEST", "CUSTOMERS_REDACT", "SHOP_REDACT"];
  
  if (!admin && !complianceTopics.includes(topic)) {
    console.log(`[Webhook] No admin access for topic: ${topic}`);
    throw new Response("Unauthorized", { status: 401 });
  }

  switch (topic) {
    case "APP_UNINSTALLED":
      console.log(`[Webhook] App uninstalled from ${shop}`);
      if (session) {
        await db.session.deleteMany({ where: { shop } });
        await db.shop.deleteMany({ where: { shopDomain: shop } });
        console.log(`[Webhook] Cleaned up data for ${shop}`);
      }
      break;
      
    case "CUSTOMERS_DATA_REQUEST":
      // Shopify requires this webhook to be handled
      // When a customer requests their data, you should return any data you have about them
      // For this app, we don't store customer data, so we just acknowledge the request
      console.log(`[Webhook] Customer data request for ${shop}`);
      // In a real app, you would:
      // 1. Look up any customer data you have stored
      // 2. Send it to the customer or merchant
      // For this POS sync app, we don't store customer data
      break;
      
    case "CUSTOMERS_REDACT":
      // Shopify requires this webhook to be handled
      // When a customer requests deletion of their data
      // For this app, we don't store customer data, so we just acknowledge the request
      console.log(`[Webhook] Customer redact request for ${shop}`);
      // In a real app, you would:
      // 1. Delete any customer data you have stored
      // For this POS sync app, we don't store customer data
      break;
      
    case "SHOP_REDACT":
      // Shopify requires this webhook to be handled
      // When a shop owner requests deletion of shop data (48 hours after uninstall)
      console.log(`[Webhook] Shop redact request for ${shop}`);
      // Clean up any remaining shop data
      try {
        await db.session.deleteMany({ where: { shop } });
        await db.shop.deleteMany({ where: { shopDomain: shop } });
        await db.syncLog.deleteMany({ where: { shopDomain: shop } });
        console.log(`[Webhook] All data deleted for ${shop}`);
      } catch (error) {
        console.error(`[Webhook] Error deleting data for ${shop}:`, error);
      }
      break;
      
    default:
      console.log(`[Webhook] Unhandled webhook topic: ${topic}`);
      // Return 200 for unhandled topics to prevent retries
      // Shopify will retry webhooks that return non-2xx status codes
      break;
  }

  // Always return 200 OK for webhooks
  // This tells Shopify we received and processed the webhook
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
