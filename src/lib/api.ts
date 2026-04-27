import { appEnv } from "./env";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function createApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${appEnv.apiBaseUrl}${normalizedPath}`;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(createApiUrl(path), {
    credentials: "include",
    ...init,
  });

  if (!response.ok) {
    let errorMessage = `API request failed with status ${response.status}`;
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (payload?.message) {
        errorMessage = payload.message;
      }
    }

    throw new ApiError(errorMessage, response.status);
  }

  return (await response.json()) as T;
}
