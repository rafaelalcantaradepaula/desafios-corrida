import { getServerEnv } from "../_lib/env.js";
import {
  type ApiRequest,
  type ApiResponse,
  methodNotAllowed,
  ok,
} from "../_lib/http.js";

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

  const env = getServerEnv();

  ok(response, {
    data: [],
    meta: {
      phase: 2,
      source: env.hasDatabaseUrl ? "database_pending" : "mock_pending_env",
      message:
        "Challenge listing will be implemented in phase 4 after schema and authentication are in place.",
    },
  });
}
