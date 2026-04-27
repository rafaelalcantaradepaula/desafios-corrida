import { getAuthenticatedAdmin } from "../../_lib/auth.js";
import { updateParticipantResultRecord } from "../../_lib/challenges.js";
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
  if (request.method !== "PATCH") {
    methodNotAllowed(response, ["PATCH"]);
    return;
  }

  try {
    const admin = await getAuthenticatedAdmin(request);

    if (!admin) {
      unauthorized(response, "Sessao administrativa obrigatoria.");
      return;
    }

    const segments = getRequestUrl(request).pathname.split("/").filter(Boolean);
    const participantId = segments.at(-2);
    const body = await readJsonBody<{ resultSeconds?: number }>(request);
    const resultSeconds = Number(body?.resultSeconds);

    if (
      !participantId ||
      !Number.isFinite(resultSeconds) ||
      resultSeconds < 0 ||
      !Number.isInteger(resultSeconds)
    ) {
      badRequest(response, "Participant id and a non-negative integer result are required.");
      return;
    }

    const team = await updateParticipantResultRecord(participantId, resultSeconds);

    if (!team) {
      notFound(response, "Participante nao encontrado.");
      return;
    }

    ok(response, {
      data: team,
    });
  } catch (error) {
    serverError(
      response,
      error instanceof Error
        ? `Falha ao atualizar resultado: ${error.message}`
        : "Falha inesperada ao atualizar resultado.",
    );
  }
}
