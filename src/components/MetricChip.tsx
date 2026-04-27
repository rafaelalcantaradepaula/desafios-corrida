type MetricChipProps = {
  tone?: "accent" | "neutral";
  text: string;
};

export default function MetricChip({
  tone = "neutral",
  text,
}: MetricChipProps) {
  const className =
    tone === "accent" ? "metric-chip metric-chip-accent" : "metric-chip";

  return <span className={className}>{text}</span>;
}

