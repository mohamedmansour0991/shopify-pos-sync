/**
 * Rate limiter for Shopify API requests
 * 
 * Shopify GraphQL API rate limits:
 * - Standard: ~100 points/second
 * - Plus: ~1,000 points/second
 * 
 * This rate limiter implements a simple token bucket algorithm
 * to prevent hitting rate limits.
 */

interface RateLimitState {
  tokens: number;
  lastRefill: number;
  maxTokens: number;
  refillRate: number; // tokens per second
}

// Per-shop rate limit state
const rateLimitStates: Map<string, RateLimitState> = new Map();

// Conservative defaults (assuming Standard plan - 100 points/sec)
// We'll use 80% of the limit to be safe
const DEFAULT_MAX_TOKENS = 80;
const DEFAULT_REFILL_RATE = 80; // tokens per second

/**
 * Get or create rate limit state for a shop
 */
function getRateLimitState(shopDomain: string): RateLimitState {
  if (!rateLimitStates.has(shopDomain)) {
    rateLimitStates.set(shopDomain, {
      tokens: DEFAULT_MAX_TOKENS,
      lastRefill: Date.now(),
      maxTokens: DEFAULT_MAX_TOKENS,
      refillRate: DEFAULT_REFILL_RATE,
    });
  }
  return rateLimitStates.get(shopDomain)!;
}

/**
 * Refill tokens based on time elapsed
 */
function refillTokens(state: RateLimitState): void {
  const now = Date.now();
  const elapsed = (now - state.lastRefill) / 1000; // seconds
  const tokensToAdd = elapsed * state.refillRate;
  
  state.tokens = Math.min(state.maxTokens, state.tokens + tokensToAdd);
  state.lastRefill = now;
}

/**
 * Estimate query cost (rough estimation)
 * Simple queries: ~1-5 points
 * Complex queries with connections: ~10-50 points
 * Mutations: ~10-100 points
 */
function estimateQueryCost(query: string): number {
  // Rough estimation based on query complexity
  const hasConnections = /first:\s*\d+|edges|nodes/i.test(query);
  const isMutation = query.trim().startsWith("mutation");
  const fieldCount = (query.match(/\w+\s*\{/g) || []).length;
  
  let cost = 1; // base cost
  
  if (isMutation) {
    cost += 10; // mutations cost more
  }
  
  if (hasConnections) {
    cost += fieldCount * 2; // connections cost more
  } else {
    cost += fieldCount * 0.5; // simple fields cost less
  }
  
  // Cap at reasonable maximum
  return Math.min(cost, 50);
}

/**
 * Wait for available tokens
 */
async function waitForTokens(
  shopDomain: string,
  requiredTokens: number
): Promise<void> {
  const state = getRateLimitState(shopDomain);
  refillTokens(state);
  
  if (state.tokens >= requiredTokens) {
    state.tokens -= requiredTokens;
    return;
  }
  
  // Calculate wait time
  const tokensNeeded = requiredTokens - state.tokens;
  const waitTime = (tokensNeeded / state.refillRate) * 1000; // milliseconds
  
  // Add small buffer
  const waitTimeMs = Math.ceil(waitTime) + 100;
  
  console.log(
    `[Rate Limiter] ${shopDomain}: Waiting ${waitTimeMs}ms for ${tokensNeeded} tokens`
  );
  
  await new Promise((resolve) => setTimeout(resolve, waitTimeMs));
  
  // Refill again after waiting
  refillTokens(state);
  state.tokens -= requiredTokens;
}

/**
 * Extract rate limit info from GraphQL response
 */
function extractRateLimitInfo(response: Response): {
  requestedCost?: number;
  actualCost?: number;
  available?: number;
  restoreRate?: number;
} {
  // Rate limit info is typically in response headers or extensions
  // For now, we'll rely on our estimation
  // In the future, we could parse the response body for extensions
  return {};
}

/**
 * Check if error is a rate limit error
 */
function isRateLimitError(error: any): boolean {
  if (error?.response?.status === 429) {
    return true;
  }
  
  if (error?.message?.includes("rate limit") || 
      error?.message?.includes("429") ||
      error?.message?.includes("Too Many Requests")) {
    return true;
  }
  
  return false;
}

/**
 * Get retry delay from rate limit error
 */
function getRetryDelay(error: any): number {
  // Check for Retry-After header
  if (error?.response?.headers) {
    const retryAfter = error.response.headers.get("Retry-After");
    if (retryAfter) {
      return parseInt(retryAfter, 10) * 1000; // convert to milliseconds
    }
  }
  
  // Default exponential backoff
  return 2000; // 2 seconds
}

/**
 * Rate-limited GraphQL wrapper
 * 
 * Wraps admin.graphql calls with rate limiting
 */
export async function rateLimitedGraphQL<T = any>(
  shopDomain: string,
  graphqlFn: () => Promise<Response>,
  query: string,
  options?: {
    maxRetries?: number;
    retryDelay?: number;
  }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const estimatedCost = estimateQueryCost(query);
  
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Wait for available tokens
      await waitForTokens(shopDomain, estimatedCost);
      
      // Make the request
      const response = await graphqlFn();
      
      // Check for rate limit errors in response
      if (response.status === 429) {
        const retryDelay = getRetryDelay({ response });
        console.warn(
          `[Rate Limiter] ${shopDomain}: Rate limited, waiting ${retryDelay}ms before retry`
        );
        
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        
        // Reduce tokens to prevent immediate retry
        const state = getRateLimitState(shopDomain);
        state.tokens = Math.max(0, state.tokens - estimatedCost);
        
        if (attempt < maxRetries) {
          continue; // Retry
        }
      }
      
      // Parse response
      const data = await response.json();
      
      // Update rate limit state based on actual cost if available
      // (Shopify includes this in response.extensions.cost)
      if (data.extensions?.cost) {
        const actualCost = data.extensions.cost.requestedQueryCost || estimatedCost;
        const state = getRateLimitState(shopDomain);
        // Adjust tokens if actual cost differs significantly
        if (Math.abs(actualCost - estimatedCost) > 5) {
          state.tokens += estimatedCost - actualCost;
        }
      }
      
      // Check for GraphQL errors
      if (data.errors) {
        const errorMessage = data.errors[0]?.message || "GraphQL error";
        throw new Error(errorMessage);
      }
      
      return data as T;
    } catch (error: any) {
      lastError = error;
      
      if (isRateLimitError(error)) {
        const retryDelay = getRetryDelay(error);
        console.warn(
          `[Rate Limiter] ${shopDomain}: Rate limit error, waiting ${retryDelay}ms (attempt ${attempt + 1}/${maxRetries + 1})`
        );
        
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        }
      }
      
      // For non-rate-limit errors, throw immediately
      if (!isRateLimitError(error)) {
        throw error;
      }
    }
  }
  
  // All retries exhausted
  throw new Error(
    `Rate limit exceeded after ${maxRetries + 1} attempts: ${lastError?.message || "Unknown error"}`
  );
}

/**
 * Reset rate limit state for a shop (useful for testing)
 */
export function resetRateLimitState(shopDomain: string): void {
  rateLimitStates.delete(shopDomain);
}

/**
 * Get current rate limit state for a shop (for debugging)
 */
export function getRateLimitInfo(shopDomain: string): {
  tokens: number;
  maxTokens: number;
  refillRate: number;
} {
  const state = getRateLimitState(shopDomain);
  refillTokens(state);
  
  return {
    tokens: state.tokens,
    maxTokens: state.maxTokens,
    refillRate: state.refillRate,
  };
}
