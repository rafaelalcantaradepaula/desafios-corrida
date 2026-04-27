import { appEnv } from "./env";
import { apiFetch } from "./api";
import type { ChallengeDetail, ChallengeSummary, TeamDetail } from "./types";
import {
  getMockChallengeDetail,
  getMockTeamDetail,
  mockChallenges,
} from "@/mocks/dashboard";

type ApiEnvelope<T> = {
  data: T;
};

export async function loadChallenges() {
  try {
    const response = await apiFetch<ApiEnvelope<ChallengeSummary[]>>("/challenges");
    return response.data;
  } catch (error) {
    if (appEnv.useMockData) {
      return mockChallenges;
    }

    throw error;
  }
}

export async function loadChallengeDetail(challengeId: string) {
  try {
    const response = await apiFetch<ApiEnvelope<ChallengeDetail | null>>(
      `/challenges/${challengeId}`,
    );
    return response.data;
  } catch (error) {
    if (appEnv.useMockData) {
      return getMockChallengeDetail(challengeId) ?? null;
    }

    throw error;
  }
}

export async function loadTeamDetail(challengeTeamId: string) {
  try {
    const response = await apiFetch<ApiEnvelope<TeamDetail | null>>(
      `/challenge-teams/${challengeTeamId}`,
    );
    return response.data;
  } catch (error) {
    if (appEnv.useMockData) {
      return getMockTeamDetail(challengeTeamId) ?? null;
    }

    throw error;
  }
}

export async function createChallenge(input: {
  title: string;
  description: string;
  type: "pace" | "time";
}) {
  const response = await apiFetch<ApiEnvelope<ChallengeDetail>>("/challenges", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return response.data;
}

export async function addTeam(challengeId: string, name: string) {
  const response = await apiFetch<ApiEnvelope<ChallengeDetail | null>>(
    `/challenges/${challengeId}/teams`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ name }),
    },
  );

  return response.data;
}

export async function addParticipant(challengeTeamId: string, name: string) {
  const response = await apiFetch<ApiEnvelope<TeamDetail | null>>(
    `/challenge-teams/${challengeTeamId}/participants`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ name }),
    },
  );

  return response.data;
}

export async function updateParticipantResult(
  participantId: string,
  resultSeconds: number,
) {
  const response = await apiFetch<ApiEnvelope<TeamDetail | null>>(
    `/participants/${participantId}/result`,
    {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ resultSeconds }),
    },
  );

  return response.data;
}
