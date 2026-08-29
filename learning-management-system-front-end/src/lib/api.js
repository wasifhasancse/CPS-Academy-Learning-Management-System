/**
 * Resolves the base Strapi URL safely.
 * Strips trailing slashes and automatically upgrades http:// to https:// when running
 * in a secure browser context (preventing Mixed Content browser blocks in production).
 * @returns {string}
 */
export function getStrapiUrl() {
  let url = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    url.startsWith("http://") &&
    !url.includes("localhost") &&
    !url.includes("127.0.0.1")
  ) {
    url = url.replace(/^http:\/\//i, "https://");
  }
  return url.replace(/\/+$/, "");
}

/**
 * Custom API Error class with status code and details
 */
export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   * @param {Record<string, unknown>} [details]
   */
  constructor(message, status, details = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Retrieves the stored JWT token on the client side
 * @returns {string | null}
 */
export function getClientToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cps_jwt");
}

/**
 * Core fetch wrapper with Strapi headers and token injection
 * @param {string} endpoint - API path (e.g. '/api/courses' or 'courses')
 * @param {RequestInit & { token?: string }} [options]
 * @returns {Promise<unknown>}
 */
export async function fetchApi(endpoint, options = {}) {
  const { token, headers = {}, ...customConfig } = options;

  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullEndpoint = normalizedEndpoint.startsWith("/api")
    ? normalizedEndpoint
    : `/api${normalizedEndpoint}`;
  const baseUrl = getStrapiUrl();
  const url = `${baseUrl}${fullEndpoint}`;

  const resolvedToken = token || getClientToken();

  const defaultHeaders = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
    ...headers,
  };

  const config = {
    method: "GET",
    headers: defaultHeaders,
    cache: "no-store",
    ...customConfig,
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        `API request failed with HTTP ${response.status}`;
      throw new ApiError(errorMessage, response.status, data?.error?.details || data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error?.message || "Network connection error", 0);
  }
}

export const api = {
  get: (endpoint, options = {}) =>
    fetchApi(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options = {}) =>
    fetchApi(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: (endpoint, body, options = {}) =>
    fetchApi(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (endpoint, options = {}) =>
    fetchApi(endpoint, { ...options, method: "DELETE" }),
};
