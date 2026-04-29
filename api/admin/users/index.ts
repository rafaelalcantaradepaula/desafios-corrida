import {
  createAdminUserRecord,
  getAuthenticatedAdmin,
  hasUserDatabase,
  listAdminUsers,
} from "../../_lib/auth.js";
import {
  type ApiRequest,
  type ApiResponse,
  badRequest,
  methodNotAllowed,
  ok,
  readJsonBody,
  serverError,
  unauthorized,
} from "../../_lib/http.js";

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "GET" && request.method !== "POST") {
    methodNotAllowed(response, ["GET", "POST"]);
    return;
  }

  try {
    const admin = await getAuthenticatedAdmin(request);

    if (!admin) {
      unauthorized(response, "Sessao administrativa obrigatoria.");
      return;
    }

    if (request.method === "GET") {
      const users = await listAdminUsers();
      ok(response, {
        data: users,
      });
      return;
    }

    if (!hasUserDatabase()) {
      badRequest(response, "Banco de dados nao configurado para criar usuarios.");
      return;
    }

    const body = await readJsonBody<{
      name?: string;
      email?: string;
      password?: string;
    }>(request);

    const name = body?.name?.trim();
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password?.trim();

    if (!name || !email || !password) {
      badRequest(response, "Nome, email e senha sao obrigatorios.");
      return;
    }

    if (password.length < 8) {
      badRequest(response, "A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    const user = await createAdminUserRecord({
      name,
      email,
      password,
    });

    if (!user) {
      badRequest(response, "Nao foi possivel criar usuario. Verifique se o email ja existe.");
      return;
    }

    ok(response, {
      data: user,
    });
  } catch (error) {
    serverError(
      response,
      error instanceof Error
        ? `Falha ao processar usuarios: ${error.message}`
        : "Falha inesperada ao processar usuarios.",
    );
  }
}
