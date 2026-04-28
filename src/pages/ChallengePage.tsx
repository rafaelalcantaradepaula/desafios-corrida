import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { RankingSkeleton, SummarySkeleton } from "@/components/LoadingSkeletons";
import { useAuthSession } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { addTeam, loadChallengeDetail } from "@/lib/challenges";
import { useToast } from "@/lib/toast-context";
import { formatChallengeTypeLabel } from "@/lib/format";
import type { ChallengeDetail } from "@/lib/types";

function getRankingRowClassName(position: number) {
  const classNames = ["ranking-row", "ranking-row-link"];

  if (position === 1) {
    classNames.push("ranking-row-leader");
  }

  if (position <= 3) {
    classNames.push(`ranking-row-podium-${position}`);
  }

  return classNames.join(" ");
}

function getRankingPlaceClassName(position: number) {
  const classNames = ["ranking-place"];

  if (position <= 3) {
    classNames.push(`ranking-place-podium-${position}`);
  }

  return classNames.join(" ");
}

function getStandingResultLabel(challengeType: ChallengeDetail["type"], resultLabel: string) {
  if (challengeType === "time" && resultLabel === "00:00:00") {
    return "Aguardando tempo";
  }

  if (challengeType === "pace" && resultLabel === "Sem pace") {
    return "Aguardando pace";
  }

  return resultLabel;
}

export default function ChallengePage() {
  const { challengeId = "" } = useParams();
  const { user } = useAuthSession();
  const { showToast } = useToast();
  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [teamName, setTeamName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

    try {
      const updatedChallenge = await addTeam(challenge.id, teamName.trim());

      if (!updatedChallenge) {
        showToast("Desafio nao encontrado para adicionar equipe.", "error");
        return;
      }

      setChallenge(updatedChallenge);
      setTeamName("");
      showToast("Equipe adicionada.", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Nao foi possivel adicionar a equipe.",
        "error",
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
      <div className="screen-stack">
        <SummarySkeleton />
        <RankingSkeleton />
      </div>
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
      <section className={`summary-card summary-card-compact summary-card-tone-${challenge.type}`}>
        <p className="card-kicker">{formatChallengeTypeLabel(challenge.type)}</p>
        <h2 className="screen-title">{challenge.title}</h2>

        <div className="summary-strip">
          <div className="summary-pill">
            <span className="summary-pill-label">Equipes</span>
            <strong className="summary-pill-value">{challenge.teamCount}</strong>
          </div>
          <div className="summary-pill">
            <span className="summary-pill-label">Lider</span>
            <strong className="summary-pill-value">{challenge.leaderTeamName}</strong>
          </div>
          <div className="summary-pill">
            <span className="summary-pill-label">Parcial</span>
            <strong className="summary-pill-value">
              {getStandingResultLabel(challenge.type, challenge.leaderResultLabel)}
            </strong>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <h3 className="section-title">{challenge.rankingTitle}</h3>

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

        {errorMessage ? (
          <p className="support-text support-text-error">{errorMessage}</p>
        ) : null}

        <div className="ranking-list">
          {challenge.teams.map((team) => (
            <Link
              className={getRankingRowClassName(team.position)}
              key={team.challengeTeamId}
              to={`/teams/${team.challengeTeamId}`}
            >
              <div className={getRankingPlaceClassName(team.position)}>{team.position}</div>

              <div className="ranking-copy">
                <p className="ranking-name">{team.name}</p>
                <p className="ranking-meta">
                  {team.memberCount} participantes - {team.highlight}
                </p>
              </div>

              <div className="ranking-side">
                <strong className="ranking-result">
                  {getStandingResultLabel(challenge.type, team.resultLabel)}
                </strong>
                <span className="inline-link">abrir equipe</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
