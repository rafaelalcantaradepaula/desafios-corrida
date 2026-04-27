import type { IncomingMessage, ServerResponse } from "node:http";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type ApiRequest = IncomingMessage & {
  body?: unknown;
};

export type ApiResponse = ServerResponse;

type ResponseHeaders = Record<string, string>;

function applyHeaders(response: ApiResponse, headers?: ResponseHeaders) {
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");

  for (const [key, value] of Object.entries(headers ?? {})) {
    response.setHeader(key, value);
  }
}

function parseJson<T>(raw: string): T | null {
  const trimmed = raw.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return null;
  }
}

export async function readJsonBody<T>(request: ApiRequest): Promise<T | null> {
  if (request.body !== undefined && request.body !== null) {
    if (typeof request.body === "string") {
      return parseJson<T>(request.body);
    }

    if (Buffer.isBuffer(request.body)) {
      return parseJson<T>(request.body.toString("utf-8"));
    }

    return request.body as T;
  }

  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return null;
  }

  return parseJson<T>(Buffer.concat(chunks).toString("utf-8"));
}

export function getHeader(request: ApiRequest, name: string) {
  const headerValue = request.headers[name.toLowerCase()];

  if (Array.isArray(headerValue)) {
    return headerValue.join("; ");
  }

  return headerValue ?? null;
}

export function getRequestUrl(request: ApiRequest) {
  const hostHeader = getHeader(request, "host") ?? "localhost";
  const protocol =
    request.headers["x-forwarded-proto"] === "https" ? "https" : "http";

  return new URL(request.url ?? "/", `${protocol}://${hostHeader}`);
}

export function json(
  response: ApiResponse,
  status: number,
  body: JsonValue,
  headers?: ResponseHeaders,
) {
  response.statusCode = status;
  applyHeaders(response, headers);
  response.end(JSON.stringify(body));
}

export function ok(response: ApiResponse, body: JsonValue, headers?: ResponseHeaders) {
  json(response, 200, body, headers);
}

export function badRequest(response: ApiResponse, message: string) {
  json(response, 400, {
    error: "bad_request",
    message,
  });
}

export function unauthorized(response: ApiResponse, message = "Authentication required.") {
  json(response, 401, {
    error: "unauthorized",
    message,
  });
}

export function notFound(response: ApiResponse, message = "Resource not found.") {
  json(response, 404, {
    error: "not_found",
    message,
  });
}

export function serverError(response: ApiResponse, message = "Internal server error.") {
  json(response, 500, {
    error: "server_error",
    message,
  });
}

export function notImplemented(response: ApiResponse, message: string) {
  json(response, 501, {
    error: "not_implemented",
    message,
  });
}

export function methodNotAllowed(response: ApiResponse, allowedMethods: string[]) {
  json(
    response,
    405,
    {
      error: "method_not_allowed",
      message: `Allowed methods: ${allowedMethods.join(", ")}`,
    },
    {
      Allow: allowedMethods.join(", "),
    },
  );
}
