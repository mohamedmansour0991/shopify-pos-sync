import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  Banner,
  BlockStack,
  Text,
  InlineStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getShopSettings, upsertShopSettings } from "../models/settings.server";
import { testPosConnection } from "../services/pos-api.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = await getShopSettings(session.shop);

  return json({
    shop: session.shop,
    settings: settings
        ? {
          baseUrl: settings.baseUrl || "http://37.34.237.190:9292/TheOneAPIPOS/api/",
          username: settings.username || "c18e4f8f33a47884",
          password: settings.password || "WdGDr6c8cPdc17O6YLns/R+rpRagngiPOEu7FhsmgAs=",
          encryptionKey: settings.encryptionKey || "1f08c364c4cccf6bdd273f8e3be277f8",
          iv: settings.iv || "c18e4f8f33a47884",
          syncFrequency: settings.syncFrequency || "daily",
        }
      : {
          baseUrl: "http://37.34.237.190:9292/TheOneAPIPOS/api/",
          username: "c18e4f8f33a47884",
          password: "WdGDr6c8cPdc17O6YLns/R+rpRagngiPOEu7FhsmgAs=",
          encryptionKey: "1f08c364c4cccf6bdd273f8e3be277f8",
          iv: "c18e4f8f33a47884",
          syncFrequency: "daily",
        },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  const baseUrl = formData.get("baseUrl") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const encryptionKey = formData.get("encryptionKey") as string;
  const iv = formData.get("iv") as string;
  const syncFrequency = formData.get("syncFrequency") as string;

  // Validation
  const errors: Record<string, string> = {};
  if (!baseUrl) errors.baseUrl = "Base URL is required";
  if (!username) errors.username = "Username is required";
  if (!password) errors.password = "Password is required";
  if (!encryptionKey) errors.encryptionKey = "Encryption key is required";
  if (encryptionKey && encryptionKey.length !== 32) {
    errors.encryptionKey = "Encryption key must be exactly 32 characters";
  }
  if (!iv) errors.iv = "IV is required";
  if (iv && iv.length !== 16) {
    errors.iv = "IV must be exactly 16 characters";
  }

  if (Object.keys(errors).length > 0) {
    return json({ success: false, errors, testResult: null });
  }

  if (intent === "test") {
    // Test the connection
    const testResult = await testPosConnection({
      baseUrl,
      username,
      password,
      encryptionKey,
      iv,
    });
    return json({ success: testResult.success, errors: {}, testResult });
  }

  // Save settings
  try {
    await upsertShopSettings({
      shopDomain: session.shop,
      accessToken: session.accessToken || "",
      baseUrl,
      username,
      password,
      encryptionKey,
      iv,
      syncFrequency,
    });

    return json({
      success: true,
      errors: {},
      testResult: null,
      message: "Settings saved successfully!",
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    return json({
      success: false,
      errors: { form: "Failed to save settings" },
      testResult: null,
    });
  }
};

// Styles for native form elements
const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  fontSize: "14px",
  border: "1px solid #c4cdd5",
  borderRadius: "4px",
  backgroundColor: "#fff",
};

const labelStyle = {
  display: "block",
  marginBottom: "4px",
  fontSize: "14px",
  fontWeight: 500 as const,
  color: "#202223",
};

const helpTextStyle = {
  fontSize: "12px",
  color: "#6d7175",
  marginTop: "4px",
};

const errorStyle = {
  fontSize: "12px",
  color: "#d72c0d",
  marginTop: "4px",
};

const buttonStyle = {
  padding: "8px 16px",
  fontSize: "14px",
  fontWeight: 500 as const,
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const primaryButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#008060",
  color: "#fff",
};

const secondaryButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#fff",
  color: "#202223",
  border: "1px solid #c4cdd5",
};

export default function Settings() {
  const { settings } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  const syncFrequencyOptions = [
    { label: "Hourly", value: "hourly" },
    { label: "Daily", value: "daily" },
    { label: "Every 6 hours", value: "6hours" },
    { label: "Every 12 hours", value: "12hours" },
  ];

  return (
    <Page title="POS API Settings" backAction={{ content: "Dashboard", url: "/app" }}>
      <Layout>
        <Layout.Section>
          {actionData?.success && actionData?.message && (
            <Banner tone="success" onDismiss={() => {}}>
              <p>{actionData.message}</p>
            </Banner>
          )}

          {actionData?.testResult && (
            <Banner
              tone={actionData.testResult.success ? "success" : "critical"}
              onDismiss={() => {}}
            >
              <p>
                {actionData.testResult.success
                  ? `Connection successful! Found ${actionData.testResult.categoryCount} categories.`
                  : `Connection failed: ${actionData.testResult.error}`}
              </p>
            </Banner>
          )}

          {actionData?.errors?.form && (
            <Banner tone="critical" onDismiss={() => {}}>
              <p>{actionData.errors.form}</p>
            </Banner>
          )}
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                POS API Configuration
              </Text>
              <Text as="p" variant="bodyMd" tone="subdued">
                Configure your POS system API credentials to enable automatic product
                synchronization.
              </Text>

              {/* Native HTML Form - works without JavaScript */}
              <form method="post" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={labelStyle} htmlFor="baseUrl">Base URL</label>
                  <input
                    type="text"
                    id="baseUrl"
                    name="baseUrl"
                    defaultValue={settings.baseUrl}
                    placeholder="http://37.34.237.190:9292/TheOneAPIPOS/api/"
                    style={inputStyle}
                  />
                  <div style={helpTextStyle}>The base URL of your POS API</div>
                  {actionData?.errors?.baseUrl && (
                    <div style={errorStyle}>{actionData.errors.baseUrl}</div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle} htmlFor="username">Username</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      defaultValue={settings.username}
                      placeholder="api_user"
                      style={inputStyle}
                    />
                    <div style={helpTextStyle}>Basic Auth username</div>
                    {actionData?.errors?.username && (
                      <div style={errorStyle}>{actionData.errors.username}</div>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle} htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      defaultValue={settings.password}
                      placeholder="••••••••"
                      style={inputStyle}
                    />
                    <div style={helpTextStyle}>Basic Auth password</div>
                    {actionData?.errors?.password && (
                      <div style={errorStyle}>{actionData.errors.password}</div>
                    )}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle} htmlFor="encryptionKey">Encryption Key</label>
                    <input
                      type="text"
                      id="encryptionKey"
                      name="encryptionKey"
                      defaultValue={settings.encryptionKey}
                      placeholder="32 character key"
                      maxLength={32}
                      style={inputStyle}
                    />
                    <div style={helpTextStyle}>AES-256-CBC encryption key (32 characters)</div>
                    {actionData?.errors?.encryptionKey && (
                      <div style={errorStyle}>{actionData.errors.encryptionKey}</div>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle} htmlFor="iv">Initialization Vector (IV)</label>
                    <input
                      type="text"
                      id="iv"
                      name="iv"
                      defaultValue={settings.iv}
                      placeholder="16 character IV"
                      maxLength={16}
                      style={inputStyle}
                    />
                    <div style={helpTextStyle}>Initialization vector (16 characters)</div>
                    {actionData?.errors?.iv && (
                      <div style={errorStyle}>{actionData.errors.iv}</div>
                    )}
                  </div>
                </div>

                <div>
                  <label style={labelStyle} htmlFor="syncFrequency">Sync Frequency</label>
                  <select
                    id="syncFrequency"
                    name="syncFrequency"
                    defaultValue={settings.syncFrequency}
                    style={inputStyle}
                  >
                    {syncFrequencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div style={helpTextStyle}>How often to automatically sync products from POS</div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                  <button
                    type="submit"
                    name="intent"
                    value="test"
                    disabled={isLoading}
                    style={secondaryButtonStyle}
                  >
                    {isLoading ? "Testing..." : "Test Connection"}
                  </button>
                  <button
                    type="submit"
                    name="intent"
                    value="save"
                    disabled={isLoading}
                    style={primaryButtonStyle}
                  >
                    {isLoading ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </form>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Help
              </Text>
              <Text as="p" variant="bodyMd">
                <strong>Base URL:</strong> The API endpoint of your POS system.
              </Text>
              <Text as="p" variant="bodyMd">
                <strong>Encryption Key:</strong> A 32-character key used for AES-256-CBC
                decryption of API responses.
              </Text>
              <Text as="p" variant="bodyMd">
                <strong>IV:</strong> A 16-character initialization vector for decryption.
              </Text>
              <Text as="p" variant="bodyMd">
                Use the "Test Connection" button to verify your settings before saving.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
