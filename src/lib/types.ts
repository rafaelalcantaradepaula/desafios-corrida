export type ChallengeType = "pace" | "time";
export type ChallengeStatus = "draft" | "active" | "finished";

export type ChallengeSummary = {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  status: ChallengeStatus;
  statusLabel: string;
  teamCount: number;
  leaderTeamName: string;
  leaderResultLabel: string;
};

export type TeamStanding = {
  challengeTeamId: string;
  name: string;
  memberCount: number;
  position: number;
  resultSeconds: number;
  resultLabel: string;
  highlight: string;
};

export type ChallengeDetail = ChallengeSummary & {
  rankingTitle: string;
  rankingSummary: string;
  teams: TeamStanding[];
};

export type Participant = {
  id: string;
  name: string;
  resultSeconds: number;
  resultLabel: string;
};

export type TimeParts = {
  hours: string;
  minutes: string;
  seconds: string;
};

export type TeamDetail = {
  id: string;
  challengeId: string;
  challengeTitle: string;
  challengeType: ChallengeType;
  teamName: string;
  participants: Participant[];
};
