import type { ChallengeType, TimeParts } from "./types";

function formatClockUnit(value: number) {
  return value.toString().padStart(2, "0");
}

export function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;

  return `${formatClockUnit(hours)}:${formatClockUnit(minutes)}:${formatClockUnit(remainder)}`;
}

export function formatPace(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${minutes}:${formatClockUnit(remainder)} /km`;
}

export function formatChallengeTypeLabel(type: ChallengeType) {
  return type === "pace" ? "Pace medio" : "Tempo acumulado";
}

export function formatResultByType(
  type: ChallengeType,
  seconds: number,
  hasResult = true,
) {
  if (type === "pace") {
    return hasResult ? formatPace(seconds) : "Sem pace";
  }

  return formatDuration(seconds);
}

export function secondsToTimeParts(totalSeconds: number): TimeParts {
  const normalized = Math.max(0, Math.floor(totalSeconds));

  return {
    hours: formatClockUnit(Math.floor(normalized / 3600)),
    minutes: formatClockUnit(Math.floor((normalized % 3600) / 60)),
    seconds: formatClockUnit(normalized % 60),
  };
}

export function timePartsToSeconds(parts: TimeParts) {
  const hours = Number(parts.hours || "0");
  const minutes = Number(parts.minutes || "0");
  const seconds = Number(parts.seconds || "0");

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    !Number.isFinite(seconds) ||
    hours < 0 ||
    minutes < 0 ||
    seconds < 0
  ) {
    return null;
  }

  return Math.floor(hours * 3600 + minutes * 60 + seconds);
}
