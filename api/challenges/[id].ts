import { methodNotAllowed, notImplemented } from "../_lib/http.js";

export default async function handler(request: Request) {
  if (request.method !== "GET") {
    return methodNotAllowed(["GET"]);
  }

  return notImplemented(
    "Challenge details will be implemented in phase 4 after partial ranking rules are wired to the database.",
  );
}
