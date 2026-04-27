import { authenticateAdmin, createAdminSession } from "../_lib/auth";
import {
  badRequest,
  methodNotAllowed,
  ok,
  serverError,
  unauthorized,
} from "../_lib/http";

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  try {
    const body = (await request.json().catch(() => null)) as
      | { email?: string; password?: string }
      | null;

    const email = body?.email?.trim().toLowerCase();
    const password = body?.password?.trim();

    if (!email || !password) {
      return badRequest("Email and password are required.");
    }

    const user = await authenticateAdmin(email, password);

    if (!user) {
      return unauthorized("Credenciais administrativas invalidas.");
    }

    const session = await createAdminSession(user.id);

    return ok(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      {
        headers: {
          "Set-Cookie": session.cookie,
        },
      },
    );
  } catch (error) {
    return serverError(
      error instanceof Error
        ? `Falha ao autenticar no servidor: ${error.message}`
        : "Falha inesperada ao autenticar no servidor.",
    );
  }
}
