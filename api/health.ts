import { getServerEnv } from "./_lib/env.js";
import {
  type ApiRequest,
  type ApiResponse,
  methodNotAllowed,
  ok,
} from "./_lib/http.js";

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

  const env = getServerEnv();

  ok(response, {
    status: "ok",
    service: "desafios-corrida-api",
    databaseConfigured: env.hasDatabaseUrl,
    authConfigured: Boolean(env.authSecret && env.authUrl),
    timestamp: new Date().toISOString(),
  });
}
