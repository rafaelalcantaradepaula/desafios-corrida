import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuthSession } from "@/lib/auth-context";

function navClassName(isActive: boolean) {
  return isActive ? "bottom-nav-link bottom-nav-link-active" : "bottom-nav-link";
}

function HomeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="bottom-nav-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg
      aria-hidden="true"
      className="bottom-nav-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M6 21V4m0 0h9l-1.8 3L15 10H6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      aria-hidden="true"
      className="bottom-nav-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 3 5 6v5.4c0 4.5 2.9 7.9 7 9.6 4.1-1.7 7-5.1 7-9.6V6z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="m9.6 12 1.7 1.8 3.2-3.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
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
            <HomeIcon />
            <span className="bottom-nav-label">Inicio</span>
          </NavLink>
          <NavLink
            className={({ isActive }) => navClassName(isActive)}
            to="/challenges"
          >
            <FlagIcon />
            <span className="bottom-nav-label">Desafios</span>
          </NavLink>
          <NavLink className={({ isActive }) => navClassName(isActive)} to={user ? "/admin" : "/login"}>
            <ShieldIcon />
            <span className="bottom-nav-label">Admin</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
