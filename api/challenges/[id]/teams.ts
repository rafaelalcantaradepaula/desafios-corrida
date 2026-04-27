import { getAuthenticatedAdmin } from "../../_lib/auth.js";
import { addTeamToChallenge } from "../../_lib/challenges.js";
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
  if (request.method !== "POST") {
    methodNotAllowed(response, ["POST"]);
    return;
  }

  try {
    const admin = await getAuthenticatedAdmin(request);

    if (!admin) {
      unauthorized(response, "Sessao administrativa obrigatoria.");
      return;
    }

    const segments = getRequestUrl(request).pathname.split("/").filter(Boolean);
    const challengeId = segments.at(-2);
    const body = await readJsonBody<{ name?: string }>(request);
    const name = body?.name?.trim();

    if (!challengeId || !name) {
      badRequest(response, "Challenge id and team name are required.");
      return;
    }

    const challenge = await addTeamToChallenge(challengeId, name);

    if (!challenge) {
      notFound(response, "Desafio nao encontrado.");
      return;
    }

    ok(response, {
      data: challenge,
    });
  } catch (error) {
    serverError(
      response,
      error instanceof Error
        ? `Falha ao adicionar equipe: ${error.message}`
        : "Falha inesperada ao adicionar equipe.",
    );
  }
}
