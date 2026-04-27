import { getServerEnv } from "../_lib/env";
import { methodNotAllowed, ok } from "../_lib/http";

export default async function handler(request: Request) {
  if (request.method !== "GET") {
    return methodNotAllowed(["GET"]);
  }

  const env = getServerEnv();

  return ok({
    data: [],
    meta: {
      phase: 2,
      source: env.hasDatabaseUrl ? "database_pending" : "mock_pending_env",
      message:
        "Challenge listing will be implemented in phase 4 after schema and authentication are in place.",
    },
  });
}

