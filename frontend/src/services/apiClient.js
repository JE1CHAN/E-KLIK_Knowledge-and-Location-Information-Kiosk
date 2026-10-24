const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
const DEFAULT_TIMEOUT_MS = 8000;

export class ApiError extends Error {
  constructor(message, { status = 0, code = "unknown" } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function apiRequest(
  path,
  { method = "GET", body, timeoutMs = DEFAULT_TIMEOUT_MS } = {},
) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const hasBody = body !== undefined;
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
      },
      body: hasBody ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const payload = await readJson(response);

    if (!response.ok) {
      const fallback =
        response.status >= 500
          ? "The E-KLIK server is unavailable."
          : `Request failed (${response.status}).`;
      throw new ApiError(payload?.error?.message ?? fallback, {
        status: response.status,
        code: payload?.error?.code ?? "http_error",
      });
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error?.name === "AbortError") {
      throw new ApiError("The server took too long to respond.", {
        code: "timeout",
      });
    }
    throw new ApiError("Cannot reach the E-KLIK server.", {
      code: "network_error",
    });
  } finally {
    window.clearTimeout(timer);
  }
}
