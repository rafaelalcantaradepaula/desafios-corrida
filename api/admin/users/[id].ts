import {
  deleteAdminUserRecord,
  getAuthenticatedAdmin,
  hasUserDatabase,
  updateAdminUserRecord,
} from "../../_lib/auth.js";
import {
  type ApiRequest,
  type ApiResponse,
  badRequest,
  getRequestUrl,
  methodNotAllowed,
  notFound,
  ok,
  readJsonBody,
  serverError,
  unauthorized,
} from "../../_lib/http.js";

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "PATCH" && request.method !== "DELETE") {
    methodNotAllowed(response, ["PATCH", "DELETE"]);
    return;
  }

  try {
    const admin = await getAuthenticatedAdmin(request);

    if (!admin) {
      unauthorized(response, "Sessao administrativa obrigatoria.");
      return;
    }

    if (!hasUserDatabase()) {
      badRequest(response, "Banco de dados nao configurado para gerir usuarios.");
      return;
    }

    const segments = getRequestUrl(request).pathname.split("/").filter(Boolean);
    const userId = segments.at(-1);

    if (!userId) {
      badRequest(response, "User id is required.");
      return;
    }

    if (request.method === "DELETE") {
      if (userId === admin.id) {
        badRequest(response, "Nao e possivel excluir o usuario da sessao atual.");
        return;
      }

      const wasDeleted = await deleteAdminUserRecord(userId);

      if (!wasDeleted) {
        notFound(response, "Usuario nao encontrado.");
        return;
      }

      ok(response, {
        success: true,
      });
      return;
    }

    const body = await readJsonBody<{
      name?: string;
      password?: string;
    }>(request);

    const name = body?.name?.trim();
    const password = body?.password?.trim();

    if (!name && !password) {
      badRequest(response, "Informe nome ou senha para atualizar.");
      return;
    }

    if (password && password.length < 8) {
      badRequest(response, "A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    const user = await updateAdminUserRecord(userId, {
      name,
      password,
    });

    if (!user) {
      notFound(response, "Usuario nao encontrado.");
      return;
    }

    ok(response, {
      data: user,
    });
  } catch (error) {
    serverError(
      response,
      error instanceof Error
        ? `Falha ao atualizar usuario: ${error.message}`
        : "Falha inesperada ao atualizar usuario.",
    );
  }
}
