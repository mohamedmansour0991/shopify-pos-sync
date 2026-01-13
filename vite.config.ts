import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Related: https://github.com/remix-run/remix/issues/2835#issuecomment-1144102176
// Replace the host and port with your own
declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  server: {
    port: Number(process.env.PORT || 3001),
    allowedHosts: [
      "localhost",
      ".trycloudflare.com",
      ".ngrok.io",
      ".ngrok-free.app",
    ],
    // Disable HMR when running through a tunnel to avoid WebSocket issues
    hmr: process.env.SHOPIFY_CLI_TUNNEL ? false : {
      protocol: "ws",
      host: "localhost",
    },
    fs: {
      allow: ["app", "node_modules", "."],
    },
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    assetsInlineLimit: 0,
  },
});
