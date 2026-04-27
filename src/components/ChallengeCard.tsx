import { Link } from "react-router-dom";
import { formatChallengeTypeLabel } from "@/lib/format";
import type { ChallengeSummary } from "@/lib/types";
import MetricChip from "./MetricChip";

type ChallengeCardProps = {
  challenge: ChallengeSummary;
};

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  return (
    <article className="challenge-card">
      <div className="challenge-card-header">
        <div>
          <p className="card-kicker">{formatChallengeTypeLabel(challenge.type)}</p>
          <h2 className="challenge-card-title">{challenge.title}</h2>
        </div>

        <MetricChip text={challenge.statusLabel} tone="accent" />
      </div>

      <p className="challenge-card-copy">{challenge.description}</p>

      <div className="challenge-card-meta">
        <MetricChip text={`${challenge.teamCount} equipes`} />
        <MetricChip text={challenge.leaderResultLabel} />
      </div>

      <div className="challenge-card-footer">
        <div>
          <p className="leader-label">Lider parcial</p>
          <p className="leader-value">{challenge.leaderTeamName}</p>
        </div>

        <Link className="button button-secondary" to={`/challenges/${challenge.id}`}>
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}
