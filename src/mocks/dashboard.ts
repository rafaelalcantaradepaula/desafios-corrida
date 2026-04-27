import { formatResultByType } from "@/lib/format";
import type { ChallengeDetail, ChallengeSummary, TeamDetail } from "@/lib/types";

export const mockChallenges: ChallengeSummary[] = [
  {
    id: "orla-5k",
    title: "Desafio Orla 5K",
    description: "Sprint de equipes com foco em constancia de pace na beira-mar.",
    type: "pace",
    status: "active",
    statusLabel: "Ativo",
    teamCount: 3,
    leaderTeamName: "Lobas do Asfalto",
    leaderResultLabel: "5:02 /km",
  },
  {
    id: "serra-21k",
    title: "Travessia Serra 21K",
    description: "Desafio de tempo acumulado para equipes de revezamento.",
    type: "time",
    status: "active",
    statusLabel: "Ativo",
    teamCount: 4,
    leaderTeamName: "Pulso Forte",
    leaderResultLabel: "03:51:42",
  },
];

const challengeDetails: Record<string, ChallengeDetail> = {
  "orla-5k": {
    ...mockChallenges[0],
    rankingTitle: "Ranking das equipes",
    rankingSummary: "A media de pace considera apenas participantes com resultado acima de zero.",
    teams: [
      {
        challengeTeamId: "lobas-asfalto",
        name: "Lobas do Asfalto",
        memberCount: 6,
        position: 1,
        resultSeconds: 302,
        resultLabel: "5:02 /km",
        highlight: "4 corredoras ja pontuaram",
      },
      {
        challengeTeamId: "passada-livre",
        name: "Passada Livre",
        memberCount: 5,
        position: 2,
        resultSeconds: 319,
        resultLabel: "5:19 /km",
        highlight: "3 corredores ja pontuaram",
      },
      {
        challengeTeamId: "ritmo-norte",
        name: "Ritmo Norte",
        memberCount: 5,
        position: 3,
        resultSeconds: 334,
        resultLabel: "5:34 /km",
        highlight: "2 corredores ja pontuaram",
      },
    ],
  },
  "serra-21k": {
    ...mockChallenges[1],
    rankingTitle: "Ranking das equipes",
    rankingSummary: "No tempo acumulado, todos os participantes entram na soma, inclusive os ainda sem resultado.",
    teams: [
      {
        challengeTeamId: "pulso-forte",
        name: "Pulso Forte",
        memberCount: 8,
        position: 1,
        resultSeconds: 13902,
        resultLabel: "03:51:42",
        highlight: "equipe completa",
      },
      {
        challengeTeamId: "kilometro-zero",
        name: "Kilometro Zero",
        memberCount: 8,
        position: 2,
        resultSeconds: 14148,
        resultLabel: "03:55:48",
        highlight: "1 atleta sem lancamento",
      },
      {
        challengeTeamId: "sopro-longo",
        name: "Sopro Longo",
        memberCount: 7,
        position: 3,
        resultSeconds: 14555,
        resultLabel: "04:02:35",
        highlight: "2 atletas sem lancamento",
      },
      {
        challengeTeamId: "subida-firme",
        name: "Subida Firme",
        memberCount: 7,
        position: 4,
        resultSeconds: 14988,
        resultLabel: "04:09:48",
        highlight: "resultado parcial",
      },
    ],
  },
};

const teamDetails: Record<string, TeamDetail> = {
  "lobas-asfalto": {
    id: "lobas-asfalto",
    challengeId: "orla-5k",
    challengeTitle: "Desafio Orla 5K",
    challengeType: "pace",
    teamName: "Lobas do Asfalto",
    participants: [
      { id: "la-1", name: "Bianca", resultSeconds: 295, resultLabel: formatResultByType("pace", 295) },
      { id: "la-2", name: "Camila", resultSeconds: 301, resultLabel: formatResultByType("pace", 301) },
      { id: "la-3", name: "Fernanda", resultSeconds: 308, resultLabel: formatResultByType("pace", 308) },
      { id: "la-4", name: "Marina", resultSeconds: 304, resultLabel: formatResultByType("pace", 304) },
      { id: "la-5", name: "Talita", resultSeconds: 0, resultLabel: formatResultByType("pace", 0) },
      { id: "la-6", name: "Yasmin", resultSeconds: 0, resultLabel: formatResultByType("pace", 0) },
    ],
  },
  "pulso-forte": {
    id: "pulso-forte",
    challengeId: "serra-21k",
    challengeTitle: "Travessia Serra 21K",
    challengeType: "time",
    teamName: "Pulso Forte",
    participants: [
      { id: "pf-1", name: "Aline", resultSeconds: 1710, resultLabel: formatResultByType("time", 1710) },
      { id: "pf-2", name: "Diego", resultSeconds: 1732, resultLabel: formatResultByType("time", 1732) },
      { id: "pf-3", name: "Guilherme", resultSeconds: 1754, resultLabel: formatResultByType("time", 1754) },
      { id: "pf-4", name: "Helena", resultSeconds: 1726, resultLabel: formatResultByType("time", 1726) },
      { id: "pf-5", name: "Joao", resultSeconds: 1740, resultLabel: formatResultByType("time", 1740) },
      { id: "pf-6", name: "Lara", resultSeconds: 1715, resultLabel: formatResultByType("time", 1715) },
      { id: "pf-7", name: "Nina", resultSeconds: 1750, resultLabel: formatResultByType("time", 1750) },
      { id: "pf-8", name: "Rafael", resultSeconds: 1775, resultLabel: formatResultByType("time", 1775) },
    ],
  },
};

export function getMockChallengeDetail(challengeId: string) {
  return challengeDetails[challengeId];
}

export function getMockTeamDetail(challengeTeamId: string) {
  return teamDetails[challengeTeamId];
}
