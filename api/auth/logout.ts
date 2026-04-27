import { clearSessionCookie, deleteAdminSession } from "../_lib/auth";
import { methodNotAllowed, ok, serverError } from "../_lib/http";

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

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  try {
    await deleteAdminSession(getSessionToken(request.headers.get("cookie")));

    return ok(
      {
        success: true,
      },
      {
        headers: {
          "Set-Cookie": clearSessionCookie(),
        },
      },
    );
  } catch (error) {
    return serverError(
      error instanceof Error
        ? `Falha ao encerrar sessao: ${error.message}`
        : "Falha inesperada ao encerrar sessao.",
    );
  }
}
