import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuthSession } from "@/lib/auth-context";

function navClassName(isActive: boolean) {
  return isActive ? "bottom-nav-link bottom-nav-link-active" : "bottom-nav-link";
}

export default function AppShell() {
  const location = useLocation();
  const { user } = useAuthSession();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="app-shell">
      <div className="ambient-orb ambient-orb-left" />
      <div className="ambient-orb ambient-orb-right" />

      <div className="app-frame">
        <header className="topbar">
          <div>
            <h1 className="brand-title">Desafios de corrida</h1>
          </div>

          {isAdminRoute && user ? <p className="topbar-user">{user.name}</p> : null}
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
            to="/challenges"
          >
            Desafios
          </NavLink>
          <NavLink className={({ isActive }) => navClassName(isActive)} to={user ? "/admin" : "/login"}>
            Admin
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
