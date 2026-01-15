import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { login } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  // For GET requests, create a clean Request object without body or Content-Type
  // This prevents login() from attempting to parse FormData
  if (request.method === "GET" || request.method === "HEAD") {
    try {
      // First attempt: create clean request with only safe headers
      const cleanHeaders = new Headers();
      // Only copy safe headers, explicitly exclude content-type and content-length
      request.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (lowerKey !== "content-type" && lowerKey !== "content-length") {
          cleanHeaders.set(key, value);
        }
      });
      
      const cleanRequest = new Request(request.url, {
        method: request.method,
        headers: cleanHeaders,
        // Explicitly no body for GET/HEAD
      });
      
      return await login(cleanRequest);
    } catch (error) {
      // If FormData parsing still fails, create an even cleaner request
      // with only essential headers
      const minimalHeaders = new Headers();
      if (request.headers.get("host")) {
        minimalHeaders.set("host", request.headers.get("host")!);
      }
      if (request.headers.get("x-forwarded-proto")) {
        minimalHeaders.set("x-forwarded-proto", request.headers.get("x-forwarded-proto")!);
      }
      if (request.headers.get("x-forwarded-host")) {
        minimalHeaders.set("x-forwarded-host", request.headers.get("x-forwarded-host")!);
      }
      
      const minimalRequest = new Request(request.url, {
        method: request.method,
        headers: minimalHeaders,
      });
      
      return await login(minimalRequest);
    }
  }

  return login(request);
};
