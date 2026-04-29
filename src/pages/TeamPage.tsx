import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FloatingNumberPicker from "@/components/FloatingNumberPicker";
import { RosterSkeleton, SummarySkeleton } from "@/components/LoadingSkeletons";
import { useAuthSession } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import {
  addParticipant,
  loadTeamDetail,
  updateParticipantResult,
} from "@/lib/challenges";
import { useToast } from "@/lib/toast-context";
import {
  formatChallengeTypeLabel,
  formatResultByType,
  secondsToTimeParts,
  timePartsToSeconds,
} from "@/lib/format";
import type { ChallengeType, TeamDetail, TimeParts } from "@/lib/types";

const hourOptions = Array.from({ length: 24 }, (_, index) =>
  index.toString().padStart(2, "0"),
);
const minuteSecondOptions = Array.from({ length: 60 }, (_, index) =>
  index.toString().padStart(2, "0"),
);
const paceMinuteOptions = Array.from({ length: 13 }, (_, index) =>
  index.toString().padStart(2, "0"),
);

function serializeTimeParts(parts: TimeParts) {
  return `${parts.hours}:${parts.minutes}:${parts.seconds}`;
}

function formatPreviewLabel(challengeType: ChallengeType, parts: TimeParts) {
  const totalSeconds = timePartsToSeconds(parts) ?? 0;
  const hasResult = totalSeconds > 0;
  return formatResultByType(challengeType, totalSeconds, hasResult);
}

function formatStopwatchPreviewLabel(challengeType: ChallengeType, parts: TimeParts) {
  if (challengeType === "pace") {
    return `${parts.minutes}:${parts.seconds}`;
  }

  return `${parts.hours}:${parts.minutes}:${parts.seconds}`;
}

