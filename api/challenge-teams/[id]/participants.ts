import { getAuthenticatedAdmin } from "../../_lib/auth.js";
import { addParticipantToTeam } from "../../_lib/challenges.js";
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
    const challengeTeamId = segments.at(-2);
    const body = await readJsonBody<{ name?: string }>(request);
    const name = body?.name?.trim();

    if (!challengeTeamId || !name) {
      badRequest(response, "Challenge team id and participant name are required.");
      return;
    }

    const team = await addParticipantToTeam(challengeTeamId, name);

    if (!team) {
      notFound(response, "Equipe nao encontrada.");
      return;
    }

    ok(response, {
      data: team,
    });
  } catch (error) {
    serverError(
      response,
      error instanceof Error
        ? `Falha ao adicionar participante: ${error.message}`
        : "Falha inesperada ao adicionar participante.",
    );
  }
}
