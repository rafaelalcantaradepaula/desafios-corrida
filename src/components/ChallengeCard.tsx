import { Link } from "react-router-dom";
import { formatChallengeTypeLabel } from "@/lib/format";
import type { ChallengeSummary } from "@/lib/types";

type ChallengeCardProps = {
  challenge: ChallengeSummary;
  showStatusText?: boolean;
};

export default function ChallengeCard({
  challenge,
  showStatusText = false,
}: ChallengeCardProps) {
  return (
    <article className="challenge-card">
      <div className="challenge-card-header">
        <div>
          {showStatusText ? (
            <p className="challenge-card-state">{challenge.statusLabel}</p>
          ) : null}
          <h2 className="challenge-card-title">{challenge.title}</h2>
        </div>
      </div>

      <div className="challenge-card-meta challenge-card-meta-split">
        <div className="challenge-card-summary">
          <span className="challenge-card-text">{formatChallengeTypeLabel(challenge.type)}</span>
          <span className="challenge-card-text">{challenge.teamCount} equipes</span>
          <span className="challenge-card-text">{challenge.leaderTeamName}</span>
        </div>

        <div className="challenge-card-action">
          <strong className="challenge-card-result">{challenge.leaderResultLabel}</strong>
          <Link
            className="button button-secondary button-compact challenge-card-open"
            to={`/challenges/${challenge.id}`}
          >
            abrir
          </Link>
        </div>
      </div>
    </article>
  );
}
