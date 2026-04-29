import { useEffect, useState } from "react";
import ChallengeCard from "@/components/ChallengeCard";
import { ChallengeCardSkeleton } from "@/components/LoadingSkeletons";
import { loadChallenges } from "@/lib/challenges";
import type { ChallengeSummary } from "@/lib/types";

type ChallengeFilter = "active" | "finished" | "all";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);
  const [filter, setFilter] = useState<ChallengeFilter>("all");
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

  const filteredChallenges = challenges.filter((challenge) => {
    if (filter === "all") {
      return true;
    }

    if (filter === "finished") {
      return challenge.status === "finished";
    }

    return challenge.status === "active";
  });

  const emptyFilterTitle =
    filter === "finished"
      ? "Nenhum desafio encerrado"
      : filter === "active"
        ? "Nenhum desafio ativo"
        : "Nenhum desafio cadastrado";

  return (
    <div className="screen-stack">
      <section className="section-block">
        <div className="section-head">
          <h3 className="section-title">Todos os desafios</h3>
        </div>

        <div className="segment-control" role="tablist" aria-label="Filtrar desafios">
          <button
            aria-pressed={filter === "active"}
            className={`segment-button ${filter === "active" ? "segment-button-active" : ""}`}
            onClick={() => setFilter("active")}
            type="button"
          >
            Ativos
          </button>
          <button
            aria-pressed={filter === "finished"}
            className={`segment-button ${filter === "finished" ? "segment-button-active" : ""}`}
            onClick={() => setFilter("finished")}
            type="button"
          >
            Encerrados
          </button>
          <button
            aria-pressed={filter === "all"}
            className={`segment-button ${filter === "all" ? "segment-button-active" : ""}`}
            onClick={() => setFilter("all")}
            type="button"
          >
            Todos
          </button>
        </div>

        {errorMessage ? (
          <section className="empty-state">
            <h3 className="section-title">Nao foi possivel listar os desafios</h3>
            <p className="screen-subtitle">{errorMessage}</p>
          </section>
        ) : null}

        {!errorMessage && isLoading ? <ChallengeCardSkeleton /> : null}

        {!errorMessage && !isLoading && filteredChallenges.length === 0 ? (
          <section className="empty-state">
            <h3 className="section-title">{emptyFilterTitle}</h3>
          </section>
        ) : null}

        {!errorMessage && !isLoading && filteredChallenges.length > 0 ? (
          <div className="card-stack">
            {filteredChallenges.map((challenge, index) => (
              <ChallengeCard
                challenge={challenge}
                key={`desafio-${index + 1}`}
                showStatusText
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
