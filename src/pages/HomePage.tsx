import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ChallengeCard from "@/components/ChallengeCard";
import { useAuthSession } from "@/lib/auth-context";
import { loadChallenges } from "@/lib/challenges";
import type { ChallengeSummary } from "@/lib/types";

export default function HomePage() {
  const { user } = useAuthSession();
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const adminActionHref = user
    ? "/admin?intent=challenge-create"
    : `/login?redirect=${encodeURIComponent("/admin?intent=challenge-create")}`;
  const featuredChallenge = challenges[0] ?? null;

  useEffect(() => {
    let isMounted = true;

    async function fetchChallenges() {
      try {
        const data = await loadChallenges();

        if (!isMounted) {
          return;
        }

        setChallenges(data);
        setErrorMessage("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setChallenges([]);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar os desafios ativos.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchChallenges();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="screen-stack">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">App esportivo</p>
          <h2 className="screen-title">Acompanhe quem puxa o pelotao</h2>
        </div>

        <div className="actions-row">
          <Link
            className="button button-primary"
            to={featuredChallenge ? `/challenges/${featuredChallenge.id}` : "/"}
          >
            {featuredChallenge ? "Ver desafio em destaque" : "Aguardando desafios"}
          </Link>
          <Link className="button button-secondary" to={adminActionHref}>
            Novo desafio
          </Link>
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <h3 className="section-title">Desafios ativos</h3>
        </div>

        {errorMessage ? (
          <section className="empty-state">
            <h3 className="section-title">Nao foi possivel abrir a largada</h3>
            <p className="screen-subtitle">{errorMessage}</p>
          </section>
        ) : null}

        {!errorMessage && isLoading ? (
          <section className="empty-state">
            <h3 className="section-title">Carregando desafios</h3>
            <p className="screen-subtitle">
              Estamos consultando o ranking parcial das equipes.
            </p>
          </section>
        ) : null}

        {!errorMessage && !isLoading && challenges.length === 0 ? (
          <section className="empty-state">
            <h3 className="section-title">Nenhum desafio ativo</h3>
            <p className="screen-subtitle">
              Crie o primeiro desafio na area administrativa para publicar um placar.
            </p>
            <Link className="button button-secondary" to={adminActionHref}>
              Ir para o admin
            </Link>
          </section>
        ) : null}

        {!errorMessage && !isLoading && challenges.length > 0 ? (
          <div className="card-stack">
            {challenges.map((challenge) => (
              <ChallengeCard challenge={challenge} key={challenge.id} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
