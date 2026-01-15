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
    const cleanHeaders = new Headers(request.headers);
    cleanHeaders.delete("content-type");
    cleanHeaders.delete("content-length");
    
    const cleanRequest = new Request(request.url, {
      method: request.method,
      headers: cleanHeaders,
      // Explicitly no body for GET/HEAD
    });
    
    return login(cleanRequest);
  }

  return login(request);
};
