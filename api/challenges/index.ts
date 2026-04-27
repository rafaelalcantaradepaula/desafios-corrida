import { getAuthenticatedAdmin } from "../_lib/auth.js";
import {
  createChallengeRecord,
  listChallenges,
} from "../_lib/challenges.js";
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
  if (request.method !== "GET" && request.method !== "POST") {
    methodNotAllowed(response, ["GET", "POST"]);
    return;
  }

  try {
    if (request.method === "GET") {
      const challenges = await listChallenges();
      ok(response, {
        data: challenges,
      });
      return;
    }

    const admin = await getAuthenticatedAdmin(request);

    if (!admin) {
      unauthorized(response, "Sessao administrativa obrigatoria.");
      return;
    }

    const body = await readJsonBody<{
      title?: string;
      description?: string;
      type?: "pace" | "time";
    }>(request);

    const title = body?.title?.trim();
    const description = body?.description?.trim();
    const type = body?.type;

    if (!title || !description || (type !== "pace" && type !== "time")) {
      badRequest(response, "Title, description and type are required.");
      return;
    }

    const challenge = await createChallengeRecord({
      title,
      description,
      type,
    });

    ok(response, {
      data: challenge,
    });
  } catch (error) {
    serverError(
      response,
      error instanceof Error
        ? `Falha ao processar desafios: ${error.message}`
        : "Falha inesperada ao processar desafios.",
    );
  }
}
