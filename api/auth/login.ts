import { authenticateAdmin, createAdminSession } from "../_lib/auth.js";
import {
  type ApiRequest,
  type ApiResponse,
  badRequest,
  methodNotAllowed,
  ok,
  readJsonBody,
  serverError,
  unauthorized,
} from "../_lib/http.js";

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "POST") {
    methodNotAllowed(response, ["POST"]);
    return;
  }

  try {
    const body = (await readJsonBody<{
      email?: string;
      password?: string;
    }>(request)) as
      | { email?: string; password?: string }
      | null;

    const email = body?.email?.trim().toLowerCase();
    const password = body?.password?.trim();

    if (!email || !password) {
      badRequest(response, "Email and password are required.");
      return;
    }

    const user = await authenticateAdmin(email, password);

    if (!user) {
      unauthorized(response, "Credenciais administrativas invalidas.");
      return;
    }

    const session = await createAdminSession(user);

    ok(
      response,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
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
        ? `Falha ao autenticar no servidor: ${error.message}`
        : "Falha inesperada ao autenticar no servidor.",
    );
    return;
  }
}
