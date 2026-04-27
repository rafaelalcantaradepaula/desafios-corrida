export default function LoginPage() {
  return (
    <div className="screen-stack">
      <section className="summary-card">
        <p className="card-kicker">Autenticacao</p>
        <h2 className="screen-title">Acesso administrativo</h2>
        <p className="screen-subtitle">
          Esta tela ja representa o fluxo que sera conectado ao Better Auth na
          fase 3.
        </p>
      </section>

      <section className="form-card">
        <div className="form-grid form-grid-single">
          <label className="field-group">
            <span className="field-label">Email</span>
            <input
              className="field-input"
              autoComplete="email"
              placeholder="admin@desafios.com"
              type="email"
            />
          </label>

          <label className="field-group">
            <span className="field-label">Senha</span>
            <input
              className="field-input"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              type="password"
            />
          </label>
        </div>

        <button className="button button-primary" type="button">
          Entrar
        </button>

        <p className="support-text">
          Stub visual da fase 2. A autenticacao real entra na fase 3 com sessao
          segura em cookie HTTP-only.
        </p>
      </section>
    </div>
  );
}

