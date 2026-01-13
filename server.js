// Production server for Hostinger
import { createRequestHandler } from "@remix-run/node";
import * as build from "./build/server/index.js";
import { installGlobals } from "@remix-run/node";
import http from "http";

// Install globals for Node.js (Request, Response, etc.)
installGlobals();

const port = process.env.PORT || 3000;
const host = "0.0.0.0";

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
