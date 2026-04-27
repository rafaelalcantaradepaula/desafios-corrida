import { clearSessionCookie, deleteAdminSession } from "../_lib/auth.js";
import {
  type ApiRequest,
  type ApiResponse,
  methodNotAllowed,
  ok,
  serverError,
} from "../_lib/http.js";

function getSessionToken(header: string | null) {
  if (!header) {
    return null;
  }

  const parts = header.split(";").map((item) => item.trim());
  const entry = parts.find((item) => item.startsWith("dc_admin_session="));

  if (!entry) {
    return null;
  }

  return decodeURIComponent(entry.slice("dc_admin_session=".length));
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "POST") {
    methodNotAllowed(response, ["POST"]);
    return;
  }

  try {
    const cookieHeader = Array.isArray(request.headers.cookie)
      ? request.headers.cookie.join("; ")
      : request.headers.cookie ?? null;

    await deleteAdminSession(getSessionToken(cookieHeader));

    ok(
      response,
      {
        success: true,
      },
      {
        "Set-Cookie": clearSessionCookie(),
      },
    );
    return;
  } catch (error) {
    serverError(
      response,
      error instanceof Error
        ? `Falha ao encerrar sessao: ${error.message}`
        : "Falha inesperada ao encerrar sessao.",
    );
    return;
  }
}
