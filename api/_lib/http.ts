type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

function normalizeHeaders(init?: HeadersInit) {
  const normalized: Record<string, string> = {};

  if (!init) {
    return normalized;
  }

  if (init instanceof Headers) {
    init.forEach((value, key) => {
      normalized[key] = value;
    });

    return normalized;
  }

  if (Array.isArray(init)) {
    for (const [key, value] of init) {
      normalized[key] = value;
    }

    return normalized;
  }

  return { ...init };
}

function createHeaders(init?: HeadersInit) {
  return new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...normalizeHeaders(init),
  });
}

export function json(status: number, body: JsonValue, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    status,
    headers: createHeaders(init?.headers),
  });
}

export function ok(body: JsonValue, init?: ResponseInit) {
  return json(200, body, init);
}

export function badRequest(message: string) {
  return json(400, {
    error: "bad_request",
    message,
  });
}

export function unauthorized(message = "Authentication required.") {
  return json(401, {
    error: "unauthorized",
    message,
  });
}

export function serverError(message = "Internal server error.") {
  return json(500, {
    error: "server_error",
    message,
  });
}

export function notImplemented(message: string) {
  return json(501, {
    error: "not_implemented",
    message,
  });
}

export function methodNotAllowed(allowedMethods: string[]) {
  return json(
    405,
    {
      error: "method_not_allowed",
      message: `Allowed methods: ${allowedMethods.join(", ")}`,
    },
    {
      headers: {
        Allow: allowedMethods.join(", "),
      },
    },
  );
}
