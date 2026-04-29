import { getAuthenticatedAdmin } from "../_lib/auth.js";
import {
  deleteChallengeRecord,
  getChallengeDetailById,
  updateChallengeStatusRecord,
} from "../_lib/challenges.js";
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
} from "../_lib/http.js";

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (
    request.method !== "GET" &&
    request.method !== "PATCH" &&
    request.method !== "DELETE"
  ) {
    methodNotAllowed(response, ["GET", "PATCH", "DELETE"]);
    return;
  }

  try {
    const segments = getRequestUrl(request).pathname.split("/").filter(Boolean);
    const challengeId = segments.at(-1);

    if (!challengeId) {
      serverError(response, "Challenge id not provided.");
      return;
    }

    if (request.method === "PATCH" || request.method === "DELETE") {
      const admin = await getAuthenticatedAdmin(request);

      if (!admin) {
        unauthorized(response, "Sessao administrativa obrigatoria.");
        return;
      }

      if (request.method === "DELETE") {
        const wasDeleted = await deleteChallengeRecord(challengeId);

        if (!wasDeleted) {
          notFound(response, "Desafio nao encontrado.");
          return;
        }

        ok(response, {
          success: true,
        });
        return;
      }

      const body = await readJsonBody<{ status?: string }>(request);
      const status = body?.status;

      if (status !== "active" && status !== "finished") {
        badRequest(response, "Status must be active or finished.");
        return;
      }

      const challenge = await updateChallengeStatusRecord(challengeId, status);

      if (!challenge) {
        notFound(response, "Desafio nao encontrado.");
        return;
      }

      ok(response, {
        data: challenge,
      });
      return;
    }

    const detail = await getChallengeDetailById(challengeId);

    if (!detail) {
      notFound(response, "Desafio nao encontrado.");
      return;
    }

    ok(response, {
      data: detail,
    });
  } catch (error) {
    serverError(
      response,
      error instanceof Error
        ? `Falha ao carregar desafio: ${error.message}`
        : "Falha inesperada ao carregar desafio.",
    );
  }
}
