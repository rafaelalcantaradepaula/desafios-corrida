import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { loginAdmin, logoutAdmin } from "@/lib/auth";
import { useAuthSession } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading: isSessionLoading, setAuthenticatedUser, user } = useAuthSession();
  const { showToast } = useToast();
  const [email, setEmail] = useState("admin@desafioscorrida.local");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const redirectTo = searchParams.get("redirect") || "/admin";
  const destinationLabel = redirectTo === "/admin" ? "Painel administrativo" : "Fluxo protegido";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await loginAdmin(email, password);
      setAuthenticatedUser(response.user);
      setPassword("");
      showToast("Sessao iniciada.", "success");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Falha inesperada ao autenticar.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    setIsLoading(true);

    try {
      await logoutAdmin();
      setAuthenticatedUser(null);
      showToast("Sessao encerrada.", "success");
    } catch {
      showToast("Nao foi possivel encerrar a sessao atual.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="screen-stack">
      <section className="summary-card summary-card-compact">
        <p className="card-kicker">Autenticacao</p>
        <h2 className="screen-title">Acesso administrativo</h2>
        <div className="summary-strip">
          <div className="summary-pill">
            <span className="summary-pill-label">Destino</span>
            <strong className="summary-pill-value">{destinationLabel}</strong>
          </div>
          <div className="summary-pill">
            <span className="summary-pill-label">Sessao</span>
            <strong className="summary-pill-value">
              {isSessionLoading ? "Verificando" : user ? "Ativa" : "Inativa"}
            </strong>
          </div>
        </div>
      </section>

      <section className="form-card">
        {user ? (
          <div className="form-stack">
            <div className="session-badge">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>

            <div className="actions-row">
              <Link className="button button-primary" to={redirectTo}>
                Continuar
              </Link>
              <button
                className="button button-secondary"
                disabled={isLoading}
                onClick={handleLogout}
                type="button"
              >
                Encerrar sessao
              </button>
            </div>
          </div>
        ) : (
          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-grid form-grid-single">
              <label className="field-group">
                <span className="field-label">Email</span>
                <input
                  className="field-input"
                  autoComplete="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@desafios.com"
                  type="email"
                  value={email}
                />
              </label>

              <label className="field-group">
                <span className="field-label">Senha</span>
                <input
                  className="field-input"
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Digite sua senha"
                  type="password"
                  value={password}
                />
              </label>
            </div>

            <button
              className="button button-primary"
              disabled={isLoading || isSessionLoading}
              type="submit"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        )}

        <div className="actions-row">
          <Link className="button button-secondary" to="/">
            Voltar para a home
          </Link>
        </div>
      </section>
    </div>
  );
}
