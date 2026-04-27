import { getServerEnv } from "./_lib/env.js";
import { methodNotAllowed, ok } from "./_lib/http.js";

export default async function handler(request: Request) {
  if (request.method !== "GET") {
    return methodNotAllowed(["GET"]);
  }

  const env = getServerEnv();

  return ok({
    status: "ok",
    service: "desafios-corrida-api",
    databaseConfigured: env.hasDatabaseUrl,
    authConfigured: Boolean(env.authSecret && env.authUrl),
    timestamp: new Date().toISOString(),
  });
}
