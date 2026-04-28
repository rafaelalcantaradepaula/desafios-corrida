import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ApiError } from "./api";
import {
  getAdminSession,
  logoutAdmin,
  type SessionUser,
} from "./auth";

const ADMIN_IDLE_TIMEOUT_MS = 1000 * 60 * 5;
const SESSION_REFRESH_INTERVAL_MS = 1000 * 60;

type AuthContextValue = {
  isLoading: boolean;
  user: SessionUser | null;
  setAuthenticatedUser: (user: SessionUser | null) => void;
  refreshSession: (options?: { background?: boolean }) => Promise<SessionUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const idleTimeoutRef = useRef<number | null>(null);
  const lastActivityAtRef = useRef(Date.now());
  const lastRefreshAtRef = useRef(0);

  const clearIdleTimer = useCallback(() => {
    if (idleTimeoutRef.current !== null) {
      window.clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  }, []);

  const performIdleLogout = useCallback(async () => {
    clearIdleTimer();

    try {
      await logoutAdmin();
    } catch {
      // Best effort logout. Local state still needs to clear.
    }

    setUser(null);
  }, [clearIdleTimer]);

  const scheduleIdleLogout = useCallback(() => {
    clearIdleTimer();

    if (!user) {
      return;
    }

    const inactivityFor = Date.now() - lastActivityAtRef.current;
    const remainingMs = Math.max(0, ADMIN_IDLE_TIMEOUT_MS - inactivityFor);

    idleTimeoutRef.current = window.setTimeout(() => {
      void performIdleLogout();
    }, remainingMs);
  }, [clearIdleTimer, performIdleLogout, user]);

  const markActivity = useCallback(() => {
    lastActivityAtRef.current = Date.now();
    scheduleIdleLogout();
  }, [scheduleIdleLogout]);

  async function refreshSession(options?: { background?: boolean }) {
    const isBackground = options?.background ?? false;

    if (!isBackground) {
      setIsLoading(true);
    }

    try {
      const response = await getAdminSession();
      setUser(response.user);
      lastActivityAtRef.current = Date.now();
      lastRefreshAtRef.current = Date.now();
      scheduleIdleLogout();
      return response.user;
    } catch (error) {
      if (!isBackground || (error instanceof ApiError && error.status === 401)) {
        setUser(null);
        clearIdleTimer();
      }

      return null;
    } finally {
      if (!isBackground) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    void refreshSession();
  }, []);

  useEffect(() => {
    if (!user) {
      clearIdleTimer();
      return;
    }

    markActivity();

    function handleActivity() {
      markActivity();
    }

    const activityEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "scroll",
      "touchstart",
      "mousemove",
    ];

    for (const eventName of activityEvents) {
      window.addEventListener(eventName, handleActivity, { passive: true });
    }

    const heartbeatInterval = window.setInterval(() => {
      const now = Date.now();
      const isIdleExpired = now - lastActivityAtRef.current >= ADMIN_IDLE_TIMEOUT_MS;
      const canRefresh = now - lastRefreshAtRef.current >= SESSION_REFRESH_INTERVAL_MS;

      if (isIdleExpired) {
        void performIdleLogout();
        return;
      }

      if (canRefresh) {
        void refreshSession({ background: true });
      }
    }, SESSION_REFRESH_INTERVAL_MS);

    return () => {
      clearIdleTimer();
      window.clearInterval(heartbeatInterval);

      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, handleActivity);
      }
    };
  }, [clearIdleTimer, markActivity, performIdleLogout, user]);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        user,
        setAuthenticatedUser: setUser,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthSession must be used within AuthProvider.");
  }

  return context;
}

