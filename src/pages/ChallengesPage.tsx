import { useEffect, useState } from "react";
import ChallengeCard from "@/components/ChallengeCard";
import { loadChallenges } from "@/lib/challenges";
import type { ChallengeSummary } from "@/lib/types";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchChallenges() {
      try {
        const data = await loadChallenges({
          scope: "all",
        });

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
            : "Nao foi possivel carregar a lista de desafios.",
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
      <section className="section-block">
        <div className="section-head">
          <h3 className="section-title">Todos os desafios</h3>
        </div>

        {errorMessage ? (
          <section className="empty-state">
            <h3 className="section-title">Nao foi possivel listar os desafios</h3>
            <p className="screen-subtitle">{errorMessage}</p>
          </section>
        ) : null}

        {!errorMessage && isLoading ? (
          <section className="empty-state">
            <h3 className="section-title">Carregando desafios</h3>
            <p className="screen-subtitle">
              Estamos buscando desafios ativos e inativos.
            </p>
          </section>
        ) : null}

        {!errorMessage && !isLoading && challenges.length === 0 ? (
          <section className="empty-state">
            <h3 className="section-title">Nenhum desafio cadastrado</h3>
          </section>
        ) : null}

        {!errorMessage && !isLoading && challenges.length > 0 ? (
          <div className="card-stack">
            {challenges.map((challenge) => (
              <ChallengeCard challenge={challenge} key={challenge.id} showStatusText />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
