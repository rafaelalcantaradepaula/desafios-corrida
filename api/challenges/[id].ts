import {
  type ApiRequest,
  type ApiResponse,
  methodNotAllowed,
  notImplemented,
} from "../_lib/http.js";

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

  notImplemented(
    response,
    "Challenge details will be implemented in phase 4 after partial ranking rules are wired to the database.",
  );
}
