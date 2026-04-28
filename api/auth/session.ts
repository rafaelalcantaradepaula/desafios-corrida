import {
  clearSessionCookie,
  readAuthenticatedAdminSession,
} from "../_lib/auth.js";
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
    const session = await readAuthenticatedAdminSession(request);

    if (!session) {
      unauthorized(response, "Sessao administrativa expirada.", {
        "Set-Cookie": clearSessionCookie(),
      });
      return;
    }

    ok(
      response,
      {
        user: session.user,
      },
      {
        "Set-Cookie": session.cookie,
      },
    );
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
