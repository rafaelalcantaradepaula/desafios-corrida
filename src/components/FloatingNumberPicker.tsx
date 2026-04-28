import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";

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
  const holdDelayRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<number | null>(null);
  const selectedIndex = Math.max(0, options.indexOf(value));
  const canDecrease = selectedIndex > 0;
  const canIncrease = selectedIndex < options.length - 1;
  const maxDigits = Math.max(...options.map((option) => option.length));
  const minValue = Number(options[0] ?? "0");
  const maxValue = Number(options.at(-1) ?? "0");

  function normalizeValue(rawValue: string) {
    const digitsOnly = rawValue.replace(/\D/g, "").slice(0, maxDigits);

    if (!digitsOnly) {
      return options[0] ?? "0".padStart(maxDigits, "0");
    }

    const boundedValue = Math.min(maxValue, Math.max(minValue, Number(digitsOnly)));
    return boundedValue.toString().padStart(maxDigits, "0");
  }

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

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
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

  function handleInputChange(nextValue: string) {
    onChange(normalizeValue(nextValue));
  }

  function stopStepping() {
    if (holdDelayRef.current !== null) {
      window.clearTimeout(holdDelayRef.current);
      holdDelayRef.current = null;
    }

    if (holdIntervalRef.current !== null) {
      window.clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }

  function startStepping(
    event: PointerEvent<HTMLButtonElement>,
    direction: "up" | "down",
    canStep: boolean,
  ) {
    if (!canStep) {
      return;
    }

    event.preventDefault();
    stopStepping();
    handleStep(direction);
    holdDelayRef.current = window.setTimeout(() => {
      holdIntervalRef.current = window.setInterval(() => {
        handleStep(direction);
      }, 90);
    }, 360);
  }

  function handleButtonClick(event: MouseEvent<HTMLButtonElement>, direction: "up" | "down") {
    if (event.detail === 0) {
      handleStep(direction);
    }
  }

  useEffect(() => {
    return () => {
      stopStepping();
    };
  }, []);

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
        onClick={(event) => handleButtonClick(event, "up")}
        onPointerCancel={stopStepping}
        onPointerDown={(event) => startStepping(event, "up", canIncrease)}
        onPointerLeave={stopStepping}
        onPointerUp={stopStepping}
        type="button"
      >
        <span aria-hidden="true" className="floating-picker-glyph floating-picker-glyph-up" />
      </button>

      <label
        className="floating-picker-trigger"
      >
        <input
          aria-label={`Valor atual de ${label}`}
          className="floating-picker-input"
          inputMode="numeric"
          onChange={(event) => handleInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          pattern="[0-9]*"
          type="text"
          value={value}
        />
        <span className="floating-picker-unit">{label}</span>
      </label>

      <button
        aria-label={`Diminuir ${label}`}
        className="floating-picker-arrow"
        disabled={!canDecrease}
        onClick={(event) => handleButtonClick(event, "down")}
        onPointerCancel={stopStepping}
        onPointerDown={(event) => startStepping(event, "down", canDecrease)}
        onPointerLeave={stopStepping}
        onPointerUp={stopStepping}
        type="button"
      >
        <span aria-hidden="true" className="floating-picker-glyph floating-picker-glyph-down" />
      </button>
    </div>
  );
}
