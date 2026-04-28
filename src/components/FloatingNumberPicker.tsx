import type { KeyboardEvent } from "react";

type FloatingNumberPickerProps = {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
};

export default function FloatingNumberPicker({
  label,
  onChange,
  options,
  value,
}: FloatingNumberPickerProps) {
  const selectedIndex = Math.max(0, options.indexOf(value));
  const canDecrease = selectedIndex > 0;
  const canIncrease = selectedIndex < options.length - 1;

  function updateAtIndex(nextIndex: number) {
    const nextValue = options[nextIndex];

    if (nextValue) {
      onChange(nextValue);
    }
  }

  function handleStep(direction: "up" | "down") {
    if (direction === "up" && canIncrease) {
      updateAtIndex(selectedIndex + 1);
      return;
    }

    if (direction === "down" && canDecrease) {
      updateAtIndex(selectedIndex - 1);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowUp" || event.key === "ArrowRight") {
      event.preventDefault();
      handleStep("up");
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
      event.preventDefault();
      handleStep("down");
    }
  }

  return (
    <div
      aria-label={`Seletor de ${label}`}
      className="floating-picker"
      role="group"
    >
      <button
        aria-label={`Aumentar ${label}`}
        className="floating-picker-arrow"
        disabled={!canIncrease}
        onClick={() => handleStep("up")}
        type="button"
      >
        <span aria-hidden="true">▲</span>
      </button>

      <button
        aria-label={`Valor atual de ${label}`}
        className="floating-picker-trigger"
        onKeyDown={handleKeyDown}
        type="button"
      >
        <span className="floating-picker-value">{value}</span>
        <span className="floating-picker-unit">{label}</span>
      </button>

      <button
        aria-label={`Diminuir ${label}`}
        className="floating-picker-arrow"
        disabled={!canDecrease}
        onClick={() => handleStep("down")}
        type="button"
      >
        <span aria-hidden="true">▼</span>
      </button>
    </div>
  );
}
