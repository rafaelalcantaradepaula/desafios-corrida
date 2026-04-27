import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthSession } from "@/lib/auth-context";

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isLoading, user } = useAuthSession();

  if (isLoading) {
    return (
      <section className="empty-state">
        <h2 className="section-title">Validando sessao</h2>
        <p className="screen-subtitle">
          Aguarde enquanto a area administrativa confirma suas credenciais.
        </p>
      </section>
    );
  }

  if (!user) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate replace to={`/login?redirect=${encodeURIComponent(redirect)}`} />;
  }

  return <>{children}</>;
}

