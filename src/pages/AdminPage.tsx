import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createChallenge,
  loadChallenges,
} from "@/lib/challenges";
import { useAuthSession } from "@/lib/auth-context";
import type { ChallengeSummary } from "@/lib/types";

export default function AdminPage() {
  const navigate = useNavigate();
  useAuthSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"pace" | "time">("pace");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dashboardErrorMessage, setDashboardErrorMessage] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      setIsDashboardLoading(true);

      try {
        const challengeList = await loadChallenges();

        if (!isMounted) {
          return;
        }

        setChallenges(challengeList);
        setDashboardErrorMessage("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setDashboardErrorMessage(
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar o painel administrativo.",
        );
      } finally {
        if (isMounted) {
          setIsDashboardLoading(false);
        }
      }
    }

    void fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleCreateChallenge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormErrorMessage("");

    try {
      const challenge = await createChallenge({
        title,
        description,
        type,
      });

      setTitle("");
      setDescription("");
      setIsCreateOpen(false);
      navigate(`/challenges/${challenge.id}`);
    } catch (error) {
      setFormErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel criar o desafio.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="screen-stack">
      <section className="section-block">
        <div className="section-head">
          <h3 className="section-title">Desafios ativos</h3>
          <button
            className="button button-secondary button-compact"
            onClick={() => setIsCreateOpen((currentState) => !currentState)}
            type="button"
          >
            {isCreateOpen ? "Fechar" : "Novo desafio"}
          </button>
        </div>

        {isCreateOpen ? (
          <article className="form-card">
            <form className="form-stack" onSubmit={handleCreateChallenge}>
              <label className="field-group">
                <span className="field-label">Titulo</span>
                <input
                  className="field-input"
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex.: Corrida Central 10K"
                  value={title}
                />
              </label>

              <label className="field-group">
                <span className="field-label">Descricao</span>
                <textarea
                  className="field-input field-textarea"
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Descreva as regras e o contexto do desafio."
                  value={description}
                />
              </label>

              <label className="field-group">
                <span className="field-label">Tipo</span>
                <select
                  className="field-input"
                  onChange={(event) => setType(event.target.value as "pace" | "time")}
                  value={type}
                >
                  <option value="pace">Pace medio</option>
                  <option value="time">Tempo acumulado</option>
                </select>
              </label>

              <button className="button button-primary" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Criando..." : "Criar desafio"}
              </button>
            </form>

            {formErrorMessage ? (
              <p className="support-text support-text-error">{formErrorMessage}</p>
            ) : null}
          </article>
        ) : null}

        {isDashboardLoading ? (
          <section className="empty-state">
            <h3 className="section-title">Carregando painel</h3>
            <p className="screen-subtitle">
              Estamos buscando desafios ativos e atalhos administrativos.
            </p>
          </section>
        ) : null}

        {!isDashboardLoading && dashboardErrorMessage ? (
          <section className="empty-state">
            <h3 className="section-title">Falha ao abrir o painel</h3>
            <p className="screen-subtitle">{dashboardErrorMessage}</p>
          </section>
        ) : null}

        {!isDashboardLoading && !dashboardErrorMessage && challenges.length === 0 ? (
          <section className="empty-state">
            <h3 className="section-title">Nenhum desafio ativo</h3>
            <p className="screen-subtitle">
              Crie um desafio acima para liberar os fluxos de equipes e participantes.
            </p>
          </section>
        ) : null}

        {!isDashboardLoading && !dashboardErrorMessage && challenges.length > 0 ? (
          <div className="dashboard-grid">
            {challenges.map((challenge) => {
              return (
                <article
                  className="surface-card"
                  key={challenge.id}
                >
                  <h3 className="challenge-card-title">{challenge.title}</h3>
                  <div className="admin-card-copy">
                    <div>{challenge.teamCount} equipes</div>
                    <div>Lider: {challenge.leaderTeamName}</div>
                  </div>

                  <div className="actions-row">
                    <Link className="button button-secondary button-compact" to={`/challenges/${challenge.id}`}>
                      Editar
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}
