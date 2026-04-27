import type { ChallengeType } from "./types";

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

export function formatResultByType(type: ChallengeType, seconds: number) {
  return type === "pace" ? formatPace(seconds) : formatDuration(seconds);
}

