import { useEffect, useRef, useState } from "react";

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const selectedOption = menuRef.current?.querySelector<HTMLButtonElement>(
      `[data-option="${value}"]`,
    );

    selectedOption?.scrollIntoView({
      block: "center",
    });
  }, [isOpen, value]);

  return (
    <div className="floating-picker" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="floating-picker-trigger"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        type="button"
      >
        <span className="floating-picker-value">{value}</span>
        <span className="floating-picker-unit">{label}</span>
      </button>

      {isOpen ? (
        <div
          aria-label={label}
          className="floating-picker-menu"
          ref={menuRef}
          role="listbox"
        >
          {options.map((option) => {
            const isSelected = option === value;

            return (
              <button
                className={
                  isSelected
                    ? "floating-picker-option floating-picker-option-selected"
                    : "floating-picker-option"
                }
                data-option={option}
                key={`${label}-${option}`}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                role="option"
                type="button"
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
