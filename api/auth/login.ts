import { methodNotAllowed, notImplemented } from "../_lib/http";

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  return notImplemented(
    "Administrative login will be implemented in phase 3 with Better Auth and server-side session validation.",
  );
}

