// Production server for Hostinger
import { createRequestHandler } from "@remix-run/node";
import * as build from "./build/server/index.js";
import http from "http";

const port = process.env.PORT || 3000;
const host = process.env.HOST || "0.0.0.0";

const requestHandler = createRequestHandler(build, "production");

const server = http.createServer((req, res) => {
  requestHandler(req, res).catch((error) => {
    console.error("Request handler error:", error);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  });
});

server.listen(port, host, () => {
  console.log(`🚀 Server running on http://${host}:${port}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 HOST: ${process.env.HOST || "not set"}`);
});
