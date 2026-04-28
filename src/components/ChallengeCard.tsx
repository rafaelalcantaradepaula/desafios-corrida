import { Link } from "react-router-dom";
import { formatChallengeTypeLabel } from "@/lib/format";
import type { ChallengeSummary } from "@/lib/types";

type ChallengeCardProps = {
  challenge: ChallengeSummary;
  featured?: boolean;
  showStatusText?: boolean;
};

function getResultLabel(challenge: ChallengeSummary) {
  if (challenge.type === "time" && challenge.leaderResultLabel === "00:00:00") {
    return "Aguardando tempo";
  }

  if (challenge.type === "pace" && challenge.leaderResultLabel === "Sem pace") {
    return "Aguardando pace";
  }

  return challenge.leaderResultLabel;
}

export default function ChallengeCard({
  challenge,
  featured = false,
  showStatusText = false,
}: ChallengeCardProps) {
  const resultLabel = getResultLabel(challenge);

  return (
    <Link
      className={`challenge-card challenge-card-link challenge-card-${challenge.type} ${featured ? "challenge-card-featured" : ""}`}
      to={`/challenges/${challenge.id}`}
    >
      <div className="challenge-card-header">
        <div>
          {showStatusText ? (
            <p className={`challenge-card-state challenge-card-state-${challenge.status}`}>
              {challenge.statusLabel}
            </p>
          ) : null}
          <h2 className="challenge-card-title">{challenge.title}</h2>
        </div>

        <span className={`challenge-card-type challenge-card-type-${challenge.type}`}>
          {formatChallengeTypeLabel(challenge.type)}
        </span>
      </div>

      <div className="challenge-card-primary">
        <div className="challenge-card-leading">
          {challenge.status === "active" ? (
            <span className="challenge-card-live">
              <span className="challenge-card-live-dot" />
              parcial
            </span>
          ) : null}
          <strong className="challenge-card-result">{resultLabel}</strong>
        </div>
        <span className="button button-secondary button-compact challenge-card-open">
          abrir
        </span>
      </div>

      <p className="challenge-card-track">
        <span>{challenge.leaderTeamName}</span>
        <span className="challenge-card-separator" />
        <span>{challenge.teamCount} equipes</span>
      </p>
    </Link>
  );
}
