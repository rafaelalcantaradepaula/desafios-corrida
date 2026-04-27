import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MetricChip from "@/components/MetricChip";
import { useAuthSession } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { addTeam, loadChallengeDetail } from "@/lib/challenges";
import { formatChallengeTypeLabel } from "@/lib/format";
import type { ChallengeDetail } from "@/lib/types";

export default function ChallengePage() {
  const { challengeId = "" } = useParams();
  const { user } = useAuthSession();
  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [teamName, setTeamName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchChallenge() {
      setIsLoading(true);

      try {
        const data = await loadChallengeDetail(challengeId);

        if (!isMounted) {
          return;
        }

        setChallenge(data);
        setErrorMessage("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setChallenge(null);

        if (error instanceof ApiError && error.status === 404) {
          setErrorMessage("");
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar o desafio.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchChallenge();

    return () => {
      isMounted = false;
    };
  }, [challengeId]);

  async function handleAddTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!challenge || !teamName.trim()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setFeedbackMessage("");

    try {
      const updatedChallenge = await addTeam(challenge.id, teamName.trim());

      if (!updatedChallenge) {
        setErrorMessage("Desafio nao encontrado para adicionar equipe.");
        return;
      }

      setChallenge(updatedChallenge);
      setTeamName("");
      setFeedbackMessage("Equipe adicionada com sucesso.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel adicionar a equipe.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (errorMessage && !challenge && !isLoading) {
    return (
      <section className="empty-state">
        <h2 className="section-title">Falha ao carregar desafio</h2>
        <p className="screen-subtitle">{errorMessage}</p>
        <Link className="button button-primary" to="/">
          Voltar para a home
        </Link>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="empty-state">
        <h2 className="section-title">Carregando desafio</h2>
        <p className="screen-subtitle">
          Estamos montando o ranking atualizado das equipes.
        </p>
      </section>
    );
  }

  if (!challenge) {
    return (
      <section className="empty-state">
        <h2 className="section-title">Desafio nao encontrado</h2>
        <p className="screen-subtitle">
          O identificador informado nao corresponde a um desafio disponivel.
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

          {user ? (
            <form className="inline-form" onSubmit={handleAddTeam}>
              <input
                className="field-input field-input-compact"
                onChange={(event) => setTeamName(event.target.value)}
                placeholder="Nome da nova equipe"
                value={teamName}
              />
              <button
                className="button button-secondary button-compact"
                disabled={isSubmitting || !teamName.trim()}
                type="submit"
              >
                {isSubmitting ? "Salvando..." : "Adicionar equipe"}
              </button>
            </form>
          ) : (
            <Link className="button button-secondary" to={adminActionHref}>
              Adicionar equipe
            </Link>
          )}
        </div>

        <p className="page-note">{challenge.rankingSummary}</p>

        {feedbackMessage ? <p className="support-text">{feedbackMessage}</p> : null}
        {errorMessage ? (
          <p className="support-text support-text-error">{errorMessage}</p>
        ) : null}

        <div className="ranking-list">
          {challenge.teams.map((team) => (
            <article className="ranking-row" key={team.challengeTeamId}>
              <div className="ranking-place">{team.position}</div>

              <div className="ranking-copy">
                <p className="ranking-name">{team.name}</p>
                <p className="ranking-meta">
                  {team.memberCount} participantes - {team.highlight}
                </p>
              </div>

              <div className="ranking-side">
                <strong className="ranking-result">{team.resultLabel}</strong>
                <Link className="inline-link" to={`/teams/${team.challengeTeamId}`}>
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
