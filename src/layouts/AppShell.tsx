import { NavLink, Outlet } from "react-router-dom";

function navClassName(isActive: boolean) {
  return isActive ? "bottom-nav-link bottom-nav-link-active" : "bottom-nav-link";
}

export default function AppShell() {
  return (
    <div className="app-shell">
      <div className="ambient-orb ambient-orb-left" />
      <div className="ambient-orb ambient-orb-right" />

      <div className="app-frame">
        <header className="topbar">
          <div>
            <p className="eyebrow">Fase 2</p>
            <h1 className="brand-title">Desafios de corrida</h1>
          </div>

          <div className="status-pill">Base tecnica pronta</div>
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
          <NavLink className={({ isActive }) => navClassName(isActive)} to="/login">
            Admin
          </NavLink>
        </nav>
      </div>
    </div>
  );
}

