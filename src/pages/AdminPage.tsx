import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  createChallenge,
  loadChallenges,
  loadTeamDetail,
} from "@/lib/challenges";
import { useAuthSession } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import type { ChallengeSummary, TeamDetail } from "@/lib/types";

function getIntentMessage(intent: string | null) {
  switch (intent) {
    case "challenge-create":
      return "Voce abriu o fluxo de criacao de desafio. Preencha o formulario para publicar um novo placar.";
    case "team-add":
      return "Voce veio para adicionar uma equipe. Escolha o desafio correto logo abaixo e siga para o ranking.";
    case "participant-add":
      return "Voce veio para adicionar participante ou resultado. Abra a equipe destacada e conclua o lancamento.";
    default:
      return "Sua sessao esta valida. Use este painel para criar desafios e retomar os fluxos administrativos do MVP.";
  }
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const [searchParams] = useSearchParams();
  const intent = searchParams.get("intent");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"pace" | "time">("pace");
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamDetail | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dashboardErrorMessage, setDashboardErrorMessage] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const challengeId = searchParams.get("challengeId");
  const challengeTeamId = searchParams.get("challengeTeamId");

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      setIsDashboardLoading(true);

      try {
        const [challengeList, teamDetail] = await Promise.all([
          loadChallenges(),
          challengeTeamId
            ? loadTeamDetail(challengeTeamId).catch((error) => {
                if (error instanceof ApiError && error.status === 404) {
                  return null;
                }

                throw error;
              })
            : Promise.resolve(null),
        ]);

        if (!isMounted) {
          return;
        }

        setChallenges(challengeList);
        setSelectedTeam(teamDetail);
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
  }, [challengeTeamId]);

  async function handleCreateChallenge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormErrorMessage("");
    setSuccessMessage("");

    try {
      const challenge = await createChallenge({
        title,
        description,
        type,
      });

      setSuccessMessage("Desafio criado com sucesso.");
      setTitle("");
      setDescription("");
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
      <section className="summary-card">
        <p className="card-kicker">Area administrativa</p>
        <h2 className="screen-title">Painel do administrador</h2>
        <p className="screen-subtitle">
          Logado como {user?.email}. {getIntentMessage(intent)}
        </p>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <p className="section-kicker">Atalhos</p>
            <h3 className="section-title">Fluxos disponiveis no MVP</h3>
          </div>
        </div>

        <div className="card-stack">
          <article className="challenge-card">
            <p className="card-kicker">Desafios</p>
            <h3 className="challenge-card-title">Criar e publicar desafios</h3>
            <p className="challenge-card-copy">
              O fluxo real da fase 4 ja cria desafios ativos via API.
            </p>
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

              <div className="actions-row">
                <Link className="button button-secondary" to="/">
                  Voltar para a home
                </Link>
                <button className="button button-primary" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Criando..." : "Criar desafio"}
                </button>
              </div>
            </form>

            {successMessage ? (
              <p className="support-text support-text-success">{successMessage}</p>
            ) : null}
            {formErrorMessage ? (
              <p className="support-text support-text-error">{formErrorMessage}</p>
            ) : null}
          </article>

          <article className="challenge-card">
            <p className="card-kicker">Operacao assistida</p>
            <h3 className="challenge-card-title">Retomar o proximo passo</h3>
            <p className="challenge-card-copy">
              Este bloco ajuda a retomar o fluxo de cadastro com base no contexto
              que trouxe voce ate o painel.
            </p>
            <div className="actions-row">
              {intent === "team-add" && challengeId ? (
                <Link className="button button-secondary" to={`/challenges/${challengeId}`}>
                  Abrir desafio selecionado
                </Link>
              ) : null}
              {intent === "participant-add" && selectedTeam ? (
                <Link className="button button-secondary" to={`/teams/${selectedTeam.id}`}>
                  Abrir equipe selecionada
                </Link>
              ) : null}
              {!intent || intent === "challenge-create" ? (
                <Link className="button button-secondary" to="/">
                  Voltar para a home
                </Link>
              ) : null}
            </div>
            {selectedTeam ? (
              <p className="support-text">
                Equipe em foco: {selectedTeam.teamName} no desafio {selectedTeam.challengeTitle}.
              </p>
            ) : null}
          </article>
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <div>
            <p className="section-kicker">Desafios ativos</p>
            <h3 className="section-title">Acompanhar e completar cadastros</h3>
          </div>

          <p className="section-note">
            {isDashboardLoading
              ? "Sincronizando painel."
              : `${challenges.length} desafio(s) ativos.`}
          </p>
        </div>

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
              const isHighlighted = challenge.id === challengeId;

              return (
                <article
                  className={isHighlighted ? "surface-card surface-card-accent" : "surface-card"}
                  key={challenge.id}
                >
                  <p className="card-kicker">{challenge.statusLabel}</p>
                  <h3 className="challenge-card-title">{challenge.title}</h3>
                  <p className="challenge-card-copy">{challenge.description}</p>
                  <p className="support-text">
                    {challenge.teamCount} equipe(s) - Lider: {challenge.leaderTeamName}
                  </p>

                  <div className="actions-row">
                    <Link className="button button-secondary button-compact" to={`/challenges/${challenge.id}`}>
                      Ver ranking
                    </Link>
                    <Link
                      className="button button-secondary button-compact"
                      to={`/admin?intent=team-add&challengeId=${encodeURIComponent(challenge.id)}`}
                    >
                      Preparar equipe
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
