import { getAuthenticatedAdmin } from "../_lib/auth";
import { methodNotAllowed, ok, unauthorized } from "../_lib/http";

export default async function handler(request: Request) {
  if (request.method !== "GET") {
    return methodNotAllowed(["GET"]);
  }

  const user = await getAuthenticatedAdmin(request);

  if (!user) {
    return unauthorized();
  }

  return ok({
    user,
  });
}
