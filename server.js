// Production server for Hostinger
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load .env file FIRST, before importing anything else
// This is critical because shopify.server.ts validates env vars on module load
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const envPath = join(__dirname, ".env");
  
  const envFile = readFileSync(envPath, "utf-8");
  const envLines = envFile.split("\n");
  
  for (const line of envLines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      const [key, ...valueParts] = trimmedLine.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    }
  }
  
  console.log("✅ Loaded environment variables from .env file");
} catch (error) {
  // .env file not found or couldn't be read - that's okay if vars are set in environment
  console.log("ℹ️  .env file not found, using environment variables");
}

// NOW import Remix and build (after .env is loaded)
import { createRequestHandler } from "@remix-run/node";
import * as build from "./build/server/index.js";
import { installGlobals } from "@remix-run/node";
import http from "http";

// Install globals for Node.js (Request, Response, etc.)
installGlobals();

// Get port from environment (cPanel sets this automatically)
const port = process.env.PORT || process.env.NODE_PORT || 3000;
const host = process.env.IP || "0.0.0.0";

const requestHandler = createRequestHandler(build, "production");

const server = http.createServer(async (req, res) => {
  try {
    // Build the full URL
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const hostname = req.headers.host || host;
    const url = `${protocol}://${hostname}${req.url || "/"}`;
    
    // Create a Request object
    const requestInit = {
      method: req.method,
      headers: new Headers(req.headers),
    };

    // Add body for POST/PUT/PATCH requests
    if (req.method !== "GET" && req.method !== "HEAD") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      requestInit.body = Buffer.concat(chunks);
    }

    const request = new Request(url, requestInit);

    // Handle the request
    const response = await requestHandler(request);

    // Set response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Set status code
    res.statusCode = response.status;

    // Send response body
    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (error) {
    console.error("Request handler error:", error);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  }
});

server.listen(port, host, () => {
  console.log(`🚀 Server running on http://${host}:${port}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 HOST: ${process.env.HOST || "not set"}`);
  console.log(`🌐 PORT: ${port}`);
});
