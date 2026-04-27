import { createBrowserRouter } from "react-router-dom";
import RequireAdmin from "@/components/RequireAdmin";
import AppShell from "@/layouts/AppShell";
import AdminPage from "@/pages/AdminPage";
import ChallengePage from "@/pages/ChallengePage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";
import TeamPage from "@/pages/TeamPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "challenges/:challengeId",
        element: <ChallengePage />,
      },
      {
        path: "teams/:challengeTeamId",
        element: <TeamPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "admin",
        element: (
          <RequireAdmin>
            <AdminPage />
          </RequireAdmin>
        ),
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
