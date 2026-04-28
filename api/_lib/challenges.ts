import { randomUUID } from "node:crypto";
import { getDb } from "./db.js";
import { getServerEnv } from "./env.js";

type ChallengeType = "pace" | "time";
type ChallengeStatus = "draft" | "active" | "finished";

type ChallengeSummary = {
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

type TeamStanding = {
  challengeTeamId: string;
  name: string;
  memberCount: number;
  position: number;
  resultSeconds: number;
  resultLabel: string;
  highlight: string;
};

type ChallengeDetail = ChallengeSummary & {
  rankingTitle: string;
  rankingSummary: string;
  teams: TeamStanding[];
};

type Participant = {
  id: string;
  name: string;
  resultSeconds: number;
  resultLabel: string;
};

type TeamDetail = {
  id: string;
  challengeId: string;
  challengeTitle: string;
  challengeType: ChallengeType;
  teamName: string;
  participants: Participant[];
};

type ChallengeRow = {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  status: ChallengeStatus;
};

type RawStandingRow = {
  challenge_id: string;
  challenge_team_id: string;
  team_name: string;
  member_count: number | string;
  scored_count: number | string;
  total_seconds: number | string | null;
  avg_pace_seconds: number | string | null;
};

type RawTeamParticipantRow = {
  challenge_team_id: string;
  challenge_id: string;
  challenge_title: string;
  challenge_type: ChallengeType;
  team_name: string;
  participant_id: string | null;
  participant_name: string | null;
  result_seconds: number | string | null;
};

type RawChallengeTeamLookup = {
  id: string;
};

let dataBootstrapPromise: Promise<void> | null = null;

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

function formatClockUnit(value: number) {
  return value.toString().padStart(2, "0");
}

function formatDuration(seconds: number) {
  const normalized = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(normalized / 3600);
  const minutes = Math.floor((normalized % 3600) / 60);
  const remainder = normalized % 60;

  return `${formatClockUnit(hours)}:${formatClockUnit(minutes)}:${formatClockUnit(remainder)}`;
}

function formatPace(seconds: number) {
  const normalized = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(normalized / 60);
  const remainder = normalized % 60;

  return `${minutes}:${formatClockUnit(remainder)} /km`;
}

function formatResultLabel(type: ChallengeType, seconds: number, hasResult = true) {
  if (type === "pace") {
    return hasResult ? formatPace(seconds) : "Sem pace";
  }

  return formatDuration(seconds);
}

function getStatusLabel(status: ChallengeStatus) {
  switch (status) {
    case "active":
      return "Ativo";
    case "finished":
      return "Encerrado";
    default:
      return "Rascunho";
  }
}

function getRankingSummary(type: ChallengeType) {
  if (type === "pace") {
    return "A media de pace considera apenas participantes com resultado acima de zero.";
  }

  return "No tempo acumulado, todos os participantes entram na soma, inclusive os ainda sem resultado.";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function buildEntityId(prefix: string, seed: string) {
  const slug = slugify(seed) || prefix;
  return `${slug}-${randomUUID().slice(0, 8)}`;
}

async function runDataBootstrap() {
  const env = getServerEnv();

  if (!env.hasDatabaseUrl) {
    return;
  }

  const db = getDb();

  await db`
    CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('pace', 'time')),
      status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'finished')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS challenge_teams (
      id TEXT PRIMARY KEY,
      challenge_id TEXT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
      team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (challenge_id, team_id)
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      challenge_team_id TEXT NOT NULL REFERENCES challenge_teams(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      result_seconds INTEGER NOT NULL DEFAULT 0 CHECK (result_seconds >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db`
    CREATE INDEX IF NOT EXISTS challenge_teams_challenge_id_idx
    ON challenge_teams(challenge_id)
  `;

  await db`
    CREATE INDEX IF NOT EXISTS participants_challenge_team_id_idx
    ON participants(challenge_team_id)
  `;

  const challengeCountRows = (await db`
    SELECT COUNT(*) AS count
    FROM challenges
  `) as Array<{ count: number | string }>;

  if (Number(challengeCountRows[0]?.count ?? 0) > 0) {
    return;
  }

  await db`
    INSERT INTO challenges (id, title, description, type, status)
    VALUES
      ('orla-5k', 'Desafio Orla 5K', 'Sprint de equipes com foco em constancia de pace na beira-mar.', 'pace', 'active'),
      ('serra-21k', 'Travessia Serra 21K', 'Desafio de tempo acumulado para equipes de revezamento.', 'time', 'active')
  `;

  await db`
    INSERT INTO teams (id, name)
    VALUES
      ('team-lobas', 'Lobas do Asfalto'),
      ('team-passada', 'Passada Livre'),
      ('team-ritmo', 'Ritmo Norte'),
      ('team-pulso', 'Pulso Forte'),
      ('team-zero', 'Kilometro Zero'),
      ('team-sopro', 'Sopro Longo')
  `;

  await db`
    INSERT INTO challenge_teams (id, challenge_id, team_id)
    VALUES
      ('lobas-asfalto', 'orla-5k', 'team-lobas'),
      ('passada-livre', 'orla-5k', 'team-passada'),
      ('ritmo-norte', 'orla-5k', 'team-ritmo'),
      ('pulso-forte', 'serra-21k', 'team-pulso'),
      ('kilometro-zero', 'serra-21k', 'team-zero'),
      ('sopro-longo', 'serra-21k', 'team-sopro')
  `;

  await db`
    INSERT INTO participants (id, challenge_team_id, name, result_seconds)
    VALUES
      ('la-1', 'lobas-asfalto', 'Bianca', 295),
      ('la-2', 'lobas-asfalto', 'Camila', 301),
      ('la-3', 'lobas-asfalto', 'Fernanda', 308),
      ('la-4', 'lobas-asfalto', 'Marina', 304),
      ('la-5', 'lobas-asfalto', 'Talita', 0),
      ('la-6', 'lobas-asfalto', 'Yasmin', 0),
      ('pl-1', 'passada-livre', 'Ari', 318),
      ('pl-2', 'passada-livre', 'Caio', 320),
      ('pl-3', 'passada-livre', 'Duda', 319),
      ('pl-4', 'passada-livre', 'Enzo', 0),
      ('pl-5', 'passada-livre', 'Lia', 0),
      ('rn-1', 'ritmo-norte', 'Cesar', 332),
      ('rn-2', 'ritmo-norte', 'Mila', 336),
      ('rn-3', 'ritmo-norte', 'Nara', 0),
      ('rn-4', 'ritmo-norte', 'Otavio', 0),
      ('rn-5', 'ritmo-norte', 'Paula', 0),
      ('pf-1', 'pulso-forte', 'Aline', 1710),
      ('pf-2', 'pulso-forte', 'Diego', 1732),
      ('pf-3', 'pulso-forte', 'Guilherme', 1754),
      ('pf-4', 'pulso-forte', 'Helena', 1726),
      ('pf-5', 'pulso-forte', 'Joao', 1740),
      ('pf-6', 'pulso-forte', 'Lara', 1715),
      ('pf-7', 'pulso-forte', 'Nina', 1750),
      ('pf-8', 'pulso-forte', 'Rafael', 1775),
      ('kz-1', 'kilometro-zero', 'Bruno', 1760),
      ('kz-2', 'kilometro-zero', 'Clara', 1742),
      ('kz-3', 'kilometro-zero', 'Davi', 1780),
      ('kz-4', 'kilometro-zero', 'Eva', 1768),
      ('kz-5', 'kilometro-zero', 'Filipe', 1778),
      ('kz-6', 'kilometro-zero', 'Gabi', 0),
      ('kz-7', 'kilometro-zero', 'Ivo', 0),
      ('kz-8', 'kilometro-zero', 'Jade', 0),
      ('sl-1', 'sopro-longo', 'Karen', 1802),
      ('sl-2', 'sopro-longo', 'Leo', 1815),
      ('sl-3', 'sopro-longo', 'Marta', 1798),
      ('sl-4', 'sopro-longo', 'Noa', 1821),
      ('sl-5', 'sopro-longo', 'Pietra', 0),
      ('sl-6', 'sopro-longo', 'Rui', 0),
      ('sl-7', 'sopro-longo', 'Theo', 0)
  `;
}

async function ensureDataBootstrap() {
  if (!dataBootstrapPromise) {
    dataBootstrapPromise = runDataBootstrap().catch((error) => {
      dataBootstrapPromise = null;
      throw error;
    });
  }

  await dataBootstrapPromise;
}

function buildStandings(type: ChallengeType, rows: RawStandingRow[]): TeamStanding[] {
  const standings = rows.map((row) => {
    const memberCount = toNumber(row.member_count);
    const scoredCount = toNumber(row.scored_count);
    const totalSeconds = toNumber(row.total_seconds);
    const avgPaceSeconds = row.avg_pace_seconds === null ? null : Math.round(Number(row.avg_pace_seconds));
    const resultSeconds = type === "pace" ? avgPaceSeconds ?? 0 : totalSeconds;
    const hasPaceResult = type === "pace" ? scoredCount > 0 && avgPaceSeconds !== null : true;

    return {
      challengeTeamId: row.challenge_team_id,
      name: row.team_name,
      memberCount,
      position: 0,
      resultSeconds,
      resultLabel: formatResultLabel(type, resultSeconds, hasPaceResult),
      highlight:
        type === "pace"
          ? scoredCount > 0
            ? `${scoredCount} de ${memberCount} com pace`
            : "Aguardando paces"
          : `${scoredCount} de ${memberCount} resultados lancados`,
      _sortValue: type === "pace" && !hasPaceResult ? Number.POSITIVE_INFINITY : resultSeconds,
    };
  });

  standings.sort((left, right) => {
    if (left._sortValue !== right._sortValue) {
      return left._sortValue - right._sortValue;
    }

    return left.name.localeCompare(right.name);
  });

  return standings.map((team, index) => ({
    challengeTeamId: team.challengeTeamId,
    name: team.name,
    memberCount: team.memberCount,
    position: index + 1,
    resultSeconds: team.resultSeconds,
    resultLabel: team.resultLabel,
    highlight: team.highlight,
  }));
}

async function getChallengeRows(status?: ChallengeStatus) {
  await ensureDataBootstrap();

  const db = getDb();

  if (status) {
    return (await db`
      SELECT id, title, description, type, status
      FROM challenges
      WHERE status = ${status}
      ORDER BY created_at DESC, title ASC
    `) as ChallengeRow[];
  }

  return (await db`
    SELECT id, title, description, type, status
    FROM challenges
    ORDER BY created_at DESC, title ASC
  `) as ChallengeRow[];
}

async function getStandingRows(challengeIds: string[]) {
  if (challengeIds.length === 0) {
    return [] as RawStandingRow[];
  }

  const db = getDb();

  return (await db`
    SELECT
      ct.challenge_id,
      ct.id AS challenge_team_id,
      t.name AS team_name,
      COUNT(p.id) AS member_count,
      COUNT(CASE WHEN p.result_seconds > 0 THEN 1 END) AS scored_count,
      COALESCE(SUM(p.result_seconds), 0) AS total_seconds,
      AVG(CASE WHEN p.result_seconds > 0 THEN p.result_seconds END) AS avg_pace_seconds
    FROM challenge_teams ct
    INNER JOIN teams t ON t.id = ct.team_id
    LEFT JOIN participants p ON p.challenge_team_id = ct.id
    WHERE ct.challenge_id = ANY(${challengeIds})
    GROUP BY ct.challenge_id, ct.id, t.name
    ORDER BY t.name ASC
  `) as RawStandingRow[];
}

function buildChallengeSummary(
  challenge: ChallengeRow,
  standingRows: RawStandingRow[],
): ChallengeSummary {
  const teams = buildStandings(challenge.type, standingRows);
  const leader =
    challenge.type === "pace"
      ? teams.find((team) => team.resultLabel !== "Sem pace") ?? null
      : teams[0] ?? null;

  return {
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    type: challenge.type,
    status: challenge.status,
    statusLabel: getStatusLabel(challenge.status),
    teamCount: teams.length,
    leaderTeamName: leader?.name ?? (teams.length > 0 ? "Aguardando resultado" : "Aguardando equipes"),
    leaderResultLabel: leader?.resultLabel ?? (challenge.type === "pace" ? "Sem pace" : "00:00:00"),
  };
}

export async function listChallenges(scope: "active" | "all" = "active") {
  if (!getServerEnv().hasDatabaseUrl) {
    return [] as ChallengeSummary[];
  }

  const challenges =
    scope === "all" ? await getChallengeRows() : await getChallengeRows("active");
  const standingRows = await getStandingRows(challenges.map((challenge) => challenge.id));

  return challenges.map((challenge) =>
    buildChallengeSummary(
      challenge,
      standingRows.filter((row) => row.challenge_id === challenge.id),
    ),
  );
}

export async function getChallengeDetailById(challengeId: string) {
  if (!getServerEnv().hasDatabaseUrl) {
    return null;
  }

  const challengeRows = await getChallengeRows();
  const challenge = challengeRows.find((entry) => entry.id === challengeId);

  if (!challenge) {
    return null;
  }

  const standingRows = await getStandingRows([challenge.id]);
  const teams = buildStandings(challenge.type, standingRows);

  return {
    ...buildChallengeSummary(challenge, standingRows),
    rankingTitle: "Ranking das equipes",
    rankingSummary: getRankingSummary(challenge.type),
    teams,
  } as ChallengeDetail;
}

export async function getTeamDetailById(challengeTeamId: string) {
  if (!getServerEnv().hasDatabaseUrl) {
    return null;
  }

  await ensureDataBootstrap();

  const db = getDb();
  const rows = (await db`
    SELECT
      ct.id AS challenge_team_id,
      c.id AS challenge_id,
      c.title AS challenge_title,
      c.type AS challenge_type,
      t.name AS team_name,
      p.id AS participant_id,
      p.name AS participant_name,
      p.result_seconds
    FROM challenge_teams ct
    INNER JOIN challenges c ON c.id = ct.challenge_id
    INNER JOIN teams t ON t.id = ct.team_id
    LEFT JOIN participants p ON p.challenge_team_id = ct.id
    WHERE ct.id = ${challengeTeamId}
    ORDER BY p.name ASC NULLS LAST
  `) as RawTeamParticipantRow[];

  const firstRow = rows[0];

  if (!firstRow) {
    return null;
  }

  return {
    id: firstRow.challenge_team_id,
    challengeId: firstRow.challenge_id,
    challengeTitle: firstRow.challenge_title,
    challengeType: firstRow.challenge_type,
    teamName: firstRow.team_name,
    participants: rows
      .filter((row) => row.participant_id && row.participant_name)
      .map((row) => {
        const resultSeconds = toNumber(row.result_seconds);
        return {
          id: row.participant_id as string,
          name: row.participant_name as string,
          resultSeconds,
          resultLabel: formatResultLabel(firstRow.challenge_type, resultSeconds, resultSeconds > 0),
        };
      }),
  } as TeamDetail;
}

export async function createChallengeRecord(input: {
  title: string;
  description: string;
  type: ChallengeType;
}) {
  await ensureDataBootstrap();

  const db = getDb();
  const challengeId = buildEntityId("challenge", input.title);

  await db`
    INSERT INTO challenges (id, title, description, type, status)
    VALUES (${challengeId}, ${input.title}, ${input.description}, ${input.type}, 'active')
  `;

  return getChallengeDetailById(challengeId);
}

export async function addTeamToChallenge(challengeId: string, name: string) {
  await ensureDataBootstrap();

  const db = getDb();
  const challengeRows = (await db`
    SELECT id
    FROM challenges
    WHERE id = ${challengeId}
    LIMIT 1
  `) as RawChallengeTeamLookup[];

  if (!challengeRows[0]) {
    return null;
  }

  const teamId = buildEntityId("team", name);
  const challengeTeamId = buildEntityId("challenge-team", `${challengeId}-${name}`);

  await db`
    INSERT INTO teams (id, name)
    VALUES (${teamId}, ${name})
  `;

  await db`
    INSERT INTO challenge_teams (id, challenge_id, team_id)
    VALUES (${challengeTeamId}, ${challengeId}, ${teamId})
  `;

  return getChallengeDetailById(challengeId);
}

export async function addParticipantToTeam(challengeTeamId: string, name: string) {
  await ensureDataBootstrap();

  const db = getDb();
  const teamRows = (await db`
    SELECT id
    FROM challenge_teams
    WHERE id = ${challengeTeamId}
    LIMIT 1
  `) as RawChallengeTeamLookup[];

  if (!teamRows[0]) {
    return null;
  }

  const participantId = buildEntityId("participant", name);

  await db`
    INSERT INTO participants (id, challenge_team_id, name, result_seconds)
    VALUES (${participantId}, ${challengeTeamId}, ${name}, 0)
  `;

  return getTeamDetailById(challengeTeamId);
}

export async function updateParticipantResultRecord(
  participantId: string,
  resultSeconds: number,
) {
  await ensureDataBootstrap();

  const db = getDb();
  const participantRows = (await db`
    SELECT challenge_team_id
    FROM participants
    WHERE id = ${participantId}
    LIMIT 1
  `) as Array<{ challenge_team_id: string }>;

  const participant = participantRows[0];

  if (!participant) {
    return null;
  }

  await db`
    UPDATE participants
    SET result_seconds = ${resultSeconds},
        updated_at = NOW()
    WHERE id = ${participantId}
  `;

  return getTeamDetailById(participant.challenge_team_id);
}
