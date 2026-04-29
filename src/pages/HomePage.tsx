import { useEffect, useState } from "react";
import ChallengeCard from "@/components/ChallengeCard";
import { ChallengeCardSkeleton } from "@/components/LoadingSkeletons";
import { loadChallenges } from "@/lib/challenges";
import type { ChallengeSummary } from "@/lib/types";

export default function HomePage() {
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

        {!errorMessage && isLoading ? <ChallengeCardSkeleton /> : null}

        {!errorMessage && !isLoading && challenges.length === 0 ? (
          <section className="empty-state">
            <h3 className="section-title">Nenhum desafio ativo</h3>
          </section>
        ) : null}

        {!errorMessage && !isLoading && challenges.length > 0 ? (
          <div className="card-stack">
            {challenges.map((challenge, index) => (
              <ChallengeCard
                challenge={challenge}
                featured={index === 0}
                key={`desafio-${index + 1}`}
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
