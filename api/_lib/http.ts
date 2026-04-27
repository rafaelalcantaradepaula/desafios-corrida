type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

function createHeaders(init?: HeadersInit) {
  return new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...Object.fromEntries(new Headers(init).entries()),
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

