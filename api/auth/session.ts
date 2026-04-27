import { getAuthenticatedAdmin } from "../_lib/auth";
import { methodNotAllowed, ok, serverError, unauthorized } from "../_lib/http";

export default async function handler(request: Request) {
  if (request.method !== "GET") {
    return methodNotAllowed(["GET"]);
  }

  try {
    const user = await getAuthenticatedAdmin(request);

    if (!user) {
      return unauthorized();
    }

    return ok({
      user,
    });
  } catch (error) {
    return serverError(
      error instanceof Error
        ? `Falha ao recuperar sessao: ${error.message}`
        : "Falha inesperada ao recuperar sessao.",
    );
  }
}
