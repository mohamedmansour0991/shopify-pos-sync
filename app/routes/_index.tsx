import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  // If shop parameter is present, redirect to app
  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  // For GET/HEAD requests, try to authenticate first
  // If authenticated, redirect to app; if not, redirect to auth/login
  if (request.method === "GET" || request.method === "HEAD") {
    try {
      // Try to authenticate - if successful, user is logged in
      await authenticate.admin(request);
      // If authenticated, redirect to app
      throw redirect("/app");
    } catch (error) {
      // Not authenticated or any error - redirect to login page
      // The /auth/login route will handle the login flow properly
      throw redirect("/auth/login");
    }
  }

  // For POST requests, login() should handle FormData correctly
  // This should only happen if someone POSTs to root (unlikely but handle it)
  const { login } = await import("../shopify.server");
  return login(request);
};
