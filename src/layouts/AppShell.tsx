import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuthSession } from "@/lib/auth-context";

function navClassName(isActive: boolean) {
  return isActive ? "bottom-nav-link bottom-nav-link-active" : "bottom-nav-link";
}

export default function AppShell() {
  const { user } = useAuthSession();
  const adminTarget = user ? "/admin" : "/login";

  return (
    <div className="app-shell">
      <div className="ambient-orb ambient-orb-left" />
      <div className="ambient-orb ambient-orb-right" />

      <div className="app-frame">
        <header className="topbar">
          <div>
            <p className="eyebrow">{user ? "Admin ativo" : "Modo publico"}</p>
            <h1 className="brand-title">Desafios de corrida</h1>
            <p className="topbar-note">
              {user
                ? "Painel liberado para criar desafios e completar lancamentos."
                : "Acompanhe o ranking ao vivo e entre apenas para operacoes administrativas."}
            </p>
          </div>

          <div className="topbar-actions">
            <div className="status-pill">
              {user ? "Sessao administrativa ativa" : "Base tecnica pronta"}
            </div>
            <Link className="button button-secondary button-compact" to={adminTarget}>
              {user ? "Abrir painel" : "Entrar"}
            </Link>
          </div>
        </header>

        <main className="screen">
          <Outlet />
        </main>

        <nav className="bottom-nav" aria-label="Navegacao principal">
          <NavLink className={({ isActive }) => navClassName(isActive)} end to="/">
            Inicio
          </NavLink>
          <NavLink
            className={({ isActive }) => navClassName(isActive)}
            to="/challenges/orla-5k"
          >
            Desafio
          </NavLink>
          <NavLink className={({ isActive }) => navClassName(isActive)} to={adminTarget}>
            Admin
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
