import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Badge,
  IndexTable,
  useIndexResourceState,
  EmptyState,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getSyncLogs } from "../models/settings.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const logs = await getSyncLogs(session.shop, 100);

  return json({
    logs: logs.map((log) => ({
      id: log.id,
      status: log.status,
      productsSync: log.productsSync,
      categoriesSync: log.categoriesSync,
      errors: log.errors,
      createdAt: log.createdAt.toISOString(),
    })),
  });
};

export default function Logs() {
  const { logs } = useLoaderData<typeof loader>();

  const resourceName = {
    singular: "sync log",
    plural: "sync logs",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(logs);

  const formatDate = (dateString: string) => {
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

  const rowMarkup = logs.map((log, index) => (
    <IndexTable.Row
      id={log.id}
      key={log.id}
      selected={selectedResources.includes(log.id)}
      position={index}
    >
      <IndexTable.Cell>
        <Text variant="bodyMd" fontWeight="bold" as="span">
          {formatDate(log.createdAt)}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{getStatusBadge(log.status)}</IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" alignment="center" numeric>
          {log.categoriesSync}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text as="span" alignment="center" numeric>
          {log.productsSync}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        {log.errors ? (
          <Text as="span" tone="critical" truncate>
            {log.errors.split("\n")[0]}
            {log.errors.split("\n").length > 1
              ? ` (+${log.errors.split("\n").length - 1} more)`
              : ""}
          </Text>
        ) : (
          <Text as="span" tone="subdued">
            No errors
          </Text>
        )}
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page title="Sync Logs" backAction={{ content: "Dashboard", url: "/app" }}>
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {logs.length === 0 ? (
              <EmptyState
                heading="No sync history yet"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>
                  Run your first sync to see the history here. Sync logs help you
                  track successful and failed synchronizations.
                </p>
              </EmptyState>
            ) : (
              <IndexTable
                resourceName={resourceName}
                itemCount={logs.length}
                selectedItemsCount={
                  allResourcesSelected ? "All" : selectedResources.length
                }
                onSelectionChange={handleSelectionChange}
                headings={[
                  { title: "Date" },
                  { title: "Status" },
                  { title: "Categories", alignment: "center" },
                  { title: "Products", alignment: "center" },
                  { title: "Errors" },
                ]}
                selectable={false}
              >
                {rowMarkup}
              </IndexTable>
            )}
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                About Sync Logs
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Sync logs keep track of all synchronization attempts between your
                POS system and Shopify.
              </Text>
              <BlockStack gap="100">
                <Text as="p" variant="bodyMd">
                  <Badge tone="success">Success</Badge> - All items synced without
                  errors
                </Text>
                <Text as="p" variant="bodyMd">
                  <Badge tone="warning">Partial</Badge> - Some items synced, but with
                  errors
                </Text>
                <Text as="p" variant="bodyMd">
                  <Badge tone="critical">Failed</Badge> - Sync failed completely
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>

          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Log Retention
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                The most recent 100 sync logs are displayed here. Older logs are
                automatically archived.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
