import { FormEvent, useEffect, useState } from "react";
import { getAdminSession, loginAdmin, logoutAdmin } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@desafioscorrida.local");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sessionMessage, setSessionMessage] = useState("Verificando sessao...");

  useEffect(() => {
    let isMounted = true;

    void getAdminSession()
      .then(({ user }) => {
        if (isMounted) {
          setSessionMessage(`Sessao ativa para ${user.email}.`);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSessionMessage("Nenhuma sessao administrativa ativa.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await loginAdmin(email, password);
      setSessionMessage(`Sessao iniciada para ${response.user.email}.`);
      setPassword("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? "Nao foi possivel autenticar com as credenciais informadas."
          : "Falha inesperada ao autenticar.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      await logoutAdmin();
      setSessionMessage("Sessao encerrada.");
    } catch {
      setErrorMessage("Nao foi possivel encerrar a sessao atual.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="screen-stack">
      <section className="summary-card">
        <p className="card-kicker">Autenticacao</p>
        <h2 className="screen-title">Acesso administrativo</h2>
        <p className="screen-subtitle">
          A fase 3 conecta esta tela ao backend com sessao em cookie HTTP-only.
        </p>
      </section>

      <section className="form-card">
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

          <button className="button button-primary" disabled={isLoading} type="submit">
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <button className="button button-secondary" onClick={handleLogout} type="button">
          Encerrar sessao
        </button>

        <p className="support-text">
          Credencial inicial de bootstrap: `admin@desafioscorrida.local`. A senha
          inicial esta documentada no guia operacional da fase 3 e deve ser
          trocada apos o primeiro acesso.
        </p>

        <p className="support-text">{sessionMessage}</p>

        {errorMessage ? (
          <p className="support-text support-text-error">{errorMessage}</p>
        ) : null}
      </section>
    </div>
  );
}
