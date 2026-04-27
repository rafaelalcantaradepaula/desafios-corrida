import { getTeamDetailById } from "../_lib/challenges.js";
import {
  type ApiRequest,
  type ApiResponse,
  getRequestUrl,
  methodNotAllowed,
  notFound,
  ok,
  serverError,
} from "../_lib/http.js";

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

  try {
    const segments = getRequestUrl(request).pathname.split("/").filter(Boolean);
    const challengeTeamId = segments.at(-1);

    if (!challengeTeamId) {
      serverError(response, "Challenge team id not provided.");
      return;
    }

    const team = await getTeamDetailById(challengeTeamId);

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
        ? `Falha ao carregar equipe: ${error.message}`
        : "Falha inesperada ao carregar equipe.",
    );
  }
}
