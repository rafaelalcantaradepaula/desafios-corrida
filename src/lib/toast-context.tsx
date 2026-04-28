import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type ToastTone = "neutral" | "success" | "error";

type ToastRecord = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timeoutRegistryRef = useRef<Record<number, number>>({});
  const nextIdRef = useRef(1);

  function dismissToast(toastId: number) {
    const timeoutId = timeoutRegistryRef.current[toastId];

    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      delete timeoutRegistryRef.current[toastId];
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
  }

  function showToast(message: string, tone: ToastTone = "neutral") {
    const toastId = nextIdRef.current;
    nextIdRef.current += 1;

    setToasts((currentToasts) => [
      ...currentToasts,
      {
        id: toastId,
        message,
        tone,
      },
    ]);

    timeoutRegistryRef.current[toastId] = window.setTimeout(() => {
      dismissToast(toastId);
    }, 2800);
  }

  useEffect(() => {
    return () => {
      for (const timeoutId of Object.values(timeoutRegistryRef.current)) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div aria-atomic="true" aria-live="polite" className="toast-viewport">
        {toasts.map((toast) => (
          <button
            className={`toast toast-${toast.tone}`}
            key={toast.id}
            onClick={() => dismissToast(toast.id)}
            type="button"
          >
            {toast.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
