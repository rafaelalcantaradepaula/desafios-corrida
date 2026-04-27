import { getAuthenticatedAdmin } from "../_lib/auth.js";
import {
  type ApiRequest,
  type ApiResponse,
  methodNotAllowed,
  ok,
  serverError,
  unauthorized,
} from "../_lib/http.js";

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

  try {
    const user = await getAuthenticatedAdmin(request);

    if (!user) {
      unauthorized(response);
      return;
    }

    ok(response, {
      user,
    });
    return;
  } catch (error) {
    serverError(
      response,
      error instanceof Error
        ? `Falha ao recuperar sessao: ${error.message}`
        : "Falha inesperada ao recuperar sessao.",
    );
    return;
  }
}
