// Production server for Hostinger
import { createRequestHandler } from "@remix-run/node";
import * as build from "./build/server/index.js";
import { installGlobals } from "@remix-run/node";
import http from "http";

// Install globals for Node.js
installGlobals();

const port = process.env.PORT || 3000;
const host = "0.0.0.0";

const requestHandler = createRequestHandler(build, "production");

const server = http.createServer(async (req, res) => {
  try {
    // Create a URL object from the request
    const url = new URL(req.url || "/", `http://${req.headers.host || host}`);
    
    // Create a Request object
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: req.method !== "GET" && req.method !== "HEAD" 
        ? await streamToBuffer(req) 
        : undefined,
    });

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
      const pump = async () => {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
        } else {
          res.write(value);
          return pump();
        }
      };
      await pump();
    } else {
      res.end();
    }
  } catch (error) {
    console.error("Request handler error:", error);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  }
});

// Helper function to convert stream to buffer
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

server.listen(port, host, () => {
  console.log(`🚀 Server running on http://${host}:${port}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 HOST: ${process.env.HOST || "not set"}`);
  console.log(`🌐 PORT: ${port}`);
});
