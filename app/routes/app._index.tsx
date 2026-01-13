import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  InlineStack,
  Badge,
  Icon,
  Box,
  Divider,
} from "@shopify/polaris";
import {
  SettingsIcon,
  RefreshIcon,
  ClockIcon,
} from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import { getShopSettings, getSyncLogs } from "../models/settings.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = await getShopSettings(session.shop);
  const recentLogs = await getSyncLogs(session.shop, 5);

  return json({
    shop: session.shop,
    isConfigured: Boolean(
      settings?.baseUrl && settings?.encryptionKey && settings?.iv
    ),
    lastSync: settings?.lastSync,
    syncFrequency: settings?.syncFrequency || "daily",
    recentLogs: recentLogs.map((log) => ({
      id: log.id,
      status: log.status,
      productsSync: log.productsSync,
      categoriesSync: log.categoriesSync,
      createdAt: log.createdAt.toISOString(),
      hasErrors: Boolean(log.errors),
    })),
  });
};

// Link styles
const primaryLinkStyle = {
  display: "inline-block",
  padding: "10px 16px",
  fontSize: "14px",
  fontWeight: 500 as const,
  border: "none",
  borderRadius: "4px",
  textDecoration: "none",
  textAlign: "center" as const,
  backgroundColor: "#008060",
  color: "#fff",
  width: "100%",
  boxSizing: "border-box" as const,
};

const secondaryLinkStyle = {
  ...primaryLinkStyle,
  backgroundColor: "transparent",
  color: "#006e52",
  border: "none",
};

const disabledLinkStyle = {
  ...primaryLinkStyle,
  backgroundColor: "#c4cdd5",
  cursor: "not-allowed",
  pointerEvents: "none" as const,
};

export default function Dashboard() {
  const { shop, isConfigured, lastSync, syncFrequency, recentLogs } =
    useLoaderData<typeof loader>();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge tone="success">Success</Badge>;
      case "partial":
        return <Badge tone="warning">Partial</Badge>;
      case "failed":
        return <Badge tone="critical">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const frequencyLabels: Record<string, string> = {
    hourly: "Every hour",
    "6hours": "Every 6 hours",
    "12hours": "Every 12 hours",
    daily: "Daily",
  };

  return (
    <Page title="POS Sync Dashboard">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {!isConfigured && (
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Welcome to POS Sync!
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Get started by configuring your POS API credentials to enable
                    automatic product synchronization.
                  </Text>
                  <Box>
                    <a href="/app/settings" style={primaryLinkStyle}>
                      Configure Settings
                    </a>
                  </Box>
                </BlockStack>
              </Card>
            )}

            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Sync Status
                </Text>

                <InlineStack gap="400" wrap={false}>
                  <Box
                    background="bg-surface-secondary"
                    padding="400"
                    borderRadius="200"
                    minWidth="200px"
                  >
                    <BlockStack gap="200">
                      <InlineStack align="space-between">
                        <Text as="span" variant="bodyMd" tone="subdued">
                          Configuration
                        </Text>
                        <Icon source={SettingsIcon} tone="base" />
                      </InlineStack>
                      {isConfigured ? (
                        <Badge tone="success">Configured</Badge>
                      ) : (
                        <Badge tone="attention">Not configured</Badge>
                      )}
                    </BlockStack>
                  </Box>

                  <Box
                    background="bg-surface-secondary"
                    padding="400"
                    borderRadius="200"
                    minWidth="200px"
                  >
                    <BlockStack gap="200">
                      <InlineStack align="space-between">
                        <Text as="span" variant="bodyMd" tone="subdued">
                          Last Sync
                        </Text>
                        <Icon source={RefreshIcon} tone="base" />
                      </InlineStack>
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        {formatDate(lastSync)}
                      </Text>
                    </BlockStack>
                  </Box>

                  <Box
                    background="bg-surface-secondary"
                    padding="400"
                    borderRadius="200"
                    minWidth="200px"
                  >
                    <BlockStack gap="200">
                      <InlineStack align="space-between">
                        <Text as="span" variant="bodyMd" tone="subdued">
                          Schedule
                        </Text>
                        <Icon source={ClockIcon} tone="base" />
                      </InlineStack>
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        {frequencyLabels[syncFrequency] || syncFrequency}
                      </Text>
                    </BlockStack>
                  </Box>
                </InlineStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  Recent Sync History
                </Text>
                <a href="/app/logs" style={{ color: "#006e52", textDecoration: "none" }}>
                  View all →
                </a>
              </InlineStack>

              {recentLogs.length === 0 ? (
                <Text as="p" variant="bodyMd" tone="subdued">
                  No sync history yet. Run your first sync to see results here.
                </Text>
              ) : (
                <BlockStack gap="300">
                  {recentLogs.map((log, index) => (
                    <div key={log.id}>
                      {index > 0 && <Divider />}
                      <Box paddingBlockStart="200" paddingBlockEnd="200">
                        <InlineStack align="space-between" blockAlign="center">
                          <BlockStack gap="100">
                            <InlineStack gap="200">
                              {getStatusBadge(log.status)}
                              <Text as="span" variant="bodySm" tone="subdued">
                                {formatDate(log.createdAt)}
                              </Text>
                            </InlineStack>
                          </BlockStack>
                          <Text as="span" variant="bodyMd">
                            {log.categoriesSync} categories, {log.productsSync}{" "}
                            products
                          </Text>
                        </InlineStack>
                      </Box>
                    </div>
                  ))}
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Quick Actions
              </Text>

              <BlockStack gap="200">
                <a 
                  href="/app/sync" 
                  style={isConfigured ? primaryLinkStyle : disabledLinkStyle}
                >
                  Run Manual Sync
                </a>
                <a href="/app/settings" style={secondaryLinkStyle}>
                  Edit Settings
                </a>
                <a href="/app/logs" style={secondaryLinkStyle}>
                  View Sync Logs
                </a>
              </BlockStack>
            </BlockStack>
          </Card>

          <Box paddingBlockStart="400">
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">
                  Shop Info
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  {shop}
                </Text>
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
