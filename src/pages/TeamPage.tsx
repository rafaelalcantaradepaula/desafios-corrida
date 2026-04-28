import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FloatingNumberPicker from "@/components/FloatingNumberPicker";
import { useAuthSession } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import {
  addParticipant,
  loadTeamDetail,
  updateParticipantResult,
} from "@/lib/challenges";
import {
  formatChallengeTypeLabel,
  secondsToTimeParts,
  timePartsToSeconds,
} from "@/lib/format";
import type { TeamDetail, TimeParts } from "@/lib/types";

const hourOptions = Array.from({ length: 24 }, (_, index) =>
  index.toString().padStart(2, "0"),
);
const minuteSecondOptions = Array.from({ length: 60 }, (_, index) =>
  index.toString().padStart(2, "0"),
);
const paceMinuteOptions = Array.from({ length: 13 }, (_, index) =>
  index.toString().padStart(2, "0"),
);

export default function TeamPage() {
  const { challengeTeamId = "" } = useParams();
  const { user } = useAuthSession();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [participantName, setParticipantName] = useState("");
  const [resultForms, setResultForms] = useState<Record<string, TimeParts>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [savingParticipantId, setSavingParticipantId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchTeam() {
      setIsLoading(true);

      try {
        const data = await loadTeamDetail(challengeTeamId);

        if (!isMounted) {
          return;
        }

        setTeam(data);
        setErrorMessage("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setTeam(null);

        if (error instanceof ApiError && error.status === 404) {
          setErrorMessage("");
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar a equipe.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchTeam();

    return () => {
      isMounted = false;
    };
  }, [challengeTeamId]);

  useEffect(() => {
    if (!team) {
      setResultForms({});
      return;
    }

    setResultForms((currentForms) => {
      const nextForms: Record<string, TimeParts> = {};

      for (const participant of team.participants) {
        nextForms[participant.id] =
          currentForms[participant.id] ?? secondsToTimeParts(participant.resultSeconds);
      }

      return nextForms;
    });
  }, [team]);

  async function handleAddParticipant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!team || !participantName.trim()) {
      return;
    }

    setIsAddingParticipant(true);
    setErrorMessage("");
    setFeedbackMessage("");

    try {
      const updatedTeam = await addParticipant(team.id, participantName.trim());

      if (!updatedTeam) {
        setErrorMessage("Equipe nao encontrada para adicionar participante.");
        return;
      }

      setTeam(updatedTeam);
      setParticipantName("");
      setFeedbackMessage("Participante adicionado com sucesso.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel adicionar o participante.",
      );
    } finally {
      setIsAddingParticipant(false);
    }
  }

  async function handleSaveResult(participantId: string) {
    const parts = resultForms[participantId];
    const totalSeconds = parts ? timePartsToSeconds(parts) : null;

    if (totalSeconds === null) {
      setErrorMessage("Informe horas, minutos e segundos validos.");
      return;
    }

    setSavingParticipantId(participantId);
    setErrorMessage("");
    setFeedbackMessage("");

    try {
      const updatedTeam = await updateParticipantResult(participantId, totalSeconds);

      if (!updatedTeam) {
        setErrorMessage("Participante nao encontrado para atualizar resultado.");
        return;
      }

      setTeam(updatedTeam);
      setFeedbackMessage("Resultado individual atualizado.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel salvar o resultado.",
      );
    } finally {
      setSavingParticipantId(null);
    }
  }

  function updateResultField(
    participantId: string,
    field: keyof TimeParts,
    value: string,
  ) {
    setResultForms((currentForms) => ({
      ...currentForms,
      [participantId]: {
        hours: currentForms[participantId]?.hours ?? "00",
        minutes: currentForms[participantId]?.minutes ?? "00",
        seconds: currentForms[participantId]?.seconds ?? "00",
        [field]: value,
      },
    }));
  }

  if (errorMessage && !team && !isLoading) {
    return (
      <section className="empty-state">
        <h2 className="section-title">Falha ao carregar equipe</h2>
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
        <h2 className="section-title">Carregando equipe</h2>
        <p className="screen-subtitle">
          Estamos preparando a lista de participantes e seus resultados.
        </p>
      </section>
    );
  }

  if (!team) {
    return (
      <section className="empty-state">
        <h2 className="section-title">Equipe nao encontrada</h2>
        <p className="screen-subtitle">
          O identificador informado nao corresponde a uma equipe cadastrada.
        </p>
        <Link className="button button-primary" to="/">
          Voltar para a home
        </Link>
      </section>
    );
  }

  const adminActionHref = user
    ? `/admin?intent=participant-add&challengeTeamId=${encodeURIComponent(team.id)}`
    : `/login?redirect=${encodeURIComponent(`/admin?intent=participant-add&challengeTeamId=${team.id}`)}`;
  const minuteOptions =
    team.challengeType === "pace" ? paceMinuteOptions : minuteSecondOptions;
  const pickerRowClassName =
    team.challengeType === "time"
      ? "floating-picker-row floating-picker-row-three"
      : "floating-picker-row floating-picker-row-two";

  return (
    <div className="screen-stack">
      <section className="summary-card">
        <p className="card-kicker">{formatChallengeTypeLabel(team.challengeType)}</p>
        <h2 className="screen-title">{team.teamName}</h2>
      </section>

      <section className="section-block">
        <div className="section-head">
          <h3 className="section-title">{team.challengeTitle}</h3>

          {user ? (
            <form className="inline-form" onSubmit={handleAddParticipant}>
              <input
                className="field-input field-input-compact"
                onChange={(event) => setParticipantName(event.target.value)}
                placeholder="Nome do participante"
                value={participantName}
              />
              <button
                className="button button-secondary button-compact"
                disabled={isAddingParticipant || !participantName.trim()}
                type="submit"
              >
                {isAddingParticipant ? "Salvando..." : "Adicionar participante"}
              </button>
            </form>
          ) : (
            <Link className="button button-secondary" to={adminActionHref}>
              Adicionar participante
            </Link>
          )}
        </div>

        {feedbackMessage ? <p className="support-text">{feedbackMessage}</p> : null}
        {errorMessage ? (
          <p className="support-text support-text-error">{errorMessage}</p>
        ) : null}

        <div className="roster-list">
          {team.participants.map((participant) => {
            const parts = resultForms[participant.id] ?? secondsToTimeParts(0);

            return (
              <article className="roster-row roster-side" key={participant.id}>
                <div className="roster-copy">
                  <p className="roster-name">{participant.name}</p>
                </div>

                <div className="ranking-side">
                  <strong className="roster-result">{participant.resultLabel}</strong>

                  <div className={pickerRowClassName}>
                    {team.challengeType === "time" ? (
                      <FloatingNumberPicker
                        label="h"
                        onChange={(value) =>
                          updateResultField(participant.id, "hours", value)
                        }
                        options={hourOptions}
                        value={parts.hours}
                      />
                    ) : null}
                    <FloatingNumberPicker
                      label="m"
                      onChange={(value) =>
                        updateResultField(participant.id, "minutes", value)
                      }
                      options={minuteOptions}
                      value={parts.minutes}
                    />
                    <FloatingNumberPicker
                      label="s"
                      onChange={(value) =>
                        updateResultField(participant.id, "seconds", value)
                      }
                      options={minuteSecondOptions}
                      value={parts.seconds}
                    />
                  </div>

                  {user ? (
                    <button
                      className="button button-secondary button-compact"
                      disabled={savingParticipantId === participant.id}
                      onClick={() => void handleSaveResult(participant.id)}
                      type="button"
                    >
                      {savingParticipantId === participant.id ? "Salvando..." : "Salvar"}
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
