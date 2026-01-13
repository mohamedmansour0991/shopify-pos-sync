import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { useState, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Banner,
  ProgressBar,
  InlineStack,
  Badge,
  Box,
  List,
  Spinner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getShopSettings } from "../models/settings.server";
import { triggerImmediateSync, scheduleShopSync } from "../services/scheduler.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = await getShopSettings(session.shop);

  return json({
    shop: session.shop,
    isConfigured: Boolean(
      settings?.baseUrl && settings?.encryptionKey && settings?.iv
    ),
    lastSync: settings?.lastSync?.toISOString() || null,
    syncFrequency: settings?.syncFrequency || "daily",
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "sync") {
    const result = await triggerImmediateSync(admin, session.shop);

    // Re-schedule after manual sync
    const settings = await getShopSettings(session.shop);
    if (settings) {
      scheduleShopSync(session.shop, settings.syncFrequency);
    }

    return json({
      ...result,
      completedAt: new Date().toISOString(),
    });
  }

  return json({ success: false, errors: ["Unknown action"] });
};

// Button styles
const primaryButtonStyle = {
  padding: "10px 20px",
  fontSize: "14px",
  fontWeight: 500 as const,
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  backgroundColor: "#008060",
  color: "#fff",
};

const disabledButtonStyle = {
  ...primaryButtonStyle,
  backgroundColor: "#c4cdd5",
  cursor: "not-allowed",
};

export default function Sync() {
  const { isConfigured, lastSync, syncFrequency } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  // Update loading state based on navigation
  useEffect(() => {
    setIsLoading(navigation.state === "submitting" || navigation.state === "loading");
  }, [navigation.state]);

  // Reset loading when action completes
  useEffect(() => {
    if (actionData) {
      setIsLoading(false);
    }
  }, [actionData]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const frequencyLabels: Record<string, string> = {
    hourly: "Every hour",
    "6hours": "Every 6 hours",
    "12hours": "Every 12 hours",
    daily: "Daily",
  };

  return (
    <Page title="Manual Sync" backAction={{ content: "Dashboard", url: "/app" }}>
      <Layout>
        <Layout.Section>
          {!isConfigured && (
            <Banner tone="warning">
              <p>
                Please configure your POS API settings before running a sync.{" "}
                <a href="/app/settings">Go to Settings</a>
              </p>
            </Banner>
          )}

          {actionData && (
            <Banner
              tone={actionData.success ? "success" : "critical"}
              onDismiss={() => {}}
            >
              {actionData.success ? (
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    ✅ تم سحب المنتجات والأقسام بنجاح
                  </Text>
                  <List>
                    <List.Item>
                      الأقسام المضافة: {actionData.categoriesSync}
                    </List.Item>
                    <List.Item>
                      المنتجات المضافة: {actionData.productsSync}
                    </List.Item>
                  </List>
                </BlockStack>
              ) : (
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd">
                    Sync completed with errors.
                  </Text>
                  {actionData.errors && actionData.errors.length > 0 && (
                    <List>
                      {actionData.errors.slice(0, 5).map((error: string, i: number) => (
                        <List.Item key={i}>{error}</List.Item>
                      ))}
                      {actionData.errors.length > 5 && (
                        <List.Item>
                          ...and {actionData.errors.length - 5} more errors
                        </List.Item>
                      )}
                    </List>
                  )}
                </BlockStack>
              )}
            </Banner>
          )}
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Sync Products from POS
              </Text>

              <Text as="p" variant="bodyMd">
                Manually trigger a full synchronization of categories and products
                from your POS system to Shopify. This will:
              </Text>

              <List>
                <List.Item>
                  Fetch all categories and create/update Shopify collections
                </List.Item>
                <List.Item>
                  Fetch all products and create/update Shopify products
                </List.Item>
                <List.Item>Assign products to their correct collections</List.Item>
                <List.Item>Update prices, descriptions, and images</List.Item>
              </List>

              {isLoading && (
                <Box paddingBlock="400">
                  <BlockStack gap="400">
                    <InlineStack align="start" gap="300">
                      <Spinner accessibilityLabel="Loading" size="small" />
                      <BlockStack gap="100">
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          جاري المزامنة...
                        </Text>
                        <Text as="p" variant="bodyMd" tone="subdued">
                          قد تستغرق العملية عدة دقائق حسب عدد المنتجات. يرجى عدم إغلاق هذه الصفحة.
                        </Text>
                      </BlockStack>
                    </InlineStack>
                    <ProgressBar progress={undefined} tone="primary" />
                  </BlockStack>
                </Box>
              )}

              {/* Native HTML Form - works without JavaScript */}
              <form 
                method="post"
                onSubmit={() => {
                  setIsLoading(true);
                }}
              >
                <input type="hidden" name="intent" value="sync" />
                <button
                  type="submit"
                  disabled={!isConfigured || isLoading}
                  style={!isConfigured || isLoading ? disabledButtonStyle : primaryButtonStyle}
                >
                  {isLoading ? "⏳ جاري المزامنة..." : "🚀 بدء المزامنة"}
                </button>
              </form>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Sync Information
              </Text>

              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd" tone="subdued">
                    Status
                  </Text>
                  {isConfigured ? (
                    <Badge tone="success">Ready</Badge>
                  ) : (
                    <Badge tone="attention">Not configured</Badge>
                  )}
                </InlineStack>

                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd" tone="subdued">
                    Last sync
                  </Text>
                  <Text as="span" variant="bodyMd">
                    {formatDate(lastSync)}
                  </Text>
                </InlineStack>

                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd" tone="subdued">
                    Auto-sync
                  </Text>
                  <Text as="span" variant="bodyMd">
                    {frequencyLabels[syncFrequency] || syncFrequency}
                  </Text>
                </InlineStack>
              </BlockStack>
            </BlockStack>
          </Card>

          <Box paddingBlockStart="400">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Note
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  The sync process may take several minutes depending on the number
                  of products in your POS system. Please don't close this page while
                  syncing.
                </Text>
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