export default function TeamPage() {
  const { challengeTeamId = "" } = useParams();
  const { user } = useAuthSession();
  const { showToast } = useToast();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [participantName, setParticipantName] = useState("");
  const [resultForms, setResultForms] = useState<Record<string, TimeParts>>({});
  const [savedResultForms, setSavedResultForms] = useState<Record<string, TimeParts>>({});
  const [expandedParticipantId, setExpandedParticipantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [savingParticipantIds, setSavingParticipantIds] = useState<Record<string, boolean>>({});
  const [failedSaveKeys, setFailedSaveKeys] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const autoSaveTimersRef = useRef<Record<string, number>>({});

  function clearAutoSaveTimer(participantId: string) {
    const timer = autoSaveTimersRef.current[participantId];

    if (timer !== undefined) {
      window.clearTimeout(timer);
      delete autoSaveTimersRef.current[participantId];
    }
  }

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
      setSavedResultForms({});
      setExpandedParticipantId(null);
      return;
    }

    setSavedResultForms(
      Object.fromEntries(
        team.participants.map((participant) => [
          participant.id,
          secondsToTimeParts(participant.resultSeconds),
        ]),
      ),
    );

    setResultForms((currentForms) => {
      const nextForms: Record<string, TimeParts> = {};

      for (const participant of team.participants) {
        nextForms[participant.id] =
          currentForms[participant.id] ?? secondsToTimeParts(participant.resultSeconds);
      }

      return nextForms;
    });

    setExpandedParticipantId((currentParticipantId) => {
      if (
        currentParticipantId &&
        team.participants.some((participant) => participant.id === currentParticipantId)
      ) {
        return currentParticipantId;
      }

      return user ? (team.participants[0]?.id ?? null) : null;
    });
  }, [team, user]);

  async function saveParticipantResult(participantId: string) {
    clearAutoSaveTimer(participantId);

    const parts = resultForms[participantId];
    const totalSeconds = parts ? timePartsToSeconds(parts) : null;
    const currentKey = parts ? serializeTimeParts(parts) : "";

    if (totalSeconds === null) {
      setErrorMessage("Informe horas, minutos e segundos validos.");
      return;
    }

    setSavingParticipantIds((currentState) => ({
      ...currentState,
      [participantId]: true,
    }));
    setErrorMessage("");

    try {
      const updatedTeam = await updateParticipantResult(participantId, totalSeconds);

      if (!updatedTeam) {
        setFailedSaveKeys((currentState) => ({
          ...currentState,
          [participantId]: currentKey,
        }));
        showToast("Participante nao encontrado para atualizar resultado.", "error");
        return;
      }

      setTeam(updatedTeam);
      setFailedSaveKeys((currentState) => {
        const nextState = { ...currentState };
        delete nextState[participantId];
        return nextState;
      });
    } catch (error) {
      setFailedSaveKeys((currentState) => ({
        ...currentState,
        [participantId]: currentKey,
      }));
      showToast(
        error instanceof Error
          ? error.message
          : "Nao foi possivel salvar o resultado.",
        "error",
      );
    } finally {
      setSavingParticipantIds((currentState) => {
        const nextState = { ...currentState };
        delete nextState[participantId];
        return nextState;
      });
    }
  }

  useEffect(() => {
    return () => {
      for (const timer of Object.values(autoSaveTimersRef.current)) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  useEffect(() => {
    if (!team || !user) {
      return;
    }

    for (const participant of team.participants) {
      const participantId = participant.id;
      const currentParts = resultForms[participantId];
      const savedParts = savedResultForms[participantId];

      clearAutoSaveTimer(participantId);

      if (!currentParts || !savedParts || savingParticipantIds[participantId]) {
        continue;
      }

      const currentKey = serializeTimeParts(currentParts);
      const savedKey = serializeTimeParts(savedParts);

      if (currentKey === savedKey || failedSaveKeys[participantId] === currentKey) {
        continue;
      }

      autoSaveTimersRef.current[participantId] = window.setTimeout(() => {
        void saveParticipantResult(participantId);
      }, 900);
    }
  }, [team, user, resultForms, savedResultForms, savingParticipantIds, failedSaveKeys]);

  async function handleAddParticipant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!team || !participantName.trim()) {
      return;
    }

    setIsAddingParticipant(true);
    setErrorMessage("");

    try {
      const nextParticipantName = participantName.trim();
      const updatedTeam = await addParticipant(team.id, nextParticipantName);

      if (!updatedTeam) {
        showToast("Equipe nao encontrada para adicionar participante.", "error");
        return;
      }

      setTeam(updatedTeam);
      setExpandedParticipantId(
        updatedTeam.participants.find((participant) => participant.name === nextParticipantName)?.id
          ?? updatedTeam.participants[0]?.id
          ?? null,
      );
      setParticipantName("");
      showToast("Participante adicionado.", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Nao foi possivel adicionar o participante.",
        "error",
      );
    } finally {
      setIsAddingParticipant(false);
    }
  }

  function updateResultField(
    participantId: string,
    field: keyof TimeParts,
    value: string,
  ) {
    clearAutoSaveTimer(participantId);
    setFailedSaveKeys((currentState) => {
      if (!(participantId in currentState)) {
        return currentState;
      }

      const nextState = { ...currentState };
      delete nextState[participantId];
      return nextState;
    });
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
      <div className="screen-stack">
        <SummarySkeleton />
        <RosterSkeleton />
      </div>
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
  const canEditParticipants = Boolean(user);

  return (
    <div className="screen-stack">
      <section className={`summary-card summary-card-compact summary-card-tone-${team.challengeType}`}>
        <p className="card-kicker">{formatChallengeTypeLabel(team.challengeType)}</p>
        <h2 className="screen-title">{team.teamName}</h2>
        <div className="summary-strip">
          <div className="summary-pill summary-pill-wide">
            <span className="summary-pill-label">Desafio</span>
            <strong className="summary-pill-value">{team.challengeTitle}</strong>
          </div>
          <div className="summary-pill">
            <span className="summary-pill-label">Atletas</span>
            <strong className="summary-pill-value">{team.participants.length}</strong>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-head">
          <h3 className="section-title">Participantes</h3>

          {canEditParticipants ? (
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

        {errorMessage ? (
          <p className="support-text support-text-error">{errorMessage}</p>
        ) : null}

        <div className="roster-list">
          {team.participants.map((participant) => {
            const parts = resultForms[participant.id] ?? secondsToTimeParts(0);
            const savedParts =
              savedResultForms[participant.id] ?? secondsToTimeParts(participant.resultSeconds);
            const previewLabel = formatPreviewLabel(team.challengeType, parts);
            const stopwatchPreviewLabel = formatStopwatchPreviewLabel(team.challengeType, parts);
            const isExpanded = expandedParticipantId === participant.id;
            const isSaving = Boolean(savingParticipantIds[participant.id]);
            const isDirty = serializeTimeParts(parts) !== serializeTimeParts(savedParts);
            const failedSaveKey = failedSaveKeys[participant.id];
            const participantStatus = isSaving
              ? "salvando"
              : failedSaveKey && failedSaveKey === serializeTimeParts(parts)
                ? "falha no auto-save"
              : isDirty
                ? "auto-save pendente"
                : participant.resultSeconds > 0
                  ? "salvo"
                  : team.challengeType === "pace"
                    ? "aguardando pace"
                    : "aguardando tempo";

            if (!canEditParticipants) {
              return (
                <article className="roster-card roster-card-static" key={participant.id}>
                  <div className="roster-static-row">
                    <div className="roster-copy">
                      <p className="roster-name">{participant.name}</p>
                      <p className="roster-meta">{participantStatus}</p>
                    </div>

                    <strong className="roster-result">{previewLabel}</strong>
                  </div>
                </article>
              );
            }

            return (
              <article className={`roster-card ${isExpanded ? "roster-card-open" : ""}`} key={participant.id}>
                <button
                  className="roster-toggle"
                  onClick={() =>
                    setExpandedParticipantId((currentParticipantId) =>
                      currentParticipantId === participant.id ? null : participant.id,
                    )
                  }
                  type="button"
                >
                  <div className="roster-copy">
                    <p className="roster-name">{participant.name}</p>
                    <p className="roster-meta">{participantStatus}</p>
                  </div>

                  <div className="roster-headside">
                    <strong className="roster-result">{previewLabel}</strong>
                    <span
                      aria-hidden="true"
                      className={`roster-chevron ${isExpanded ? "roster-chevron-open" : ""}`}
                    />
                  </div>
                </button>

                {isExpanded ? (
                  <div className="roster-editor">
                    <div className="stopwatch-panel">
                      <div className="stopwatch-preview">
                        <span className="summary-pill-label">
                          {team.challengeType === "pace" ? "mm:ss" : "hh:mm:ss"}
                        </span>
                        <strong className="stopwatch-preview-value">
                          {stopwatchPreviewLabel}
                        </strong>
                      </div>

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
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
