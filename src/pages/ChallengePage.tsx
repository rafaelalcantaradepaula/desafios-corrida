import { Link, useParams } from "react-router-dom";
import { useAuthSession } from "@/lib/auth-context";
import MetricChip from "@/components/MetricChip";
import { formatChallengeTypeLabel } from "@/lib/format";
import { getMockChallengeDetail } from "@/mocks/dashboard";

export default function ChallengePage() {
  const { challengeId = "" } = useParams();
  const challenge = getMockChallengeDetail(challengeId);
  const { user } = useAuthSession();

  if (!challenge) {
    return (
      <section className="empty-state">
        <h2 className="section-title">Desafio nao encontrado</h2>
        <p className="screen-subtitle">
          O scaffold da fase 2 inclui apenas desafios demonstrativos para
          navegacao e validacao visual.
        </p>
        <Link className="button button-primary" to="/">
          Voltar para a home
        </Link>
      </section>
    );
  }

  const adminActionHref = user
    ? `/admin?intent=team-add&challengeId=${encodeURIComponent(challenge.id)}`
    : `/login?redirect=${encodeURIComponent(`/admin?intent=team-add&challengeId=${challenge.id}`)}`;

  return (
    <div className="screen-stack">
      <section className="summary-card">
        <div className="challenge-card-header">
          <div>
            <p className="card-kicker">{formatChallengeTypeLabel(challenge.type)}</p>
            <h2 className="screen-title">{challenge.title}</h2>
          </div>

          <MetricChip text={challenge.statusLabel} tone="accent" />
        </div>

        <p className="screen-subtitle">{challenge.description}</p>

        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Tipo do desafio</span>
            <strong className="summary-value">
              {formatChallengeTypeLabel(challenge.type)}
            </strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">Equipes</span>
            <strong className="summary-value">{challenge.teamCount}</strong>
          </div>
          <div className="summary-item">
            <span className="summary-label">Lider parcial</span>
            <strong className="summary-value">{challenge.leaderTeamName}</strong>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <p className="section-kicker">Tela principal do desafio</p>
            <h3 className="section-title">{challenge.rankingTitle}</h3>
          </div>

          <Link className="button button-secondary" to={adminActionHref}>
            Adicionar equipe
          </Link>
        </div>

        <p className="page-note">{challenge.rankingSummary}</p>

        <div className="ranking-list">
          {challenge.teams.map((team) => (
            <article className="ranking-row" key={team.challengeTeamId}>
              <div className="ranking-place">{team.position}</div>

              <div className="ranking-copy">
                <p className="ranking-name">{team.name}</p>
                <p className="ranking-meta">
                  {team.memberCount} participantes • {team.highlight}
                </p>
              </div>

              <div className="ranking-side">
                <strong className="ranking-result">{team.resultLabel}</strong>
                <Link
                  className="inline-link"
                  to={`/teams/${team.challengeTeamId}`}
                >
                  Abrir equipe
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
